#!/usr/bin/env bash
# day-0 step 7: install Cluster API and the Tinkerbell provider (CAPT) into the seed's k3s.
# Pinned versions: clusterctl/core v1.12.5 (matches CAPT v0.7.0)
set -euo pipefail
export KUBECONFIG=$HOME/.kube/config
CAPT_VERSION="v0.7.0"
CAPI_VERSION="v1.12.5"

# clusterctl (pinned)
if ! clusterctl version 2>/dev/null | grep -q "$CAPI_VERSION"; then
  curl -fL -o /tmp/clusterctl \
    "https://github.com/kubernetes-sigs/cluster-api/releases/download/${CAPI_VERSION}/clusterctl-linux-amd64"
  sudo install /tmp/clusterctl /usr/local/bin/clusterctl
fi
clusterctl version

# clusterctl's built-in provider list has no tinkerbell; register it manually
mkdir -p ~/.cluster-api
cat > ~/.cluster-api/clusterctl.yaml <<EOF
providers:
  - name: tinkerbell
    type: InfrastructureProvider
    url: https://github.com/tinkerbell/cluster-api-provider-tinkerbell/releases/${CAPT_VERSION}/infrastructure-components.yaml
EOF

# Flatcar boots with Ignition; the feature gate must be set before init
export EXP_KUBEADM_BOOTSTRAP_FORMAT_IGNITION=true
clusterctl init --core "cluster-api:${CAPI_VERSION}" \
  --bootstrap "kubeadm:${CAPI_VERSION}" \
  --control-plane "kubeadm:${CAPI_VERSION}" \
  --infrastructure "tinkerbell:${CAPT_VERSION}"

for ns in capi-system capi-kubeadm-bootstrap-system capi-kubeadm-control-plane-system capt-system; do
  kubectl -n "$ns" wait --for=condition=Available deploy --all --timeout=300s
done

# CAPT needs the Tinkerbell address (file source for install workflows)
kubectl -n capt-system set env deployment/capt-controller-manager TINKERBELL_IP=172.16.91.3
kubectl -n capt-system rollout status deploy/capt-controller-manager --timeout=120s >/dev/null

kubectl get pods -A | grep -E "capi-|capt-"
