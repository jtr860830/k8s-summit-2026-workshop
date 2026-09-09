#!/usr/bin/env python3
"""day-0 step 8 (part 2): generate the Cluster API definition for the management cluster (Flatcar path).

Differences from the stock CAPT path:
- TinkerbellCluster.spec.templateOverride = our Flatcar install workflow
  (image2disk -> write OEM stub -> report, then reboot)
- KubeadmControlPlane uses format: ignition, so bootstrap data is rendered as Ignition
- kube-vip runs as a static Pod manifest for the control-plane VIP (Flatcar cannot run
  the ctr command CAPT generates by default); it starts on super-admin.conf to dodge the
  kubeadm 1.29+ RBAC deadlock and is switched back to admin.conf after install

Usage: python3 gen-mgmt-cluster.py <name> <replicas> <path to oem-stub.json> <ssh pubkey> | kubectl apply -f -
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
                # Flatcar's OEM partition is /dev/sda6 (btrfs); config.ign is read at boot
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
                # 45 s: give the controller time to disable PXE for this host before rebooting (10 s loses the race)
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
        # kube-vip falls back to https://kubernetes:6443 while the VIP is not up;
        # stock Flatcar has no such hosts entry, so add it
        "grep -q ' kubernetes' /etc/hosts || echo '127.0.0.1 kubernetes' >> /etc/hosts",
        "kubeadm config images pull",
    ],
    "postKubeadmCommands": [
        "sed -i 's#path: /etc/kubernetes/super-admin.conf#path: /etc/kubernetes/admin.conf#' /etc/kubernetes/manifests/kube-vip.yaml || true",
        # joining nodes have no super-admin.conf; kubelet creates an empty directory that breaks later cert renewal
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
