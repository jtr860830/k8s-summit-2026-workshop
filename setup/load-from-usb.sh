#!/usr/bin/env bash
# 學員用（現場備援）：從 USB 備援包載入環境，效果等同跑過 setup.sh
# 用法：./setup/load-from-usb.sh /path/to/usb-dir
set -euo pipefail
cd "$(dirname "$0")"
source ./versions.env
SRC="${1:?用法：load-from-usb.sh <USB 目錄>}"
CACHE_DIR="${HOME}/.summit-workshop"
mkdir -p "${CACHE_DIR}"

echo "==> 校驗檔案完整性"
( cd "${SRC}" && shasum -a 256 -c SHA256SUMS --quiet ) && echo " ✓ 校驗通過"

case "$(uname)-$(uname -m)" in
  Linux-x86_64) PLAT=linux-amd64 ;;
  Darwin-x86_64) PLAT=darwin-amd64 ;;
  Darwin-arm64) PLAT=darwin-arm64 ;;
  *) echo "不支援的平台：$(uname)-$(uname -m)"; exit 1 ;;
esac

echo "==> 安裝工具（${PLAT}，需要 sudo）"
for t in kind clusterctl kubectl helm; do
  command -v "${t}" >/dev/null 2>&1 || sudo install "${SRC}/bin/${PLAT}/${t}" /usr/local/bin/
done

echo "==> 載入映像檔"
docker load -i "${SRC}/images.tar"
cp "${SRC}/images.tar" "${CACHE_DIR}/images.tar"
cp "${SRC}/kro-${KRO_VERSION}.tgz" "${CACHE_DIR}/"

echo "SETUP-OK（USB 備援路徑）—— 可以開始第一幕了。"
