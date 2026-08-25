# day-0 建置指南：從零到插電自動上架，再到平台自我承載

這份指南重演整個平台的起點：一台普通的 Linux 機器出發，九個步驟之後，
你會有一個跑在裸機上、自己管理自己的 Kubernetes 管理叢集 ——
之後任何新機器插上電、接上網路線，就會自動裝好作業系統進入資源池。

每個步驟都經過完整重演驗證（從全新環境連續兩輪跑通、全程零人工介入），
簡報裡的指令與輸出就是這裡的真實錄製。

## 環境需求

| 項目 | 說明 |
|---|---|
| 起始機（seed） | 一台 Linux 機器（示範用 Ubuntu 24.04，4 核 8GB），兩張網卡：一張出網、一張接供裝網段 |
| 供裝網段 | 一個隔離的 L2 網段（示範用 172.16.91.0/24，seed 在 .2） |
| 空白機器 | 可 PXE 開機的機器（VM 或實體皆可）：UEFI、開機順序網路優先；VM 要加 VirtIO RNG（沒有它 HookOS 開機會卡熵池） |
| 機房 DHCP | 網段上要有 DHCP（示範用 seed 上的 dnsmasq）。Tinkerbell 用 auto-proxy 模式只補開機資訊，不搶 IP 主權 |
| 工具 | helm、butane（v0.29.0）、python3 + PyYAML |

網段出口（NAT）與 DHCP 的示範設定可參考本目錄的檔案註解；
IP 皆可換成你自己的網段，改 `tinkerbell-values*.yaml` 與各腳本開頭的常數即可。

## 版本

| 元件 | 版本 |
|---|---|
| k3s | v1.36.3+k3s1（stable channel） |
| Tinkerbell chart | v0.25.0 |
| Flatcar Container Linux | stable（示範時為 4593.2.5） |
| Kubernetes（管理叢集） | v1.34.6 |
| Cluster API / CAPT | v1.12.5 / v0.7.0 |
| Cilium | 1.18.3 |

## 九個步驟

### 1. 起始機裝 k3s

```bash
curl -sfL https://get.k3s.io | sh -s - --disable traefik --disable servicelb
```

`--disable servicelb` 不能省：k3s 內建的負載平衡器會跟 Tinkerbell 自帶的
kube-vip 搶 LoadBalancer IP，供裝中的映像傳輸會被中途掐斷（實測會斷在半路
還不報錯）。

### 2. 裝 Tinkerbell

```bash
helm install tinkerbell oci://ghcr.io/tinkerbell/charts/tinkerbell --version v0.25.0 \
  -n tinkerbell --create-namespace -f tinkerbell-values.yaml --wait
```

設定重點在 [`tinkerbell-values.yaml`](tinkerbell-values.yaml)：收 PXE 廣播的網卡、
兩個 LoadBalancer IP（本體與映像伺服器）、auto-proxy 模式、
自動發現與自動上架開關，以及記憶體上限（預設 128Mi 會被 OOM 反覆重啟）。

### 3. 備妥作業系統映像

```bash
./fetch-artifacts.sh
```

下載 Flatcar 原廠映像（帶官方 SHA512 驗證）與 kubelet sysext，
放進映像伺服器目錄。見 [`fetch-artifacts.sh`](fetch-artifacts.sh)。

### 4. 安裝範本

```bash
butane base.bu > config.ign
python3 gen-template.py config.ign | kubectl apply -f -
```

[`base.bu`](base.bu) 是新機器的最小設定（換成你的 SSH 公鑰）；
[`gen-template.py`](gen-template.py) 產生三個動作的安裝流程：
把映像寫進磁碟 → 把設定寫進 OEM 分割區 → 回報完成後重開機。

### 5. 上架規則

```bash
kubectl apply -f ruleset.yaml
```

[`ruleset.yaml`](ruleset.yaml) 是 match-all 規則：任何新機器回報屬性就觸發安裝。
正式環境可收斂成精準條件（例如只收特定機箱廠商）。

### 6. 插電時刻

把空白機器接上網路開機，然後什麼都不用做：

1. 機器 PXE 開機 → 進入 HookOS（記憶體中的臨時系統）
2. agent 回報硬體屬性 → `Hardware` 物件無中生有
3. 規則匹配 → 安裝 workflow 自動出現、逐步執行
4. workflow SUCCESS 後補一手「裝後收尾」（上游目前留白）：

```bash
kubectl -n tinkerbell patch hardware <discovery-名稱> --type=merge \
  -p '{"spec":{"interfaces":[{"dhcp":{"mac":"<MAC>"},"netboot":{"allowPXE":false}}]}}'
```

沒有這一手，裝完的機器重開機會再次 PXE、被撈回 HookOS。
這正是我們規劃中 enrollment controller 的核心職責之一：
監聽安裝完成、自動收尾 netboot 狀態。

機器自行重開進 Flatcar，用你的金鑰就能登入 —— 資源池的第一台機器上線。

### 7. 裝 Cluster API

```bash
./install-capi.sh
```

clusterctl + CAPI 核心 + Tinkerbell provider（CAPT）裝進 seed 的 k3s，
Ignition 格式的開機設定要在 init 前開 feature gate。
見 [`install-capi.sh`](install-capi.sh) —— 內含兩個上游沒寫清楚的必要設定
（provider 手動註冊、CAPT 的 `TINKERBELL_IP`）。

### 8. 開出管理叢集

```bash
python3 gen-mgmt-hardware.py 1 <管理節點的MAC> | kubectl apply -f -
python3 gen-mgmt-cluster.py mgmt 1 oem-stub.json "$(cat ~/.ssh/id_ed25519.pub)" | kubectl apply -f -
```

管理節點不走 match-all 規則，而是預先登記（固定 IP + 角色標籤，
CAPT 用標籤挑機器）。DHCP 要配合設靜態租約，且要忽略 client-id
（HookOS 與 Flatcar 的租約身份不同）：`dhcp-host=<MAC>,id:*,<IP>,<主機名>`。

機器開機後全自動：PXE 裝 Flatcar → OEM stub 去 tootles 拿 kubeadm 的
Ignition 開機設定 → kubeadm init → 節點註冊。之後裝 CNI：

```bash
clusterctl get kubeconfig mgmt > mgmt.kubeconfig
helm install cilium cilium/cilium --kubeconfig mgmt.kubeconfig -n kube-system \
  --version 1.18.3 --set ipam.mode=kubernetes --set kubeProxyReplacement=true \
  --set k8sServiceHost=<VIP> --set k8sServicePort=6443
```

### 9. Pivot：平台自我承載

```bash
# 單一控制平面節點要承載平台元件，先拔 taint
kubectl --kubeconfig mgmt.kubeconfig taint nodes mgmt-1 node-role.kubernetes.io/control-plane-

# mgmt 裝好 Tinkerbell（暫用備援 IP）與 CAPI
helm install tinkerbell ... --kubeconfig mgmt.kubeconfig -f tinkerbell-values-mgmt.yaml
EXP_KUBEADM_BOOTSTRAP_FORMAT_IGNITION=true clusterctl init --kubeconfig mgmt.kubeconfig ...

# 搬資料面（Hardware/Template；Workflow 歷史絕對不搬 —— 匯入後狀態歸零
# 會把 allowPXE 翻回 true，機器一重開就會被重灌）
kubectl -n tinkerbell delete workflow --all
clusterctl move --to-kubeconfig mgmt.kubeconfig
```

move 完成後，管理叢集裡看得到「自己」的 Machine —— 把 seed 關掉，
它依然好好的。從此平台管理自己，seed 功成身退。

## 踩過的雷（照跟時請留意）

| 症狀 | 原因與解法 |
|---|---|
| 映像寫到一半停住、workflow 卻回報成功 | 宿主機儲存過載（thin pool 被其他負載壓死）。換一台乾淨的宿主機，或確認磁碟頻寬 |
| 裝完的機器一直回到 HookOS | 步驟 6 的裝後收尾沒做（`allowPXE` 還是開的） |
| `kubectl get machines` 一直是空的 | 短名被 Tinkerbell 的 BMC CRD（`machines.bmc.tinkerbell.org`）搶走，用全名 `machines.cluster.x-k8s.io` |
| mgmt 上 hookos 卡 ContainerCreating | local PV 的掛載點 `/opt/hook` 不存在 —— 本目錄的 oem-stub.json 已內建預建目錄 |
| Tinkerbell 元件反覆重啟 | chart 預設記憶體上限 128Mi 太小，values 調 512Mi |
| 靜態租約沒生效、拿到別的 IP | 舊階段殘留租約佔位：清 lease 檔；租約要用 `id:*` 忽略 client-id |
