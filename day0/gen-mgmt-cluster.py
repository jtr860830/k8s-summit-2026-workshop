#!/usr/bin/env python3
"""day-0 第 8 步（其二）：產生管理叢集的 Cluster API 定義（Flatcar 路徑）。

與 CAPT 原生路徑的差異：
- TinkerbellCluster.spec.templateOverride = 我們的 Flatcar 安裝流程
  （image2disk → 寫 OEM stub → 回報後重開機）
- KubeadmControlPlane 的 format: ignition —— bootstrap 設定用 Ignition 格式產生
- kube-vip 用靜態 Pod manifest 提供控制平面 VIP（Flatcar 跑不了
  CAPT 預設的 ctr 生成指令），先用 super-admin.conf 避開 kubeadm 1.29+
  的權限死鎖，裝完再換回 admin.conf

用法: python3 gen-mgmt-cluster.py <name> <replicas> <oem-stub.json 路徑> <ssh 公鑰> | kubectl apply -f -
"""
import sys
import yaml

NAME, REPLICAS, STUB_PATH, PUB = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
ARTIFACTS = "http://172.16.91.4:7173"
VIP = "172.16.91.5"
K8S_VERSION = "v1.34.6"

with open(STUB_PATH) as f:
    stub = f.read()

override_inner = {
    "version": "0.1",
    "name": f"{NAME}-flatcar",
    "global_timeout": 1800,
    "tasks": [{
        "name": "os-installation",
        "worker": "{{.device_1}}",
        "volumes": ["/dev:/dev", "/dev/console:/dev/console", "/lib/firmware:/lib/firmware:ro"],
        "actions": [
            {
                "name": "write-image",
                "image": "quay.io/tinkerbell/actions/image2disk:latest",
                "timeout": 600,
                "environment": {
                    "DEST_DISK": "/dev/sda",
                    "IMG_URL": f"{ARTIFACTS}/flatcar_production_image.bin.gz",
                    "COMPRESSED": "true",
                },
            },
            {
                # Flatcar 的 OEM 分割區是 /dev/sda6（btrfs），開機讀 config.ign
                "name": "write-oem-stub",
                "image": "quay.io/tinkerbell/actions/writefile:latest",
                "timeout": 90,
                "environment": {
                    "DEST_DISK": "/dev/sda6",
                    "FS_TYPE": "btrfs",
                    "DEST_PATH": "/config.ign",
                    "CONTENTS": stub,
                    "UID": "0", "GID": "0", "MODE": "0644", "DIRMODE": "0755",
                },
            },
            {
                "name": "reboot",
                "image": "ghcr.io/jacobweinstock/waitdaemon:latest",
                "timeout": 90,
                "pid": "host",
                "command": ["reboot"],
                # 45 秒：等 controller 先關掉這台的 PXE 再重開（10 秒會輸掉競態）
                "environment": {"IMAGE": "alpine", "WAIT_SECONDS": "45"},
                "volumes": ["/var/run/docker.sock:/var/run/docker.sock"],
            },
        ],
    }],
}

KUBE_VIP_MANIFEST = f"""apiVersion: v1
kind: Pod
metadata:
  name: kube-vip
  namespace: kube-system
spec:
  hostNetwork: true
  containers:
    - name: kube-vip
      image: ghcr.io/kube-vip/kube-vip:v1.0.0
      imagePullPolicy: IfNotPresent
      args:
        - manager
        - --address={VIP}
        - --port=6443
        - --arp
        - --leaderElection
        - --controlplane
        - --k8sConfigPath=/etc/kubernetes/admin.conf
      securityContext:
        capabilities:
          add: ["NET_ADMIN", "NET_RAW"]
      volumeMounts:
        - {{name: kubeconfig, mountPath: /etc/kubernetes/admin.conf}}
  volumes:
    - name: kubeconfig
      hostPath:
        path: /etc/kubernetes/super-admin.conf
"""

kubeadm_config_spec = {
    "format": "ignition",
    "initConfiguration": {
        "nodeRegistration": {"kubeletExtraArgs": {"provider-id": "PROVIDER_ID"}},
    },
    "joinConfiguration": {
        "nodeRegistration": {
            "ignorePreflightErrors": ["DirAvailable--etc-kubernetes-manifests"],
            "kubeletExtraArgs": {"provider-id": "PROVIDER_ID"},
        },
    },
    "files": [{
        "path": "/etc/kubernetes/manifests/kube-vip.yaml",
        "owner": "root:root",
        "permissions": "0644",
        "content": KUBE_VIP_MANIFEST,
    }],
    "preKubeadmCommands": [
        # kube-vip 在 VIP 未就緒時會退到 https://kubernetes:6443 ——
        # 原廠 Flatcar 沒有這條 hosts 紀錄，要自己補
        "grep -q ' kubernetes' /etc/hosts || echo '127.0.0.1 kubernetes' >> /etc/hosts",
        "kubeadm config images pull",
    ],
    "postKubeadmCommands": [
        "sed -i 's#path: /etc/kubernetes/super-admin.conf#path: /etc/kubernetes/admin.conf#' /etc/kubernetes/manifests/kube-vip.yaml || true",
        # join 節點沒有 super-admin.conf，kubelet 會建出空目錄，之後憑證換發會炸
        "[ -d /etc/kubernetes/super-admin.conf ] && rmdir /etc/kubernetes/super-admin.conf || true",
    ],
    "users": [{"name": "debug", "sshAuthorizedKeys": [PUB], "sudo": "ALL=(ALL) NOPASSWD:ALL"}],
}

docs = [
    {
        "apiVersion": "cluster.x-k8s.io/v1beta1",
        "kind": "Cluster",
        "metadata": {"name": NAME, "namespace": "default"},
        "spec": {
            "clusterNetwork": {
                "pods": {"cidrBlocks": ["10.44.0.0/16"]},
                "services": {"cidrBlocks": ["10.45.0.0/16"]},
            },
            "controlPlaneEndpoint": {"host": VIP, "port": 6443},
            "controlPlaneRef": {
                "apiVersion": "controlplane.cluster.x-k8s.io/v1beta1",
                "kind": "KubeadmControlPlane", "name": f"{NAME}-cp",
            },
            "infrastructureRef": {
                "apiVersion": "infrastructure.cluster.x-k8s.io/v1beta1",
                "kind": "TinkerbellCluster", "name": NAME,
            },
        },
    },
    {
        "apiVersion": "infrastructure.cluster.x-k8s.io/v1beta1",
        "kind": "TinkerbellCluster",
        "metadata": {"name": NAME, "namespace": "default"},
        "spec": {
            "controlPlaneEndpoint": {"host": VIP, "port": 6443},
            "templateOverride": yaml.safe_dump(override_inner, sort_keys=False),
        },
    },
    {
        "apiVersion": "controlplane.cluster.x-k8s.io/v1beta1",
        "kind": "KubeadmControlPlane",
        "metadata": {"name": f"{NAME}-cp", "namespace": "default"},
        "spec": {
            "replicas": REPLICAS,
            "version": K8S_VERSION,
            "machineTemplate": {
                "infrastructureRef": {
                    "apiVersion": "infrastructure.cluster.x-k8s.io/v1beta1",
                    "kind": "TinkerbellMachineTemplate", "name": f"{NAME}-cp",
                },
            },
            "kubeadmConfigSpec": kubeadm_config_spec,
        },
    },
    {
        "apiVersion": "infrastructure.cluster.x-k8s.io/v1beta1",
        "kind": "TinkerbellMachineTemplate",
        "metadata": {"name": f"{NAME}-cp", "namespace": "default"},
        "spec": {
            "template": {
                "spec": {
                    "hardwareAffinity": {
                        "required": [{"labelSelector": {"matchLabels": {"day0/role": "mgmt"}}}],
                    },
                },
            },
        },
    },
]

print(yaml.safe_dump_all(docs, sort_keys=False))
