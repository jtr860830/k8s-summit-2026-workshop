#!/usr/bin/env python3
"""day-0 step 8 (part 1): generate the Hardware object for a management node.

Management nodes skip the match-all enrollment rule and are pre-registered instead:
fixed IP plus a role label, so CAPT can pick them by label (hardwareAffinity).

Usage: python3 gen-mgmt-hardware.py <idx:1-3> <mac> | kubectl apply -f -
IP/hostname derive from idx (172.16.91.2X / mgmt-X) and must match the DHCP static lease
(tootles matches boot config by source IP, so all three views have to agree).
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
        # agentID is required: tink-server matches the agent on it; without it auto-discovery
        # registers the host again as new (duplicate MAC -> smee stops answering)
        "agentID": mac,
        # Required by CAPT: metadata.instance.id becomes device_1 in the workflow
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
