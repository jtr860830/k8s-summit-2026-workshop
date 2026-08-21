#!/usr/bin/env bash
# 追趕腳本：一鍵到達「第二幕結束」狀態（kro + RGD 就緒，所有 instance 已拆）
# 冪等；內部先確保第一幕終點。約需 7 分鐘。
set -euo pipefail
cd "$(dirname "$0")/../.."

"./labs/checkpoints/reset-to-01-end.sh"

echo "==> 安裝 kro + 平台 API"
helm status kro -n kro-system >/dev/null 2>&1 || \
  helm install kro ~/.summit-workshop/kro-0.9.3.tgz -n kro-system --create-namespace
kubectl -n kro-system rollout status deploy/kro --timeout=180s
kubectl apply -f rgd/workloadcluster-capd.yaml
for i in $(seq 1 12); do
  STATE=$(kubectl get rgd workloadcluster -o jsonpath='{.status.state}' 2>/dev/null || true)
  [ "${STATE}" = "Active" ] && break
  sleep 5
done
kubectl get rgd workloadcluster

echo
echo "完成 —— kro 與 WorkloadCluster API 就緒，可以從第二幕第 3 步（開叢集）繼續。"
