#!/usr/bin/env python3
"""day-0 第 4 步：產生安裝範本（Template）。

流程三個動作：把 OS 映像寫進磁碟 → 把 Ignition 設定寫進 OEM 分割區 → 重開機。
worker 欄位用 "{{.worker_id}}" —— 由 WorkflowRuleSet 匹配到新機器時自動填入。

用法: python3 gen-template.py <config.ign 路徑> | kubectl apply -f -
"""
import sys
import yaml

ARTIFACTS = "http://172.16.91.4:7173"

with open(sys.argv[1]) as f:
    ignition = f.read()

template_inner = {
    "version": "0.1",
    "name": "flatcar-install",
    "global_timeout": 1800,
    "tasks": [{
        "name": "os-installation",
        "worker": "{{.worker_id}}",
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
                # Flatcar 的 OEM 分割區是 /dev/sda6（btrfs），開機時讀 config.ign
                "name": "write-ignition",
                "image": "quay.io/tinkerbell/actions/writefile:latest",
                "timeout": 90,
                "environment": {
                    "DEST_DISK": "/dev/sda6",
                    "FS_TYPE": "btrfs",
                    "DEST_PATH": "/config.ign",
                    "CONTENTS": ignition,
                    "UID": "0", "GID": "0", "MODE": "0644", "DIRMODE": "0755",
                },
            },
            {
                # waitdaemon：先向 tink-server 回報完成、再重開機（否則回報不出去）
                "name": "reboot",
                "image": "ghcr.io/jacobweinstock/waitdaemon:latest",
                "timeout": 90,
                "pid": "host",
                "command": ["reboot"],
                "environment": {"IMAGE": "alpine", "WAIT_SECONDS": "10"},
                "volumes": ["/var/run/docker.sock:/var/run/docker.sock"],
            },
        ],
    }],
}

template = {
    "apiVersion": "tinkerbell.org/v1alpha1",
    "kind": "Template",
    "metadata": {"name": "flatcar-install", "namespace": "tinkerbell"},
    "spec": {"data": yaml.safe_dump(template_inner, sort_keys=False)},
}

print(yaml.safe_dump(template, sort_keys=False))
