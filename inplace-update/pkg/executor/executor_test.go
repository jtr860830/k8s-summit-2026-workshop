package executor_test

import (
	"context"
	"strings"
	"testing"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/decision"
	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/executor"
)

const (
	ns        = "inplace-system"
	artifacts = "http://172.16.90.4:7173"
)

func TestJobNameFor(t *testing.T) {
	got := executor.JobNameFor("poc3-mgmt-1", "v1.34.6")
	if got != "upgrade-poc3-mgmt-1-v1346" {
		t.Fatalf("got %s", got)
	}
}

func TestEnsureUpgradeJobIdempotentAndShape(t *testing.T) {
	ctx := context.Background()
	cs := fake.NewSimpleClientset()
	ex := executor.New(cs, ns, artifacts)

	if err := ex.EnsureUpgradeJob(ctx, "poc3-mgmt-1", "v1.34.6"); err != nil {
		t.Fatal(err)
	}
	if err := ex.EnsureUpgradeJob(ctx, "poc3-mgmt-1", "v1.34.6"); err != nil {
		t.Fatal(err) // second call must not error
	}
	jobs, _ := cs.BatchV1().Jobs(ns).List(ctx, metav1.ListOptions{})
	if len(jobs.Items) != 1 {
		t.Fatalf("want 1 job, got %d", len(jobs.Items))
	}
	spec := jobs.Items[0].Spec.Template.Spec
	if spec.NodeName != "poc3-mgmt-1" {
		t.Fatal("job must be pinned to node")
	}
	if !spec.HostPID || !*spec.Containers[0].SecurityContext.Privileged {
		t.Fatal("job must be privileged + hostPID")
	}
	script := spec.Containers[0].Command[len(spec.Containers[0].Command)-1]
	for _, want := range []string{"v1.34.6", "systemd-sysext refresh", "kubeadm upgrade", "systemctl restart kubelet", artifacts} {
		if !strings.Contains(script, want) {
			t.Fatalf("script missing %q", want)
		}
	}
}

func TestJobStateFor(t *testing.T) {
	ctx := context.Background()
	name := executor.JobNameFor("n1", "v1.34.6")
	mk := func(succeeded, failed int32) *batchv1.Job {
		return &batchv1.Job{
			ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: ns},
			Status:     batchv1.JobStatus{Succeeded: succeeded, Failed: failed},
		}
	}
	cases := []struct {
		name string
		job  *batchv1.Job
		want decision.JobState
	}{
		{"absent", nil, decision.JobNone},
		{"running", mk(0, 0), decision.JobRunning},
		{"succeeded", mk(1, 0), decision.JobSucceeded},
		{"failed", mk(0, 1), decision.JobFailed},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			cs := fake.NewSimpleClientset()
			if c.job != nil {
				_, _ = cs.BatchV1().Jobs(ns).Create(ctx, c.job, metav1.CreateOptions{})
			}
			got, err := executor.New(cs, ns, artifacts).JobStateFor(ctx, "n1", "v1.34.6")
			if err != nil || got != c.want {
				t.Fatalf("got %v err %v, want %v", got, err, c.want)
			}
		})
	}
}

func TestCordonUncordonAndNodeState(t *testing.T) {
	ctx := context.Background()
	cs := fake.NewSimpleClientset(&corev1.Node{
		ObjectMeta: metav1.ObjectMeta{Name: "n1"},
		Status:     corev1.NodeStatus{NodeInfo: corev1.NodeSystemInfo{KubeletVersion: "v1.34.1"}},
	})
	ex := executor.New(cs, ns, artifacts)

	if err := ex.Cordon(ctx, "n1"); err != nil {
		t.Fatal(err)
	}
	ver, cordoned, err := ex.NodeState(ctx, "n1")
	if err != nil || ver != "v1.34.1" || !cordoned {
		t.Fatalf("got ver=%s cordoned=%v err=%v", ver, cordoned, err)
	}
	if err := ex.Uncordon(ctx, "n1"); err != nil {
		t.Fatal(err)
	}
	_, cordoned, _ = ex.NodeState(ctx, "n1")
	if cordoned {
		t.Fatal("uncordon failed")
	}
}
