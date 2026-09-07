# 講師示範 runbook（學員不需閱讀）

三段真實示範，全部採「料理節目式」：現場按扳機看即時反應，切到預熟環境看完成態。
每段設硬時限決策點 —— 超時就切預錄備援（重播頁已內建於簡報），不戀戰。

連線：雙線路（會場網路 + 手機熱點），Tailscale 經 node-01 跳板。
兩個舞台：
- **day0 環境**（node-05）：demo① 用。`ssh -F poc/01-flatcar-tinkerbell/ssh_config day0-seed`
- **測試床**（node-02）：demo②③ 用。`ssh -F poc/01-flatcar-tinkerbell/ssh_config poc1-seed`，
  `KUBECONFIG=~/mgmt.kubeconfig`

## 演前一日清單（9/9）

1. `capstone/workshop/reset-testbed.sh` —— 測試床健康、demo② 指紋、v1.34.8/9 sysext、地雷；day0 環境回到步驟 5 空景（實測 7 分鐘）
2. **重新產生 USB 備援包**（快照跟最終 HEAD）：workshop-lab 上 `git pull && ./setup/offline-bundle.sh ~/usb-test`（1.1G），
   燒到 USB（exFAT，Mac/Linux 都能讀）；學員端指令：`./setup/load-from-usb.sh /Volumes/<USB>`（2026-09-07 全鏈實測通過）
3. 連線演練：會場網路 + 手機熱點雙線路，Tailscale 經 node-01 跳板到 poc1-seed / day0-seed / pve-node05 各打一次
4. 簡報 `npm run build` 一次、離線開一次 dist 確認字體與重播頁正常
5. Ceph HEALTH_OK（版本已釘 v19.2.6；若再有重灌節點拉到新版會回 HEALTH_WARN —— 釘版後不會）

## demo① 插電上架 —— 舞台：day0 環境（時限：discovery 2 分鐘內要出現）

- **演前準備**（會前一天 + 場間重置）：capstone repo 內
  `workshop/day0-env/reset-env.sh && for s in 1 2 3 4 5; do ./run-steps.sh $s; done`
  （快取在時約 10 分鐘）—— 環境停在「規則就位、舞台空著」= 簡報 day-0 第 5 步結尾
- **live**：`ssh pve-node05 'qm start 9211'` → 投影
  `watch kubectl -n tinkerbell get hardware,workflow` ——
  Hardware 無中生有、workflow 自動出現逐步執行（實測 +45 秒現身、5.5 分鐘裝完）
- **預熟**：不需要 —— 45 秒內就有畫面；解說期間 workflow 跑完更好
- 決策點：120 秒沒看到 Hardware → 切簡報 day-0 第 6 步重播頁（同一個環境的錄製）
- 優勢：與簡報 day-0 章節同景 —— 「剛才頁面上的錄製，就是這個環境」

## demo② OSD 保留式重灌 —— 舞台：測試床（時限：drain 開始 3 分鐘內可見）

- **live**：先秀 `verify` 基線（sha256）→ `kubectl delete machines.cluster.x-k8s.io <一台 mgmt>`
  （必用全名 —— 短名被 BMC CRD 搶走）→ 投影 drain 事件與 workflow 建立
- **關鍵一步：等新 workflow 出現（PENDING）後重開該機** —— 沒有 BMC 沒人幫它重開機，
  舊 OS 會一直跑（2026-08-31 排練實測卡 43 分鐘）。
  主路線：本機 `ssh -F poc/01-flatcar-tinkerbell/ssh_config mgmt-<N> sudo reboot`（經跳板、taroko 金鑰 ——
  注意 poc1-seed 自己的金鑰進不了重灌後的節點；時序：看到 PENDING 再按）；
  備援：PVE 上 `qm reset <vmid>`（節點 ssh 不通時）。
  口播：「計畫性重灌一行 ssh 就走；機器爛到 ssh 不通的那天，你只剩電源鍵 ——
  Rufio/BMC 自動化的正是這根手指」
- 時效注意：OSD 離線約 10 分鐘會被標 out 開始搬資料 —— 電源循環不要拖
- **預熟**：切到會前已重灌完成的節點 → 跑 `poc/06-osd-reinstall/checks/verify-after.sh`
  現場比對 fsid 與 sha256 —— 「重灌了，資料一個位元都沒少」
- 決策點：180 秒沒看到 drain/workflow → 切影片
- 注意：確認 rook PDB 存在、Ceph HEALTH_OK 才開始（pre-flight 見 POC 6 README）
- 前置（已完成 2026-08-27）：node-02 儲存分家 —— 測試床 VM 磁碟移至 sas-lvm
  （兩顆專用 10K SAS），重灌的映像寫入不再與 thin pool 搶 IO

## demo③ 原地零停機升級 —— 舞台：測試床（時限：extension 接手 2 分鐘內可見）

- **live**：投影 `kubectl get machines.cluster.x-k8s.io -w`（記下 machine 的 uid）→
  `kubectl patch kubeadmcontrolplane mgmt-cp --type=merge -p '{"spec":{"version":"v1.34.8"}}'`
  → 升級 Job 出現（`kubectl -n inplace-system get pods -w`）
- **預熟**：切到已升級節點 → machine uid 不變、`uptime -s` 未變、kubelet 新版本
- 決策點：120 秒沒看到升級 Job → 切簡報 demo③ 重播頁（2026-08-26 實錄 v1.34.7）
- 彈藥已備：v1.34.8 sysext 已在 artifacts（Ceph RBD）；v1.34.9 為備用版
- 注意：`kubectl get machines` 短名會解析到 Rufio 的 BMC CRD —— 一律用全名
- 注意：rollout 進行中絕不重部署 extension（fallback = 換機重灌）

## 場間重置（9/10 場後執行；9/9 演前也跑一次）

- 一鍵：capstone repo `workshop/reset-testbed.sh`（`NEXT_K8S=v1.34.9` 為 9/11 場次 demo③ 目標）
  - 測試床：Ceph/PDB/KCP/extension 健康檢查、`write-baseline.sh` 重寫 demo② 指紋、
    確認下一版 sysext 在 artifacts、拆 super-admin.conf 空目錄地雷
  - day0 環境：`reset-env.sh` + 重跑步驟 1–5 → demo① 舞台空景（約 10 分鐘）
- **demo③ 目標版本**：9/10 場 v1.34.7→v1.34.8；9/11 場 v1.34.8→**v1.34.9**（簡報指令頁寫 v1.34.8，第二場口頭改一個數字）
- 簡報重播頁即錄影備援 —— 不需另備影片檔
