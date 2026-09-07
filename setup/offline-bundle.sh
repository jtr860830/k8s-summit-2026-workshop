#!/usr/bin/env bash
# 講師用：產生 USB 備援包（給現場沒完成前置作業的學員）
# 內容：映像檔 tar、CAPI provider 離線倉庫、三平台工具 binary、kro chart、repo 快照、sha256 清單
# 用法：./setup/offline-bundle.sh /path/to/usb-dir
set -euo pipefail
cd "$(dirname "$0")"
source ./versions.env
OUT="${1:?用法：offline-bundle.sh <輸出目錄>}"
mkdir -p "${OUT}/bin"/{linux-amd64,darwin-amd64,darwin-arm64}

echo "==> 映像檔（沿用本機快取，缺少會先 pull）"
IMAGES=("${KINDEST_NODE_IMAGE}" "${KRO_IMAGE}" "${CAPI_IMAGES[@]}")
for img in "${IMAGES[@]}"; do docker image inspect "${img}" >/dev/null 2>&1 || docker pull -q "${img}"; done
# Docker 29 的 containerd store 會把 attestation manifest 一起存進 tar，之後 kind load 會失敗 —— 指定平台
ARCH=$(docker version --format '{{.Server.Arch}}')
docker save --platform "linux/${ARCH}" -o "${OUT}/images.tar" "${IMAGES[@]}" 2>/dev/null \
  || docker save -o "${OUT}/images.tar" "${IMAGES[@]}"

echo "==> Cluster API provider 離線倉庫（沿用 setup.sh 的快取）"
CAPI_REPO="${HOME}/.summit-workshop/capi-repo"
[ -d "${CAPI_REPO}/cluster-api" ] || { echo "找不到 ${CAPI_REPO} —— 請先在本機跑過 setup.sh"; exit 1; }
rm -rf "${OUT}/capi-repo" && cp -r "${CAPI_REPO}" "${OUT}/capi-repo"

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
