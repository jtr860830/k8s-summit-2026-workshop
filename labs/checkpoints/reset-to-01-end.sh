#!/usr/bin/env bash
# 追趕腳本：一鍵到達「第一幕結束」狀態（mgmt 管理叢集 + CAPD 就緒，demo 已拆）
# 冪等：不論你卡在哪一步，跑完就是乾淨的第一幕終點。約需 5 分鐘。
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "==> 重置管理叢集"
kind delete cluster --name mgmt 2>/dev/null || true
kind create cluster --config labs/01-capi/kind-mgmt.yaml --name mgmt
kind load image-archive ~/.summit-workshop/images.tar --name mgmt

echo "==> 安裝 Cluster API（CAPD）"
clusterctl init --core cluster-api:v1.13.4 --bootstrap kubeadm:v1.13.4 --control-plane kubeadm:v1.13.4 --infrastructure docker:v1.14.0
echo "==> 等待 controller 與 webhook 就緒"
kubectl -n capd-system rollout status deploy/capd-controller-manager --timeout=300s
# rollout 完成後 conversion webhook 還要幾秒暖身 —— 用 server-side dry-run 當探針
for i in $(seq 1 30); do
  kubectl apply --dry-run=server -f labs/01-capi/cluster-raw.yaml >/dev/null 2>&1 && break
  sleep 5
done

echo
echo "完成 —— 你現在在第一幕終點，可以直接開始第二幕（labs/02-kro/README.md）。"
