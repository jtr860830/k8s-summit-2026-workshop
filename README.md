# 用 Kubernetes 打造自動化私有雲基礎設施

KubeSummit 2026 體驗工作坊（9/10、9/11）的學員教材。90 分鐘內，你會在自己的筆電上親手體驗：

- 用 **Cluster API** 以宣告式的方式建立、擴縮、汰換一整個 Kubernetes 叢集
- 用 **kro** 把 200 行的基礎設施定義收斂成 6 行的平台 API —— 也就是「私有雲的自助服務目錄」

工作坊現場另有真實裸機測試床的三段示範：插電自動上架、保留資料碟的節點重灌、零停機原地升級。

## 開始之前（會前必做）

> **請務必在工作坊前完成前置作業。** 現場網路無法供 60 人同時下載數 GB 的映像檔；
> 沒完成的學員現場會有 USB 備援，但流程較慢。

1. 詳讀並依照 [`setup/prereqs.md`](setup/prereqs.md) 準備環境（macOS 或 Linux、Docker、4 CPU / 8 GB RAM 以上）
2. 執行一鍵準備腳本，直到看見 `SETUP-OK`：

```bash
git clone https://github.com/jtr860830/k8s-summit-2026-workshop.git
cd k8s-summit-2026-workshop
./setup/setup.sh
```

## 現場三步開跑

1. 確認 `./setup/setup.sh` 曾輸出 `SETUP-OK`（或依講師指示使用 USB 備援：`./setup/load-from-usb.sh`）
2. 等講師口令，開啟第一幕：[`labs/01-capi/README.md`](labs/01-capi/README.md)
3. 跟不上進度時，執行對應段落的追趕腳本（`labs/checkpoints/`），一鍵回到隊伍裡

## 目錄導覽

| 路徑 | 內容 |
|---|---|
| `setup/` | 前置指南、一鍵準備腳本、USB 備援工具 |
| `labs/01-capi/` | 第一幕：裸 Cluster API —— 感受 200 行的份量 |
| `labs/02-kro/` | 第二幕：kro 服務目錄 —— 6 行開出一個叢集 |
| `labs/checkpoints/` | 各段落的追趕腳本 |
| `rgd/` | 工作坊版 `WorkloadCluster` 平台 API（kro ResourceGraphDefinition） |
| `slides/` | 簡報 |
| `instructor/` | 講師用：示範 runbook 與時間表（學員不需閱讀） |

## 授權

Apache License 2.0，詳見 [LICENSE](LICENSE)。
