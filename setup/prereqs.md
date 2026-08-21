# 前置作業（會前必做）

工作坊現場的網路無法讓 60 人同時下載數 GB 的映像檔。**請在工作坊前完成本頁**，
現場只需要一台開得起 Docker 的筆電。

## 硬體需求

- CPU 4 核以上、記憶體 8 GB 以上（Docker 可用的部分）、可用磁碟空間 20 GB 以上
- macOS（Intel 或 Apple Silicon 皆可）或 Linux
- Windows：**不在現場支援範圍**。WSL2 + Docker Desktop 理論上可行，歡迎自行嘗試，
  但現場恕無法協助除錯。

## 軟體安裝

| 工具 | 版本 | 安裝方式 |
|---|---|---|
| Docker | 任何近期版本 | macOS：[Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/)；Linux：[Docker Engine](https://docs.docker.com/engine/install/) |
| kind | **v0.30.0**（版本重要，見下註） | [安裝說明](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) |
| clusterctl | v1.13.4 | [釋出頁面](https://github.com/kubernetes-sigs/cluster-api/releases/tag/v1.13.4) |
| kubectl | v1.30 以上 | [官方說明](https://kubernetes.io/docs/tasks/tools/) |
| helm | v3 | [官方說明](https://helm.sh/docs/intro/install/) |

> **為什麼指定 kind v0.30.0？** 我們在多種環境實測過這個組合；
> 較新的 kind 版本在部分虛擬化環境有無法啟動的已知狀況。照表安裝，現場最順。

macOS 使用者請記得在 Docker Desktop 的 **Settings → Resources** 把 CPU 調到 4 核以上、
記憶體調到 8 GB 以上。

## 一鍵準備

工具裝好後：

```bash
git clone https://github.com/jtr860830/k8s-summit-2026-workshop.git
cd k8s-summit-2026-workshop
./setup/setup.sh
```

腳本會檢查環境、預拉全部映像檔（約 2 GB）、產生離線快取。
**看到 `SETUP-OK` 才算完成**；任何 ✗ 項目照訊息排除後重跑即可（已完成的步驟不會重做）。

## 常見問題

- **`docker: permission denied`（Linux）**：把自己加進 docker 群組後重新登入：
  `sudo usermod -aG docker $USER`
- **公司網路拉不了映像檔**：換一般網路（家用或手機熱點）再跑一次。
- **來不及做完**：現場備有 USB 隨身碟（`./setup/load-from-usb.sh`），但流程較慢，
  建議還是提前完成。
