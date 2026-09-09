#!/usr/bin/env bash
# Catch-up script: jump to the end-of-act-2 state (kro + RGD ready, all instances gone)
# Idempotent; ensures the act-1 endpoint first. About 7 minutes.
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
