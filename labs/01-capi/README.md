# 第一幕：裸 Cluster API —— 感受 200 行的份量

這一幕你會用「原始」的 Cluster API 物件開出一個 Kubernetes 叢集，
體驗宣告式基礎設施的威力 —— 以及它的重量。**記住這個重量**，第二幕會用到。

> 預估時間：20 分鐘。卡住了？跑 `../checkpoints/reset-to-01-end.sh` 一鍵追上，
> 或舉手找助教。

## 1. 建立管理叢集（約 2 分鐘）

```bash
kind create cluster --config labs/01-capi/kind-mgmt.yaml --name mgmt
kind load image-archive ~/.summit-workshop/images.tar --name mgmt
```

第二行把會前下載的映像檔灌進叢集 —— 今天全程不需要現場網路。

> `kind-mgmt.yaml` 掛載了 `/var/run/docker.sock`。待會 CAPD（Cluster API 的
> Docker provider）要透過它請你的 Docker「開機器」—— 每個 provider 都需要一條
> 摸得到機器的通道：雲的 provider 打雲 API、裸機平台打 PXE 和 BMC，今天我們打 Docker。

**預期**：`kubectl get nodes` 看到 `mgmt-control-plane` Ready。

## 2. 安裝 Cluster API（約 1 分鐘）

```bash
clusterctl init --core cluster-api:v1.13.4 --bootstrap kubeadm:v1.13.4 \
  --control-plane kubeadm:v1.13.4 --infrastructure docker:v1.14.0
```

> 版本寫死不是囉唆 —— 這讓 clusterctl 直接使用會前預載的本地定義檔，
> 全程不需要網路（不寫版本它會上網查最新版）。

**預期**：結尾出現 `Your management cluster has been initialized successfully!`。
用 `kubectl get pods -A` 看看多了哪些 controller。

## 3. 開一個叢集 —— 原始的方式（約 4 分鐘收斂）

先看看你要 apply 的東西：

```bash
less labs/01-capi/cluster-raw.yaml
```

**七個物件、上百行、名稱互相引用** —— 這就是「一個叢集」的完整定義。看完後：

```bash
kubectl apply -f labs/01-capi/cluster-raw.yaml
watch kubectl get machines
```

開第二個終端機跑 `watch docker ps`，對照著看 ——
**每個 Machine 就是一個容器**（生產環境裡它會是一台真的伺服器）。

**預期**（約 3–4 分鐘）：`demo-control-plane-xxxxx` 變 `Running`，
`docker ps` 出現 `demo-control-plane-*`、`demo-md-0-*`、`demo-lb` 三個容器。

## 4. 進入新叢集、裝 CNI（約 2 分鐘）

```bash
clusterctl get kubeconfig demo > /tmp/demo.kubeconfig
kubectl --kubeconfig /tmp/demo.kubeconfig get nodes
```

**預期**：節點 `NotReady` —— 剛出爐的叢集是「裸」的，沒有網路外掛（CNI）。裝上：

```bash
kubectl --kubeconfig /tmp/demo.kubeconfig apply -f labs/01-capi/kindnet.yaml
kubectl --kubeconfig /tmp/demo.kubeconfig get nodes -w
```

**預期**（約 1 分鐘）：節點轉 `Ready`。
（這份 kindnet 的映像檔內建在節點裡 —— 所以斷網也裝得起來。）

## 5. 擴容（約 2 分鐘）

```bash
kubectl scale machinedeployment demo-md-0 --replicas=2
watch kubectl get machines
```

**預期**：多出一台 worker Machine，`docker ps` 多一個容器 ——
擴容一台「機器」，就是改一個數字。

## 6. 觸發換機（rolling update，約 4 分鐘）

Cluster API 的世界觀：機器不修，**換**。改 MachineDeployment 模板的任何欄位
都會觸發逐台汰換。我們加個無害的標籤：

```bash
kubectl patch machinedeployment demo-md-0 --type merge \
  -p '{"spec":{"template":{"metadata":{"labels":{"generation":"v2"}}}}}'
watch kubectl get machines
```

**預期**：舊 worker 進入 `Deleting`、新 worker 從 `Provisioning` 到 `Running` ——
一台換一台，服務不中斷。這個「reconcile by replacement」哲學，
正是 Kubernetes 把 Pod 換掉不修 Pod 的同一套思想，往下延伸到了機器層。

## 7. 拆掉（約 1 分鐘）

```bash
kubectl delete cluster demo
watch docker ps
```

**預期**：三個 demo 容器依序消失。管理叢集（mgmt）保留 —— 第二幕要用。

---

## 你剛剛做了什麼

- 用 **宣告式物件** 定義並開出一個完整的 Kubernetes 叢集
- 體驗了 Machine 的 cattle 哲學：擴容改數字、升級換機器
- 也體驗了代價：**七個物件、200 行、還要懂它們怎麼互相引用**

第二幕，我們把這 200 行變成 6 行 → [`labs/02-kro/README.md`](../02-kro/README.md)

## 這步失敗看這裡

- apply 出現 `conversion webhook ... connection refused` → controller 剛裝好還在暖身，等 30 秒重跑同一個 apply 即可
- `kind create` 卡住或失敗 → 確認 Docker 資源（4 CPU / 8 GB）；跑過舊實驗先 `kind delete cluster --name mgmt`
- Machine 卡在 `Provisioning` 超過 5 分鐘 → `kubectl -n capd-system logs deploy/capd-controller-manager --tail 20` 看錯誤；最常見是 docker socket 沒掛到（重做步驟 1）
- 節點一直 `NotReady` → `kubectl --kubeconfig /tmp/demo.kubeconfig -n kube-system get pods` 看 kindnet 是否 Running
