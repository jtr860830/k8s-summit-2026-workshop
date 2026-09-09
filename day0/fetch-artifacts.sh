#!/usr/bin/env bash
# day-0 step 3: fetch the OS image and the kubelet sysext, place them on the image server.
# /tmp is the hookos artifacts directory of the Tinkerbell chart (nginx root);
# the install workflow later pulls them from http://172.16.91.4:7173/
set -euo pipefail
: "${K8S_SYSEXT_VERSION:=v1.34.6}"
FLATCAR_BASE="https://stable.release.flatcar-linux.net/amd64-usr/current"
command -v bunzip2 >/dev/null || sudo apt-get install -y -qq bzip2
cd /tmp

# Flatcar stable image, verified against the official SHA512 digest
if [ ! -f flatcar_production_image.bin.gz ]; then
  curl -fLO "$FLATCAR_BASE/flatcar_production_image.bin.bz2"
  curl -fLO "$FLATCAR_BASE/flatcar_production_image.bin.bz2.DIGESTS"
  EXPECTED=$(awk '/SHA512/{getline; if ($2=="flatcar_production_image.bin.bz2") print $1}' \
    flatcar_production_image.bin.bz2.DIGESTS | head -1)
  ACTUAL=$(sha512sum flatcar_production_image.bin.bz2 | awk '{print $1}')
  [ "$EXPECTED" = "$ACTUAL" ] || { echo "FATAL: SHA512 驗證失敗"; exit 1; }
  echo "Flatcar image SHA512 OK"
  bunzip2 -f flatcar_production_image.bin.bz2 && gzip -f flatcar_production_image.bin
fi

# kubelet sysext: the overlay image that gives a Flatcar node its kubelet
SYSEXT="kubernetes-${K8S_SYSEXT_VERSION}-x86-64.raw"
[ -f "$SYSEXT" ] || curl -fLO "https://extensions.flatcar.org/extensions/${SYSEXT}"

ls -lh flatcar_production_image.bin.gz "${SYSEXT}"
echo "驗證檔案可經映像伺服器取得："
curl -fsI "http://172.16.91.4:7173/flatcar_production_image.bin.gz" | head -1
