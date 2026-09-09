# Cluster API in-place update extension

工作坊 demo③ 用的升級外掛。改 KubeadmControlPlane 的 `spec.version`，Cluster API 逐台呼叫這個 extension，
在 Flatcar 節點上原地換 Kubernetes 版本：換 sysext、`kubeadm upgrade`、重啟 kubelet。Machine 不換、機器不重開。

## 怎麼運作

```
KCP spec.version 變更
  └→ CanUpdateMachine：只認「只有 version 不同」的變更，回 merge patch 宣告由本 extension 處理
       └→ KCP 逐台進入 UpdateMachine（冪等狀態機，每次從節點實際狀態推導動作）
            kubelet 版本 ≠ 目標 → cordon 節點、建一個 privileged Job（nsenter 進主機）：
              下載 sysext → 換 /etc/extensions symlink → systemd-sysext refresh
              → kubeadm upgrade apply 或 node → systemctl restart kubelet
            Job 執行中 → retryAfterSeconds=30
            kubelet 版本 = 目標且仍 cordon → uncordon
            kubelet 版本 = 目標且未 cordon → 完成（retryAfterSeconds=0）
            Job 失敗 → Failure
```

分工：KubeadmControlPlane 負責哪台先、etcd 安全、逐台閘門；extension 只負責單台怎麼升。

程式分三層，全部 table-driven 測試：

| 目錄 | 職責 |
|---|---|
| `pkg/decision` | 純函式：這個變更能不能原地處理、下一步該做什麼 |
| `pkg/executor` | 跟 Kubernetes API 互動：cordon、建 Job、讀 Job 與節點狀態 |
| `pkg/handlers` | 三個 Runtime SDK hook 的串接 |

## 前提

- Cluster API v1.12 以上，core 與 KubeadmControlPlane controller 都要開 `RuntimeSDK=true` 和 `InPlaceUpdates=true`
  （只開 core 不開 KCP，hook 不會被呼叫，直接走換機 rollout）。
- 裸機必須設 `spec.rollout.strategy.rollingUpdate.maxSurge: 0`（v1beta1 是 `rolloutStrategy`）。
  預設 maxSurge=1 會先要求多開一台，資源池沒有備機就永遠卡住，輪不到 in-place。
- 節點是 Flatcar，kubelet 與 kubeadm 由 `kubernetes-<version>-x86-64.raw` sysext 提供，
  掛在 `/etc/extensions/kubernetes.raw`。
- 一個 HTTP 伺服器放目標版本的 sysext 檔（`--artifacts-url`）。
- 節點名要能從 Machine 推得：UpdateMachine 收到的 desired Machine 沒有 status，
  程式從 `spec.providerID` 的最後一段取節點名（Tinkerbell 的 Hardware 名 = 主機名 = 節點名）。

## 建置與部署

```bash
cd inplace-update
go test ./...
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o build/inplace-update .
docker build -t <registry>/inplace-update-ext:<tag> build/
docker push <registry>/inplace-update-ext:<tag>
```

改 `deploy/extension.yaml` 的 image 與 `--artifacts-url`，然後：

```bash
kubectl apply -f deploy/extension.yaml
kubectl apply -f deploy/certificate.yaml
kubectl apply -f deploy/extensionconfig.yaml
kubectl get extensionconfig inplace-updater -o jsonpath='{.status.handlers[*].name}'
```

看到三個 handler 名稱就註冊成功。之後改 KCP 版本：

```bash
kubectl patch kubeadmcontrolplane <name> --type=merge -p '{"spec":{"version":"v1.34.8"}}'
kubectl -n inplace-system get jobs -w
```

## 範圍與已知限制

- 只處理 KubeadmControlPlane，MachineSet（worker）一律不覆蓋。
- 只 cordon 不 evict，適合 patch 版本升級。
- 升級 Job 是 privileged + hostPID，這是 nsenter 模式的本質；RBAC 已收到最小：nodes 讀加 patch、jobs 限本 namespace。
- artifacts 走 HTTP，正式環境要 TLS 或校驗和。
- **rollout 進行中不要重部署 extension**。KCP 對某台的 CanUpdateMachine 呼叫失敗時，fallback 是換機重建，不是等待。
- 換機重建的節點會照安裝範本裝舊版 sysext，但 Machine spec 已是新版，KCP 視為已更新不再觸發 in-place。
  範本的 sysext 版本要跟著 KCP version 走，這是後續要補的。
- 升級腳本刻意不用 `kubelet --version` 做提前退出：sysext merge 後 binary 是新版，但執行中的 kubelet 還是舊的，
  失敗重試會被誤判為完成。要不要跑由狀態機依節點回報的版本決定，腳本每步各自冪等。

## 跨 minor 升級

機制不用改，腳本先換 sysext 再 `kubeadm upgrade`，天然用新版 kubeadm 執行。差別在升級前檢查：
Cluster API 的版本支援矩陣、CNI 相容性、API deprecation 掃描、安裝範本的 sysext 版本跟隨。
多跳升級用 Cluster API 的 chained upgrades。
