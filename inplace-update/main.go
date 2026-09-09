// Cluster API in-place update extension.
//
// A Runtime SDK webhook server that registers the CanUpdateMachine,
// CanUpdateMachineSet and UpdateMachine hooks, so a Kubernetes version bump on a
// KubeadmControlPlane is executed on the Flatcar node itself (swap the kubernetes
// sysext, run kubeadm upgrade) instead of replacing the machine.
package main

import (
	"flag"
	"os"

	"k8s.io/client-go/kubernetes"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"

	runtimehooksv1 "sigs.k8s.io/cluster-api/api/runtime/hooks/v1alpha1"
	runtimecatalog "sigs.k8s.io/cluster-api/exp/runtime/catalog"
	"sigs.k8s.io/cluster-api/exp/runtime/server"

	"github.com/jtr860830/k8s-summit-2026-workshop/inplace-update/pkg/handlers"
)

func main() {
	var (
		certDir      string
		artifactsURL string
		jobNamespace string
	)
	flag.StringVar(&certDir, "cert-dir", "/tmp/k8s-webhook-server/serving-certs", "TLS cert directory (tls.crt/tls.key)")
	flag.StringVar(&artifactsURL, "artifacts-url", "http://172.16.90.4:7173", "HTTP server that hosts the Flatcar kubernetes sysext images")
	flag.StringVar(&jobNamespace, "job-namespace", "inplace-system", "namespace for the per-node upgrade Jobs")
	flag.Parse()

	log := zap.New(zap.UseDevMode(false))
	ctrl.SetLogger(log)

	catalog := runtimecatalog.New()
	if err := runtimehooksv1.AddToCatalog(catalog); err != nil {
		log.Error(err, "adding hooks to catalog")
		os.Exit(1)
	}

	cs := kubernetes.NewForConfigOrDie(ctrl.GetConfigOrDie())
	h := handlers.New(cs, handlers.Config{ArtifactsURL: artifactsURL, JobNamespace: jobNamespace})

	srv, err := server.New(server.Options{Catalog: catalog, Port: 9443, CertDir: certDir})
	if err != nil {
		log.Error(err, "creating runtime server")
		os.Exit(1)
	}
	for _, reg := range []struct {
		hook    runtimecatalog.Hook
		name    string
		handler runtimecatalog.Hook
	}{
		{runtimehooksv1.CanUpdateMachine, "can-update-machine", h.CanUpdateMachine},
		{runtimehooksv1.CanUpdateMachineSet, "can-update-machineset", h.CanUpdateMachineSet},
		{runtimehooksv1.UpdateMachine, "update-machine", h.UpdateMachine},
	} {
		if err := srv.AddExtensionHandler(server.ExtensionHandler{
			Hook: reg.hook, Name: reg.name, HandlerFunc: reg.handler,
		}); err != nil {
			log.Error(err, "registering handler", "name", reg.name)
			os.Exit(1)
		}
	}

	log.Info("starting in-place update extension", "port", 9443)
	if err := srv.Start(ctrl.SetupSignalHandler()); err != nil {
		log.Error(err, "server exited with error")
		os.Exit(1)
	}
}
