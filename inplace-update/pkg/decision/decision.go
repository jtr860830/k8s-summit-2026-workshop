// Package decision is the pure decision layer. It never touches the Kubernetes
// API; it only answers two questions: "can this change be applied in place?" and
// "given the node's current state, what is the next action?". Fully unit-testable.
package decision

import (
	"k8s.io/apimachinery/pkg/api/equality"
	clusterv1 "sigs.k8s.io/cluster-api/api/core/v1beta2"
)

// Action is the output of the UpdateMachine state machine.
type Action string

const (
	// ActionDone: the upgrade is complete (kubelet runs the target version and the node is not cordoned).
	ActionDone Action = "Done"
	// ActionCordonAndLaunch: cordon the node and create the upgrade Job.
	ActionCordonAndLaunch Action = "CordonAndLaunch"
	// ActionWait: upgrade in progress (Job running, or Job done but kubelet has not reported the new version yet).
	ActionWait Action = "Wait"
	// ActionUncordon: kubelet is at the target version, lift the cordon.
	ActionUncordon Action = "Uncordon"
	// ActionFail: the upgrade Job failed.
	ActionFail Action = "Fail"
)

// JobState is the observed state of the upgrade Job.
type JobState string

const (
	JobNone      JobState = "None"
	JobRunning   JobState = "Running"
	JobSucceeded JobState = "Succeeded"
	JobFailed    JobState = "Failed"
)

// CoversDiff reports whether the current->desired Machine spec change is a
// version-only change. That is the only change this extension handles in place;
// anything else returns false and Cluster API falls back to replacing the machine.
func CoversDiff(current, desired *clusterv1.Machine) bool {
	if current.Spec.Version == desired.Spec.Version {
		return false // no version change: not ours to handle
	}
	patched := current.Spec.DeepCopy()
	patched.Version = desired.Spec.Version
	return equality.Semantic.DeepEqual(*patched, desired.Spec)
}

// NextAction derives the next step from the observed node state. Idempotent: the
// same inputs always yield the same output and nothing is remembered between
// calls, so UpdateMachine re-derives the action on every invocation.
func NextAction(nodeKubeletVersion, desiredVersion string, nodeCordoned bool, job JobState) Action {
	if job == JobFailed {
		return ActionFail
	}
	if nodeKubeletVersion == desiredVersion {
		if nodeCordoned {
			return ActionUncordon
		}
		return ActionDone
	}
	// kubelet is still on the old version
	switch job {
	case JobNone:
		return ActionCordonAndLaunch
	default: // Running, or Succeeded while kubelet has not reported the new version yet (restarting)
		return ActionWait
	}
}
