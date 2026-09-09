package decision_test

import (
	"testing"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	clusterv1 "sigs.k8s.io/cluster-api/api/core/v1beta2"

	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/decision"
)

func machineWithVersion(v string) *clusterv1.Machine {
	return &clusterv1.Machine{
		ObjectMeta: metav1.ObjectMeta{Name: "m1", Namespace: "default"},
		Spec: clusterv1.MachineSpec{
			ClusterName: "mgmt",
			Version:     v,
		},
	}
}

func TestCoversDiff(t *testing.T) {
	cur := machineWithVersion("v1.34.1")
	des := machineWithVersion("v1.34.6")
	if !decision.CoversDiff(cur, des) {
		t.Fatal("version-only diff must be covered")
	}

	// no version change: not ours
	if decision.CoversDiff(cur, machineWithVersion("v1.34.1")) {
		t.Fatal("no-op diff must NOT be covered")
	}

	// version changed but something else changed too: cannot claim coverage
	des2 := machineWithVersion("v1.34.6")
	des2.Spec.FailureDomain = "z2"
	if decision.CoversDiff(cur, des2) {
		t.Fatal("non-version diff must NOT be covered")
	}
}

func TestNextAction(t *testing.T) {
	cases := []struct {
		name     string
		kubelet  string
		cordoned bool
		job      decision.JobState
		want     decision.Action
	}{
		{"at target, not cordoned -> done", "v1.34.6", false, decision.JobNone, decision.ActionDone},
		{"at target, still cordoned -> uncordon", "v1.34.6", true, decision.JobSucceeded, decision.ActionUncordon},
		{"old version, no job -> cordon and launch", "v1.34.1", false, decision.JobNone, decision.ActionCordonAndLaunch},
		{"old version, job running -> wait", "v1.34.1", true, decision.JobRunning, decision.ActionWait},
		{"job succeeded but kubelet still old -> wait (kubelet restarting)", "v1.34.1", true, decision.JobSucceeded, decision.ActionWait},
		{"job failed -> fail", "v1.34.1", true, decision.JobFailed, decision.ActionFail},
		{"job failure wins over version check", "v1.34.6", false, decision.JobFailed, decision.ActionFail},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := decision.NextAction(c.kubelet, "v1.34.6", c.cordoned, c.job)
			if got != c.want {
				t.Fatalf("got %v want %v", got, c.want)
			}
		})
	}
}
