#!/usr/bin/env bash
# 講師用：產生 USB 備援包（給現場沒完成前置作業的學員）
# 內容：映像檔 tar、三平台工具 binary、kro chart、repo 快照、sha256 清單
# 用法：./setup/offline-bundle.sh /path/to/usb-dir
set -euo pipefail
cd "$(dirname "$0")"
source ./versions.env
OUT="${1:?用法：offline-bundle.sh <輸出目錄>}"
mkdir -p "${OUT}/bin"/{linux-amd64,darwin-amd64,darwin-arm64}

echo "==> 映像檔（沿用本機快取，缺少會先 pull）"
IMAGES=("${KINDEST_NODE_IMAGE}" "${KRO_IMAGE}" "${CAPI_IMAGES[@]}")
for img in "${IMAGES[@]}"; do docker image inspect "${img}" >/dev/null 2>&1 || docker pull -q "${img}"; done
docker save -o "${OUT}/images.tar" "${IMAGES[@]}"

echo "==> 工具 binary（三平台）"
for plat in linux-amd64 darwin-amd64 darwin-arm64; do
  os="${plat%-*}"; arch="${plat#*-}"
  curl -fsSLo "${OUT}/bin/${plat}/kind"       "https://github.com/kubernetes-sigs/kind/releases/download/${KIND_VERSION}/kind-${os}-${arch}"
  curl -fsSLo "${OUT}/bin/${plat}/clusterctl" "https://github.com/kubernetes-sigs/cluster-api/releases/download/${CLUSTERCTL_VERSION}/clusterctl-${os}-${arch}"
  curl -fsSLo "${OUT}/bin/${plat}/kubectl"    "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/${os}/${arch}/kubectl"
  curl -fsSLo "/tmp/helm-${plat}.tgz"         "https://get.helm.sh/helm-v3.21.4-${os}-${arch}.tar.gz"
  tar -xzf "/tmp/helm-${plat}.tgz" -C /tmp "${os}-${arch}/helm" && mv "/tmp/${os}-${arch}/helm" "${OUT}/bin/${plat}/helm"
  chmod +x "${OUT}/bin/${plat}"/*
done

echo "==> kro chart 與 repo 快照"
helm pull oci://registry.k8s.io/kro/charts/kro --version "${KRO_VERSION}" -d "${OUT}"
git -C .. archive --format=zip -o "${OUT}/workshop-repo.zip" HEAD

echo "==> sha256 清單"
( cd "${OUT}" && find . -type f ! -name SHA256SUMS -exec shasum -a 256 {} \; > SHA256SUMS )
du -sh "${OUT}"
echo "BUNDLE-OK"
