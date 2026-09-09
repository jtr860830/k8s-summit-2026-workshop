#!/usr/bin/env python3
"""day-0 step 4: generate the install Template.

Three actions: write the OS image to disk -> write the Ignition config to the OEM partition -> reboot.
The worker field is "{{.worker_id}}", filled in by the WorkflowRuleSet when a new machine matches.

Usage: python3 gen-template.py <path to config.ign> | kubectl apply -f -
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
                # Flatcar's OEM partition is /dev/sda6 (btrfs); config.ign is read at boot
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
                # waitdaemon: report completion to tink-server first, then reboot (otherwise the report never leaves)
                # 45 s buffer: gives the post-install step time to flip allowPXE off so the reboot lands on disk
                "name": "reboot",
                "image": "ghcr.io/jacobweinstock/waitdaemon:latest",
                "timeout": 90,
                "pid": "host",
                "command": ["reboot"],
                "environment": {"IMAGE": "alpine", "WAIT_SECONDS": "45"},
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
