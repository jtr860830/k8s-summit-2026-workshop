#!/usr/bin/env bash
# day-0 第 7 步：把 Cluster API 與 Tinkerbell provider（CAPT）裝進 seed 的 k3s
# 版本鎖定：clusterctl/core v1.12.5（對齊 CAPT v0.7.0）
set -euo pipefail
export KUBECONFIG=$HOME/.kube/config
CAPT_VERSION="v0.7.0"
CAPI_VERSION="v1.12.5"

# clusterctl（鎖版本）
if ! clusterctl version 2>/dev/null | grep -q "$CAPI_VERSION"; then
  curl -fL -o /tmp/clusterctl \
    "https://github.com/kubernetes-sigs/cluster-api/releases/download/${CAPI_VERSION}/clusterctl-linux-amd64"
  sudo install /tmp/clusterctl /usr/local/bin/clusterctl
fi
clusterctl version

# clusterctl 內建名錄沒有 tinkerbell —— 手動註冊 provider
mkdir -p ~/.cluster-api
cat > ~/.cluster-api/clusterctl.yaml <<EOF
providers:
  - name: tinkerbell
    type: InfrastructureProvider
    url: https://github.com/tinkerbell/cluster-api-provider-tinkerbell/releases/${CAPT_VERSION}/infrastructure-components.yaml
EOF

# Flatcar 用 Ignition 開機設定 —— feature gate 必須在 init 前開
export EXP_KUBEADM_BOOTSTRAP_FORMAT_IGNITION=true
clusterctl init --core "cluster-api:${CAPI_VERSION}" \
  --bootstrap "kubeadm:${CAPI_VERSION}" \
  --control-plane "kubeadm:${CAPI_VERSION}" \
  --infrastructure "tinkerbell:${CAPT_VERSION}"

for ns in capi-system capi-kubeadm-bootstrap-system capi-kubeadm-control-plane-system capt-system; do
  kubectl -n "$ns" wait --for=condition=Available deploy --all --timeout=300s
done
kubectl get pods -A | grep -E "capi-|capt-"
