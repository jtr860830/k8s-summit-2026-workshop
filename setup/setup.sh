#!/usr/bin/env bash
# 工作坊一鍵準備腳本：檢查工具鏈 → 預拉全部映像檔 → 產生離線快取 → 自我驗證
# 成功結尾會輸出 SETUP-OK；請務必在工作坊前跑到看見它。
set -euo pipefail
cd "$(dirname "$0")"
source ./versions.env

# sudo 執行時快取仍放原使用者家目錄（否則之後 kind load 找不到）
REAL_HOME="${HOME}"
[ -n "${SUDO_USER:-}" ] && REAL_HOME=$(eval echo "~${SUDO_USER}")
CACHE_DIR="${REAL_HOME}/.summit-workshop"
mkdir -p "${CACHE_DIR}"
FAIL=0

say()  { printf '\033[1;36m==> %s\033[0m\n' "$*"; }
bad()  { printf '\033[1;31m ✗ %s\033[0m\n' "$*"; FAIL=1; }
good() { printf '\033[1;32m ✓ %s\033[0m\n' "$*"; }

say "檢查 Docker"
if docker info >/dev/null 2>&1; then
  CPUS=$(docker info --format '{{.NCPU}}')
  MEM_GB=$(( $(docker info --format '{{.MemTotal}}') / 1073741824 ))
  [ "${CPUS}" -ge 4 ] && good "CPU：${CPUS} 核" || bad "Docker 可用 CPU 只有 ${CPUS} 核（需要 ≥ 4；Docker Desktop 請到 Settings → Resources 調整）"
  [ "${MEM_GB}" -ge 7 ] && good "記憶體：${MEM_GB} GB" || bad "Docker 可用記憶體只有 ${MEM_GB} GB（需要 ≥ 8 GB）"
else
  bad "docker 無法使用 —— 請先安裝並啟動 Docker（見 prereqs.md），再重跑本腳本"
  exit 1
fi

if [ "$(uname)" = "Linux" ]; then
  say "檢查 inotify 限額（kind 多叢集的常見地雷）"
  WATCHES=$(sysctl -n fs.inotify.max_user_watches)
  INSTANCES=$(sysctl -n fs.inotify.max_user_instances)
  if [ "${WATCHES}" -lt 524288 ] || [ "${INSTANCES}" -lt 512 ]; then
    echo "   目前 watches=${WATCHES} instances=${INSTANCES}，偏低 —— 嘗試調高（需要 sudo）："
    sudo sysctl -w fs.inotify.max_user_watches=1048576 fs.inotify.max_user_instances=8192 \
      && printf 'fs.inotify.max_user_watches=1048576\nfs.inotify.max_user_instances=8192\n' | sudo tee /etc/sysctl.d/99-kind.conf >/dev/null \
      && good "已調高並寫入 /etc/sysctl.d/99-kind.conf" \
      || bad "調整失敗 —— 請手動執行：sudo sysctl -w fs.inotify.max_user_watches=1048576 fs.inotify.max_user_instances=8192"
  else
    good "watches=${WATCHES} instances=${INSTANCES}"
  fi
fi

say "檢查工具鏈版本"
check_tool() { # name expected_version version_cmd install_hint
  local name="$1" want="$2" got
  if ! command -v "${name}" >/dev/null 2>&1; then
    bad "${name} 未安裝 —— ${4}"
    return
  fi
  got=$(eval "$3" 2>/dev/null || true)
  case "${got}" in
    *"${want}"*) good "${name} ${want}" ;;
    *) bad "${name} 版本是「${got}」，需要 ${want} —— ${4}" ;;
  esac
}
check_tool kind "${KIND_VERSION}" "kind version | awk '{print \$2}'" \
  "安裝：curl -Lo ./kind https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-\$(uname | tr A-Z a-z)-\$(uname -m | sed s/x86_64/amd64/ | sed s/aarch64/arm64/) && chmod +x ./kind && sudo mv ./kind /usr/local/bin/"
check_tool clusterctl "${CLUSTERCTL_VERSION}" "clusterctl version -o short 2>/dev/null || clusterctl version 2>/dev/null | grep -oE 'v[0-9.]+' | head -1" \
  "安裝：https://github.com/kubernetes-sigs/cluster-api/releases/tag/${CLUSTERCTL_VERSION}"
check_tool kubectl "" "kubectl version --client -o yaml | grep gitVersion" \
  "安裝：https://kubernetes.io/docs/tasks/tools/"
check_tool helm "" "helm version --short" \
  "安裝：https://helm.sh/docs/intro/install/"

[ "${FAIL}" = 1 ] && { echo; echo "請先解決上面標 ✗ 的項目，再重跑本腳本。"; exit 1; }

say "預拉映像檔（約 2 GB，視網速 5–20 分鐘）"
IMAGES=("${KINDEST_NODE_IMAGE}" "${KRO_IMAGE}" "${CAPI_IMAGES[@]}")
for img in "${IMAGES[@]}"; do
  docker pull -q "${img}" >/dev/null && good "${img}" || bad "拉取失敗：${img}"
done
[ "${FAIL}" = 1 ] && { echo "有映像檔拉取失敗 —— 檢查網路後重跑（已成功的不會重拉）。"; exit 1; }

say "產生離線快取（${CACHE_DIR}/images.tar）"
# --platform 必要：新版 Docker（containerd 映像庫）的 save 會夾帶缺 blob 的
# attestation manifest，之後 kind load 會以「digest not found」失敗
ARCH=$(docker version --format '{{.Server.Arch}}')
docker save --platform "linux/${ARCH}" -o "${CACHE_DIR}/images.tar" "${IMAGES[@]}" 2>/dev/null \
  || docker save -o "${CACHE_DIR}/images.tar" "${IMAGES[@]}"   # 舊版 Docker 無此 flag、也無此問題
good "$(du -h "${CACHE_DIR}/images.tar" | cut -f1) 已存檔"

say "預載 Cluster API provider 定義（離線 clusterctl init 用）"
REPO="${CACHE_DIR}/capi-repo"
CAPI_BASE="https://github.com/kubernetes-sigs/cluster-api/releases/download/${CAPI_VERSION}"
CAPD_BASE="https://github.com/kubernetes-sigs/cluster-api/releases/download/${CAPD_VERSION}"
mkdir -p "${REPO}/cluster-api/${CAPI_VERSION}" "${REPO}/bootstrap-kubeadm/${CAPI_VERSION}" \
         "${REPO}/control-plane-kubeadm/${CAPI_VERSION}" "${REPO}/infrastructure-docker/${CAPD_VERSION}" \
         "${REPO}/cert-manager/${CERT_MANAGER_VERSION}"
curl -fsSLo "${REPO}/cluster-api/${CAPI_VERSION}/core-components.yaml"                 "${CAPI_BASE}/core-components.yaml"
curl -fsSLo "${REPO}/cluster-api/${CAPI_VERSION}/metadata.yaml"                        "${CAPI_BASE}/metadata.yaml"
curl -fsSLo "${REPO}/bootstrap-kubeadm/${CAPI_VERSION}/bootstrap-components.yaml"      "${CAPI_BASE}/bootstrap-components.yaml"
curl -fsSLo "${REPO}/bootstrap-kubeadm/${CAPI_VERSION}/metadata.yaml"                  "${CAPI_BASE}/metadata.yaml"
curl -fsSLo "${REPO}/control-plane-kubeadm/${CAPI_VERSION}/control-plane-components.yaml" "${CAPI_BASE}/control-plane-components.yaml"
curl -fsSLo "${REPO}/control-plane-kubeadm/${CAPI_VERSION}/metadata.yaml"              "${CAPI_BASE}/metadata.yaml"
curl -fsSLo "${REPO}/infrastructure-docker/${CAPD_VERSION}/infrastructure-components-development.yaml" "${CAPD_BASE}/infrastructure-components-development.yaml"
curl -fsSLo "${REPO}/infrastructure-docker/${CAPD_VERSION}/metadata.yaml"              "${CAPD_BASE}/metadata.yaml"
curl -fsSLo "${REPO}/cert-manager/${CERT_MANAGER_VERSION}/cert-manager.yaml" \
  "https://github.com/cert-manager/cert-manager/releases/download/${CERT_MANAGER_VERSION}/cert-manager.yaml"

# clusterctl 設定：providers 全部指向本地檔案（file://），init 就完全不需要網路
mkdir -p "${REAL_HOME}/.config/cluster-api"
cat > "${REAL_HOME}/.config/cluster-api/clusterctl.yaml" <<CLUSTERCTL_EOF
cert-manager:
  url: "file://${REPO}/cert-manager/${CERT_MANAGER_VERSION}/cert-manager.yaml"
  version: "${CERT_MANAGER_VERSION}"
providers:
  - name: cluster-api
    type: CoreProvider
    url: "file://${REPO}/cluster-api/${CAPI_VERSION}/core-components.yaml"
  - name: kubeadm
    type: BootstrapProvider
    url: "file://${REPO}/bootstrap-kubeadm/${CAPI_VERSION}/bootstrap-components.yaml"
  - name: kubeadm
    type: ControlPlaneProvider
    url: "file://${REPO}/control-plane-kubeadm/${CAPI_VERSION}/control-plane-components.yaml"
  - name: docker
    type: InfrastructureProvider
    url: "file://${REPO}/infrastructure-docker/${CAPD_VERSION}/infrastructure-components-development.yaml"
CLUSTERCTL_EOF
good "provider 本地倉庫與 clusterctl.yaml 已就位"
[ -n "${SUDO_USER:-}" ] && chown -R "${SUDO_USER}" "${REAL_HOME}/.config" "${CACHE_DIR}" 2>/dev/null || true

say "下載 kro chart"
helm pull oci://registry.k8s.io/kro/charts/kro --version "${KRO_VERSION}" -d "${CACHE_DIR}"
good "kro-${KRO_VERSION}.tgz"

say "自我驗證"
for img in "${IMAGES[@]}"; do
  docker image inspect "${img}" >/dev/null 2>&1 || bad "本地缺少 ${img}"
done
[ -s "${CACHE_DIR}/images.tar" ] || bad "images.tar 不存在或為空"
[ -s "${CACHE_DIR}/kro-${KRO_VERSION}.tgz" ] || bad "kro chart 不存在"

if [ "${FAIL}" = 0 ]; then
  echo; printf '\033[1;32mSETUP-OK\033[0m —— 環境就緒，工作坊見！\n'
else
  echo; echo "驗證未全數通過，請依訊息排除後重跑。"; exit 1
fi
