# 第二幕：kro 服務目錄 —— 6 行開出一個叢集

第一幕的 200 行是「基礎設施工程師」的世界。這一幕你會把它包成**平台 API**，
然後換上「平台使用者」的帽子 —— 最後再換上「平台工程師」的帽子改造它。

> 預估時間：25 分鐘。前提：第一幕終點狀態（mgmt 叢集 + CAPD，demo 已拆）。
> 不在終點？跑 `../checkpoints/reset-to-01-end.sh`。

## 1. 安裝 kro（約 1 分鐘）

```bash
kind load image-archive ~/.summit-workshop/images.tar --name mgmt   # 已載過會自動跳過
helm install kro ~/.summit-workshop/kro-0.9.3.tgz -n kro-system --create-namespace
kubectl -n kro-system rollout status deploy/kro
```

## 2. 定義平台 API（約 1 分鐘）

先看看這份 ResourceGraphDefinition —— 它把第一幕的七個物件封裝成一個新的 API：

```bash
less rgd/workloadcluster-capd.yaml
kubectl apply -f rgd/workloadcluster-capd.yaml
kubectl get rgd -w        # 等 STATE 變 Active（約 30 秒）
kubectl get crd workloadclusters.kro.run
```

**你剛剛在 Kubernetes 裡創造了一個新的 API。** `kubectl explain workloadcluster.spec` 看看它長什麼樣。

## 3. 六行，一個叢集（約 4 分鐘收斂）

```bash
cat <<EOF | kubectl apply -f -
apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata: {name: team-a}
spec: {}
EOF
watch kubectl get machines,workloadclusters
```

沒錯 —— **`spec: {}`**。所有第一幕你看過的欄位都有了合理預設。
`docker ps` 依然看得到機器容器：同一套底層，不同的抽象高度。

**預期**：`workloadcluster/team-a` 的 `CONTROLPLANEREADY` 轉 `true`。
（status 是從底層 KubeadmControlPlane 匯總上來的 —— 使用者不用懂底層也看得懂狀態。）

## 4. 用平台使用者的方式擴容（約 2 分鐘）

```bash
kubectl patch workloadcluster team-a --type merge -p '{"spec":{"nodes":2}}'
watch kubectl get machines
```

改一個數字，底層的 MachineDeployment 跟著動 —— 更新語義穿透抽象層。

## 5. 高可用？改一個字（約 30 秒，只驗展開不等收斂）

```bash
cat <<EOF | kubectl apply -f -
apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata: {name: team-ha}
spec: {profile: ha, nodes: 0}
EOF
kubectl get kubeadmcontrolplane team-ha-control-plane -o jsonpath='{.spec.replicas}'; echo
kubectl delete workloadcluster team-ha    # 看到 3 就好，資源留給 team-a
```

**預期**：`3` —— `profile` 一個字，控制平面從 1 台變 3 台。
（這是平台在幫使用者做架構決策：single-node 給開發、ha 給生產。）

## 6. 想搞破壞？平台說不（約 30 秒）

```bash
cat <<EOF | kubectl apply -f -
apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata: {name: bad}
spec: {certSANs: [evil.example]}
EOF
```

**預期**：`strict decoding error: unknown field "spec.certSANs"` ——
schema 沒開放的欄位碰不到。**哪些可調、哪些鎖死，本身就是平台 API 的設計。**

## 7. 但留了逃生門（約 1 分鐘）

```bash
cat <<EOF | kubectl apply -f -
apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata: {name: team-a}
spec:
  nodes: 2
  advanced:
    kubeletExtraArgs: {v: "2"}
EOF
kubectl get kubeadmcontrolplane team-a-control-plane -o jsonpath='{.spec.kubeadmConfigSpec.initConfiguration.nodeRegistration.kubeletExtraArgs}'; echo
```

**預期**：`{"v":"2"}` 原樣到達底層 —— 進階使用者仍有細部調整的窗口，
但只在平台指定的錨點。

## 8. 拆掉 —— 一個指令、零孤兒（約 2 分鐘）

```bash
kubectl delete workloadcluster team-a
watch kubectl get cluster,machines,dockercluster
```

**預期**：七個底層物件與所有容器全部消失。使用者不需要知道拆的順序。

## 9. 加碼：換上平台工程師的帽子

編輯 `rgd/workloadcluster-capd.yaml`，在 `advanced:` 下加一個欄位（例如
`labels: 'map[string]string | default={}'`），重新 `kubectl apply` ——
RGD 熱更新，既有的 instance 不受擾動，新欄位立即可用。
**平台 API 的演進，就是改一份 YAML。**

---

## 你剛剛做了什麼

第一幕 200 行 → 第二幕 6 行。差距不是魔法，是**平台工程**：
把專家知識（那 200 行怎麼寫、哪些欄位危險）封裝成預設值與鎖死欄位，
把選擇權（幾台、什麼版本、要不要 HA）留在高階 API 上。

我們的真實私有雲平台用的是同一份 schema —— 底層把 Docker provider
換成裸機（Tinkerbell）與虛擬機（KubeVirt）provider 而已。這就是講師示範段的世界。

## 這步失敗看這裡

- RGD 卡在 `Inactive` 超過 1 分鐘 → `kubectl describe rgd workloadcluster` 看訊息
- machine 容器開不出來、`docker logs <容器>` 出現 `Too many open files` →
  inotify 限額不足：`sudo sysctl -w fs.inotify.max_user_watches=1048576 fs.inotify.max_user_instances=8192`
- 收斂特別慢 → 確認第一幕的 demo 叢集拆了（`kubectl get clusters`）——
  8 GB 的機器同時養兩個叢集會餓死
