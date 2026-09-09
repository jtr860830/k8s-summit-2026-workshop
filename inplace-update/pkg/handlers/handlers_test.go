package handlers_test

import (
	"context"
	"strings"
	"testing"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	clusterv1 "sigs.k8s.io/cluster-api/api/core/v1beta2"
	runtimehooksv1 "sigs.k8s.io/cluster-api/api/runtime/hooks/v1alpha1"

	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/executor"
	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/handlers"
)

var cfg = handlers.Config{ArtifactsURL: "http://172.16.90.4:7173", JobNamespace: "inplace-system"}

// machine mimics the desired Machine of an UpdateMachineRequest: in practice the
// desired object carries no status, so the node name can only be derived from
// spec.providerID. The tests take the same path.
func machine(version, nodeName string) clusterv1.Machine {
	m := clusterv1.Machine{
		ObjectMeta: metav1.ObjectMeta{Name: "m1", Namespace: "default"},
		Spec:       clusterv1.MachineSpec{ClusterName: "mgmt", Version: version},
	}
	if nodeName != "" {
		m.Spec.ProviderID = "tinkerbell://tinkerbell/" + nodeName
	}
	return m
}

func node(name, kubeletVersion string, cordoned bool) *corev1.Node {
	return &corev1.Node{
		ObjectMeta: metav1.ObjectMeta{Name: name},
		Spec:       corev1.NodeSpec{Unschedulable: cordoned},
		Status:     corev1.NodeStatus{NodeInfo: corev1.NodeSystemInfo{KubeletVersion: kubeletVersion}},
	}
}

func TestCanUpdateMachine(t *testing.T) {
	h := handlers.New(fake.NewSimpleClientset(), cfg)

	// version-only diff: covered, returns a merge patch
	req := &runtimehooksv1.CanUpdateMachineRequest{}
	req.Current.Machine = machine("v1.34.1", "n1")
	req.Desired.Machine = machine("v1.34.6", "n1")
	resp := &runtimehooksv1.CanUpdateMachineResponse{}
	h.CanUpdateMachine(context.Background(), req, resp)
	if resp.Status != runtimehooksv1.ResponseStatusSuccess || !resp.MachinePatch.IsDefined() {
		t.Fatalf("want success+patch, got %+v", resp)
	}
	if !strings.Contains(string(resp.MachinePatch.Patch), "v1.34.6") {
		t.Fatalf("patch must set desired version: %s", resp.MachinePatch.Patch)
	}

	// non-version diff: not covered (no patch)
	req2 := &runtimehooksv1.CanUpdateMachineRequest{}
	req2.Current.Machine = machine("v1.34.1", "n1")
	des := machine("v1.34.6", "n1")
	des.Spec.FailureDomain = "z2"
	req2.Desired.Machine = des
	resp2 := &runtimehooksv1.CanUpdateMachineResponse{}
	h.CanUpdateMachine(context.Background(), req2, resp2)
	if resp2.MachinePatch.IsDefined() {
		t.Fatal("must not claim coverage for non-version changes")
	}
}

func TestUpdateMachineStateMachine(t *testing.T) {
	ctx := context.Background()
	jobName := executor.JobNameFor("n1", "v1.34.6")
	mkJob := func(succeeded, failed int32) *batchv1.Job {
		return &batchv1.Job{
			ObjectMeta: metav1.ObjectMeta{Name: jobName, Namespace: cfg.JobNamespace},
			Status:     batchv1.JobStatus{Succeeded: succeeded, Failed: failed},
		}
	}

	cases := []struct {
		name       string
		node       *corev1.Node
		job        *batchv1.Job
		wantStatus runtimehooksv1.ResponseStatus
		wantRetry  int32
		wantJobs   int  // jobs in the namespace after the call
		wantCordon bool // node cordon state after the call
	}{
		{name: "initial -> cordon and launch job", node: node("n1", "v1.34.1", false), job: nil,
			wantStatus: runtimehooksv1.ResponseStatusSuccess, wantRetry: 30, wantJobs: 1, wantCordon: true},
		{name: "job running -> wait", node: node("n1", "v1.34.1", true), job: mkJob(0, 0),
			wantStatus: runtimehooksv1.ResponseStatusSuccess, wantRetry: 30, wantJobs: 1, wantCordon: true},
		{name: "job succeeded, new version -> uncordon", node: node("n1", "v1.34.6", true), job: mkJob(1, 0),
			wantStatus: runtimehooksv1.ResponseStatusSuccess, wantRetry: 10, wantJobs: 1, wantCordon: false},
		{name: "new version, not cordoned -> done", node: node("n1", "v1.34.6", false), job: mkJob(1, 0),
			wantStatus: runtimehooksv1.ResponseStatusSuccess, wantRetry: 0, wantJobs: 1, wantCordon: false},
		{name: "job failed -> Failure", node: node("n1", "v1.34.1", true), job: mkJob(0, 1),
			wantStatus: runtimehooksv1.ResponseStatusFailure, wantJobs: 1, wantCordon: true},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			cs := fake.NewSimpleClientset(c.node)
			if c.job != nil {
				_, _ = cs.BatchV1().Jobs(cfg.JobNamespace).Create(ctx, c.job, metav1.CreateOptions{})
			}
			h := handlers.New(cs, cfg)
			req := &runtimehooksv1.UpdateMachineRequest{}
			req.Desired.Machine = machine("v1.34.6", "n1")
			resp := &runtimehooksv1.UpdateMachineResponse{}
			h.UpdateMachine(ctx, req, resp)

			if resp.Status != c.wantStatus {
				t.Fatalf("status: got %s want %s (msg=%s)", resp.Status, c.wantStatus, resp.Message)
			}
			if c.wantStatus == runtimehooksv1.ResponseStatusSuccess && resp.RetryAfterSeconds != c.wantRetry {
				t.Fatalf("retry: got %d want %d", resp.RetryAfterSeconds, c.wantRetry)
			}
			jobs, _ := cs.BatchV1().Jobs(cfg.JobNamespace).List(ctx, metav1.ListOptions{})
			if len(jobs.Items) != c.wantJobs {
				t.Fatalf("jobs: got %d want %d", len(jobs.Items), c.wantJobs)
			}
			n, _ := cs.CoreV1().Nodes().Get(ctx, "n1", metav1.GetOptions{})
			if n.Spec.Unschedulable != c.wantCordon {
				t.Fatalf("cordon: got %v want %v", n.Spec.Unschedulable, c.wantCordon)
			}
		})
	}
}

func TestUpdateMachineNoNodeRef(t *testing.T) {
	h := handlers.New(fake.NewSimpleClientset(), cfg)
	req := &runtimehooksv1.UpdateMachineRequest{}
	req.Desired.Machine = machine("v1.34.6", "")
	resp := &runtimehooksv1.UpdateMachineResponse{}
	h.UpdateMachine(context.Background(), req, resp)
	if resp.Status != runtimehooksv1.ResponseStatusFailure {
		t.Fatal("machine without nodeRef must fail")
	}
}
