// Package handlers implements the three Cluster API in-place update hooks.
//
// Division of labour: KubeadmControlPlane decides which machine goes first, keeps
// etcd safe and gates the rollout one machine at a time; this extension only
// knows how to upgrade a single node in place. UpdateMachine is an idempotent
// state machine: every call re-derives the action from the node's actual state
// (kubelet version, cordon flag, Job state).
package handlers

import (
	"context"
	"fmt"
	"strings"

	"k8s.io/client-go/kubernetes"
	clusterv1 "sigs.k8s.io/cluster-api/api/core/v1beta2"
	runtimehooksv1 "sigs.k8s.io/cluster-api/api/runtime/hooks/v1alpha1"

	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/decision"
	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/executor"
)

// Config is the static configuration of the extension.
type Config struct {
	ArtifactsURL string // HTTP server hosting the Flatcar kubernetes sysext images
	JobNamespace string // namespace for the upgrade Jobs
}

// Handlers holds the three hook implementations.
type Handlers struct {
	ex  *executor.Executor
	cfg Config
}

func New(cs kubernetes.Interface, cfg Config) *Handlers {
	return &Handlers{ex: executor.New(cs, cfg.JobNamespace, cfg.ArtifactsURL), cfg: cfg}
}

// CanUpdateMachine: only a change to spec.version alone can be handled in place.
// If so, return a machinePatch (merge patch setting the version) so Cluster API
// can confirm the whole diff is covered; otherwise return no patch and Cluster API
// falls back to a replacement rollout.
func (h *Handlers) CanUpdateMachine(ctx context.Context, req *runtimehooksv1.CanUpdateMachineRequest, resp *runtimehooksv1.CanUpdateMachineResponse) {
	resp.SetStatus(runtimehooksv1.ResponseStatusSuccess)
	if !decision.CoversDiff(&req.Current.Machine, &req.Desired.Machine) {
		resp.SetMessage("only version-only machine changes are handled in-place by this extension")
		return
	}
	resp.MachinePatch = runtimehooksv1.Patch{
		PatchType: runtimehooksv1.JSONMergePatchType,
		Patch:     fmt.Appendf(nil, `{"spec":{"version":"%s"}}`, req.Desired.Machine.Spec.Version),
	}
	resp.SetMessage(fmt.Sprintf("can update machine in-place to %s", req.Desired.Machine.Spec.Version))
}

// CanUpdateMachineSet: workers are out of scope (the management cluster has no MachineDeployment), never covered.
func (h *Handlers) CanUpdateMachineSet(ctx context.Context, req *runtimehooksv1.CanUpdateMachineSetRequest, resp *runtimehooksv1.CanUpdateMachineSetResponse) {
	resp.SetStatus(runtimehooksv1.ResponseStatusSuccess)
	resp.SetMessage("MachineSet in-place updates not supported by this extension (scope: KubeadmControlPlane only)")
}

// UpdateMachine is the idempotent state machine. Response semantics (Cluster API contract):
// Success with retryAfterSeconds > 0 = in progress; Success with 0 = done; Failure = failed.
func (h *Handlers) UpdateMachine(ctx context.Context, req *runtimehooksv1.UpdateMachineRequest, resp *runtimehooksv1.UpdateMachineResponse) {
	machine := &req.Desired.Machine
	target := machine.Spec.Version

	nodeName := nodeNameFor(machine)
	if nodeName == "" {
		resp.SetStatus(runtimehooksv1.ResponseStatusFailure)
		resp.SetMessage(fmt.Sprintf("machine %s: cannot determine node name (no nodeRef, no providerID)", machine.Name))
		return
	}

	kubeletVersion, cordoned, err := h.ex.NodeState(ctx, nodeName)
	if err != nil {
		fail(resp, "reading node state: %v", err)
		return
	}
	jobState, err := h.ex.JobStateFor(ctx, nodeName, target)
	if err != nil {
		fail(resp, "reading job state: %v", err)
		return
	}

	switch decision.NextAction(kubeletVersion, target, cordoned, jobState) {
	case decision.ActionDone:
		resp.SetStatus(runtimehooksv1.ResponseStatusSuccess)
		resp.RetryAfterSeconds = 0
		resp.SetMessage(fmt.Sprintf("node %s at %s, update complete", nodeName, target))

	case decision.ActionUncordon:
		if err := h.ex.Uncordon(ctx, nodeName); err != nil {
			fail(resp, "uncordon: %v", err)
			return
		}
		inProgress(resp, 10, "uncordoned %s, verifying", nodeName)

	case decision.ActionCordonAndLaunch:
		if err := h.ex.Cordon(ctx, nodeName); err != nil {
			fail(resp, "cordon: %v", err)
			return
		}
		if err := h.ex.EnsureUpgradeJob(ctx, nodeName, target); err != nil {
			fail(resp, "creating upgrade job: %v", err)
			return
		}
		inProgress(resp, 30, "cordoned %s and launched upgrade job to %s", nodeName, target)

	case decision.ActionWait:
		inProgress(resp, 30, "upgrade of %s to %s in progress (job=%s kubelet=%s)", nodeName, target, jobState, kubeletVersion)

	case decision.ActionFail:
		fail(resp, "upgrade job %s failed on node %s - inspect: kubectl -n %s logs job/%s",
			executor.JobNameFor(nodeName, target), nodeName, h.cfg.JobNamespace, executor.JobNameFor(nodeName, target))
	}
}

// nodeNameFor derives the node name for a Machine.
// The desired Machine in UpdateMachineRequest carries no status (so no nodeRef);
// fall back to spec.providerID (tinkerbell://<ns>/<hardware>, where the Hardware
// name equals the hostname and the node name by our naming convention).
// status.nodeRef wins when present.
func nodeNameFor(m *clusterv1.Machine) string {
	if m.Status.NodeRef.Name != "" {
		return m.Status.NodeRef.Name
	}
	pid := m.Spec.ProviderID
	if i := strings.LastIndex(pid, "/"); i >= 0 && i+1 < len(pid) {
		return pid[i+1:]
	}
	return ""
}

func inProgress(resp *runtimehooksv1.UpdateMachineResponse, retry int32, format string, args ...any) {
	resp.SetStatus(runtimehooksv1.ResponseStatusSuccess)
	resp.RetryAfterSeconds = retry
	resp.SetMessage(fmt.Sprintf(format, args...))
}

func fail[T interface {
	SetStatus(runtimehooksv1.ResponseStatus)
	SetMessage(string)
}](resp T, format string, args ...any) {
	resp.SetStatus(runtimehooksv1.ResponseStatusFailure)
	resp.SetMessage(fmt.Sprintf(format, args...))
}
