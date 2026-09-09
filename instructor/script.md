# 講師備忘稿

逐頁講稿已放進簡報本身（`slides/slides/k8s-summit-2026/notes.ts`），簡報者模式按 P 在右側顯示。
【動作】= 切畫面或按扳機；【若被問】= 聽眾常問。本檔只留時間表、demo 扳機時點、裁減順序。

兩個世界的規則：深底頁 = DEMO（真實機房，學員看投影）；淺底頁 = HANDS-ON（跟著做）。每次切換都有過場頁，講稿裡也會說「放下鍵盤」或「回到動手」。

## 時間表（依簡報 Agenda 頁）

| 時間 | 頁 | 段落 |
|---|---|---|
| 00–03 | 1–8 | 開場、進行方式；**學員立刻跑「開始動手前」步驟 0/1**（kind create + load 約 7 分） |
| 03–10 | 9–15 | 主張 + Cluster API 名詞頁 |
| 10–30 | 16–39 | Tinkerbell 原理 + demo① 開機 + day-0 前六步 |
| 30–33 | — | 緩衝；確認全員 kind 已起來 |
| 33–53 | 40–59 | 第一幕：純 Cluster API（學員動手） |
| 53–62 | 60–72 | 過場對照 + day-0 後三步 + 收束三頁 |
| 62–82 | 73–97 | 第二幕：kro（學員動手）；70 分按 demo③ 扳機 |
| 82–90 | 98–111 | 換機原則、demo②③ 收割、生態、Roadmap、致謝 |

Q&A 由大會另闢場地，不佔課程時間。

### demo②③ 只有 8 分鐘：扳機要提前按

demo② 全程 13 分鐘、demo③ 全程 30 分鐘，都不可能在 82–90 分內跑完。做法：

- **62 分**（第二幕開始，學員在動手）：切測試床，先秀 sha256 / fsid 基線，`delete machines.cluster.x-k8s.io`，看到 workflow PENDING 就 ssh reboot。之後回簡報帶學員。
- **70 分**（第二幕步驟 3 左右）：確認 demo② 的 Machine 已 Running、Ceph HEALTH_OK。接著 patch kubeadmcontrolplane 版本，看到升級 Job 出現就回簡報。
- **82 分**：只剩收割。demo② 跑 verify-after 比對；demo③ 秀 uid、uptime、kubelet 版本。
- 任何一段扳機沒反應，直接用重播頁，不解釋、不等。

裁減順序（時間不夠先砍）：第一幕步驟 6（砍機器看補位）→ day-0 收束三頁只講角色頁 → demo③ 只放重播。

### 舞台

- day0 環境（node-05）：demo①。`ssh -F poc/01-flatcar-tinkerbell/ssh_config day0-seed`
- 測試床（node-02）：demo②③。`ssh -F poc/01-flatcar-tinkerbell/ssh_config poc1-seed`，`KUBECONFIG=~/mgmt.kubeconfig`
- 9/11 場 demo③ 目標是 v1.34.9，指令頁寫 v1.34.8，口頭說「今天改成 9」。
