#!/usr/bin/env python3
"""day-0 第 8 步（其一）：產生管理節點的 Hardware。

管理節點不走 match-all 上架規則，而是預先登記：固定 IP、貼上角色標籤，
讓 CAPT 之後用標籤挑機器（hardwareAffinity）。

用法: python3 gen-mgmt-hardware.py <idx:1-3> <mac> | kubectl apply -f -
IP/主機名由 idx 推導（172.16.91.2X / mgmt-X），需與 DHCP 靜態租約一致
（tootles 按來源 IP 配對開機設定，三方視圖必須對齊）。
"""
import sys
import yaml

idx, mac = int(sys.argv[1]), sys.argv[2]
hw = {
    "apiVersion": "tinkerbell.org/v1alpha1",
    "kind": "Hardware",
    "metadata": {
        "name": f"mgmt-{idx}",
        "namespace": "tinkerbell",
        "labels": {"day0/role": "mgmt"},
    },
    "spec": {
        # agentID 必要：tink-server 以此配對 agent，缺了會被 auto-discovery
        # 當成新機器再登記一次（同 MAC 重複 → smee 放棄回應）
        "agentID": mac,
        # CAPT 必要：metadata.instance.id 會被當成 workflow 的 device_1
        "metadata": {
            "instance": {
                "id": mac,
                "hostname": f"mgmt-{idx}",
            },
        },
        "disks": [{"device": "/dev/sda"}],
        "interfaces": [{
            "dhcp": {
                "mac": mac,
                "ip": {
                    "address": f"172.16.91.2{idx}",
                    "netmask": "255.255.255.0",
                    "gateway": "172.16.91.2",
                },
                "name_servers": ["8.8.8.8"],
                "hostname": f"mgmt-{idx}",
                "uefi": True,
                "arch": "x86_64",
                "lease_time": 86400,
            },
            "netboot": {"allowPXE": True, "allowWorkflow": True},
        }],
    },
}
print(yaml.safe_dump(hw, sort_keys=False))
