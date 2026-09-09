// Package executor does the actual Kubernetes API work: cordon/uncordon nodes and
// create/observe the per-node upgrade Job (privileged + hostPID + nsenter, the
// same pattern kured uses).
package executor

import (
	"context"
	"fmt"
	"strings"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"k8s.io/utils/ptr"

	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/decision"
)

// Executor performs node upgrade actions against a single cluster.
type Executor struct {
	cs           kubernetes.Interface
	jobNamespace string
	artifactsURL string
}

func New(cs kubernetes.Interface, jobNamespace, artifactsURL string) *Executor {
	return &Executor{cs: cs, jobNamespace: jobNamespace, artifactsURL: artifactsURL}
}

// JobNameFor returns upgrade-<node>-v1346 (version without dots, safe as a Kubernetes name).
func JobNameFor(nodeName, targetVersion string) string {
	v := strings.ReplaceAll(strings.TrimPrefix(targetVersion, "v"), ".", "")
	return fmt.Sprintf("upgrade-%s-v%s", nodeName, v)
}

// Cordon marks the node unschedulable. Scope note: patch-level upgrades do not evict pods (see README).
func (e *Executor) Cordon(ctx context.Context, nodeName string) error {
	return e.setUnschedulable(ctx, nodeName, true)
}

// Uncordon clears the unschedulable flag.
func (e *Executor) Uncordon(ctx context.Context, nodeName string) error {
	return e.setUnschedulable(ctx, nodeName, false)
}

func (e *Executor) setUnschedulable(ctx context.Context, nodeName string, v bool) error {
	patch := fmt.Sprintf(`{"spec":{"unschedulable":%t}}`, v)
	_, err := e.cs.CoreV1().Nodes().Patch(ctx, nodeName, types.MergePatchType, []byte(patch), metav1.PatchOptions{})
	return err
}

// upgradeScript runs in the host namespaces (nsenter -t 1):
//  1. download the target sysext, repoint the /etc/extensions symlink, systemd-sysext refresh
//     (new kubeadm/kubelet binaries become visible)
//  2. if kubeadm-config is not at the target version yet this node runs `upgrade apply`,
//     otherwise `upgrade node`
//  3. restart kubelet
func upgradeScript(target, artifactsURL string) string {
	// Deliberately no "kubelet --version already matches, exit early" shortcut:
	// after the sysext merge the binary reports the new version while the running
	// kubelet is still old. A retry after a failed first run would then be
	// misjudged as complete and skip kubeadm and the kubelet restart (observed in
	// testing). Whether to run at all is decided by the control-plane state machine
	// from the version the node reports in node.Status; every step here is idempotent.
	return fmt.Sprintf(`set -ex
NEW=%s
curl -fL -o /opt/extensions/kubernetes-${NEW}-x86-64.raw %s/kubernetes-${NEW}-x86-64.raw
ln -sf /opt/extensions/kubernetes-${NEW}-x86-64.raw /etc/extensions/kubernetes.raw
systemd-sysext refresh
kubeadm version -o short
if kubectl --kubeconfig /etc/kubernetes/admin.conf -n kube-system get cm kubeadm-config -o yaml | grep -q "kubernetesVersion: ${NEW}"; then
  kubeadm upgrade node
else
  kubeadm upgrade apply ${NEW} -y
fi
systemctl restart kubelet
echo upgrade-script-done`, target, artifactsURL)
}

// EnsureUpgradeJob creates the upgrade Job for the node if it does not exist yet (idempotent).
func (e *Executor) EnsureUpgradeJob(ctx context.Context, nodeName, targetVersion string) error {
	name := JobNameFor(nodeName, targetVersion)
	_, err := e.cs.BatchV1().Jobs(e.jobNamespace).Get(ctx, name, metav1.GetOptions{})
	if err == nil {
		return nil // already exists
	}
	if !apierrors.IsNotFound(err) {
		return err
	}

	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: e.jobNamespace,
			Labels:    map[string]string{"app": "inplace-upgrade", "node": nodeName},
		},
		Spec: batchv1.JobSpec{
			BackoffLimit:            ptr.To(int32(0)), // failure handling belongs to the state machine, not to Job retries
			TTLSecondsAfterFinished: ptr.To(int32(3600)),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					NodeName:      nodeName,
					RestartPolicy: corev1.RestartPolicyNever,
					HostPID:       true,
					// The node is cordoned (the unschedulable taint still applies to a pod
					// pinned by nodeName) and control-plane nodes carry their taint, so
					// tolerate both.
					Tolerations: []corev1.Toleration{
						{Key: "node.kubernetes.io/unschedulable", Operator: corev1.TolerationOpExists, Effect: corev1.TaintEffectNoSchedule},
						{Key: "node-role.kubernetes.io/control-plane", Operator: corev1.TolerationOpExists, Effect: corev1.TaintEffectNoSchedule},
					},
					Containers: []corev1.Container{{
						Name:  "upgrade",
						Image: "alpine:3.20",
						Command: []string{
							"nsenter", "-t", "1", "-m", "-u", "-i", "-n", "-p", "--",
							"sh", "-c", upgradeScript(targetVersion, e.artifactsURL),
						},
						SecurityContext: &corev1.SecurityContext{Privileged: ptr.To(true)},
					}},
				},
			},
		},
	}
	_, err = e.cs.BatchV1().Jobs(e.jobNamespace).Create(ctx, job, metav1.CreateOptions{})
	if apierrors.IsAlreadyExists(err) {
		return nil
	}
	return err
}

// JobStateFor reads the observed state of the upgrade Job.
func (e *Executor) JobStateFor(ctx context.Context, nodeName, targetVersion string) (decision.JobState, error) {
	job, err := e.cs.BatchV1().Jobs(e.jobNamespace).Get(ctx, JobNameFor(nodeName, targetVersion), metav1.GetOptions{})
	if apierrors.IsNotFound(err) {
		return decision.JobNone, nil
	}
	if err != nil {
		return decision.JobNone, err
	}
	if job.Status.Succeeded > 0 {
		return decision.JobSucceeded, nil
	}
	if job.Status.Failed > 0 {
		return decision.JobFailed, nil
	}
	return decision.JobRunning, nil
}

// NodeState returns the node's kubelet version and cordon state.
func (e *Executor) NodeState(ctx context.Context, nodeName string) (kubeletVersion string, cordoned bool, err error) {
	node, err := e.cs.CoreV1().Nodes().Get(ctx, nodeName, metav1.GetOptions{})
	if err != nil {
		return "", false, err
	}
	return node.Status.NodeInfo.KubeletVersion, node.Spec.Unschedulable, nil
}
