# 講師示範 runbook（學員不需閱讀）

三段真實測試床示範，全部採「料理節目式」：現場按扳機看即時反應，切到預熟環境看完成態。
每段設硬時限決策點 —— 超時就切預錄影片（切換台詞在講稿內），不戀戰。

連線：雙線路（會場網路 + 手機熱點），Tailscale 經 node-01 跳板；指令環境為 capstone repo
（`ssh -F poc/01-flatcar-tinkerbell/ssh_config poc1-seed`，`KUBECONFIG=~/mgmt.kubeconfig`）。

## demo① 插電上架（時限：discovery 2 分鐘內要出現）

- **live**：`qm start <目標機>` → 投影 `watch kubectl -n tinkerbell get hardware` ——
  Hardware 物件無中生有、CPU/RAM/磁碟屬性回報進來（全程真直播，這段本來就快）
- **預熟**：切到會前已裝完的另一台 → `kubectl get nodes` 它已是叢集成員
- 決策點：120 秒沒看到 Hardware → 切影片
- W2 排練時填入：目標機 VMID、重置指令、預熟機名稱

## demo② OSD 保留式重灌（時限：drain 開始 3 分鐘內可見）

- **live**：先秀 `verify` 基線（sha256）→ `kubectl delete machine <一台 mgmt>` →
  投影 drain 事件與 workflow 建立
- **預熟**：切到會前已重灌完成的節點 → 跑 `poc/06-osd-reinstall/checks/verify-after.sh`
  現場比對 fsid 與 sha256 —— 「重灌了，資料一個位元都沒少」
- 決策點：180 秒沒看到 drain/workflow → 切影片
- 注意：確認 rook PDB 存在、Ceph HEALTH_OK 才開始（pre-flight 見 POC 6 README）

## demo③ 原地零停機升級（時限：extension 接手 2 分鐘內可見）

- **live**：投影 `kubectl get machines -w`（記下 machine 的 uid）→ 改 KCP `spec.version`
  → extension 日誌接手畫面
- **預熟**：切到已升級節點 → machine uid 不變、`uptime` 未中斷、kubelet 新版本
- 決策點：120 秒沒看到 in-place 決策日誌 → 切影片
- 排練時順便把 mgmt-2 從 v1.34.1 拉平到 v1.34.6（一石二鳥）

## 場間重置（9/10 場後執行）

`reset-testbed.sh`（W2 填實）：目標機清空回待發現狀態、預熟環境重新預熟、
Ceph/extension 健康檢查、錄影備援檔案就位確認。
