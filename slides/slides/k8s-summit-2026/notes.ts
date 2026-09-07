// 講者備忘（簡報者模式按 P 顯示）。純文字、保留換行。
// 【動作】= 切畫面或按扳機；【若被問】= 聽眾常問。
// 時間表、demo 扳機時點、裁減順序見 instructor/script.md。

export const RAW_NOTE = '完整錄製檔，帶過。';

export const nCover = `自我介紹一句：寬橋做平台工程，這套是我們自己私有雲的做法。
今天三件事：看機器插電自己裝好、自己動手用 Cluster API 開叢集、再把它包成 6 行的自助 API。`;

export const nAgenda = `兩段動手各 20 分鐘，其餘是示範和解說。
動手段有助教，卡住舉手；每步都有 reset 腳本可以追上。
Q&A 在場外，結束後我會在那裡。`;

export const nStep0 = `現在就跑 setup.sh。會前跑過的話 10 秒結束。
沒跑過或沒網路：舉手拿 USB，load-from-usb.sh，全程離線。
看到 SETUP-OK 才往下。`;

export const nStep1 = `兩個指令貼上去就好，7 分鐘。這段時間我講主張。
【動作】等多數人指令跑起來再翻頁，不用等跑完。`;

export const nThesis = `商用虛擬化兩個成本：授權費，以及一批只會那個平台的人。
立場：白牌硬體加 Kubernetes 原生工具，可以組出不被授權綁住的私有雲。
不是說商用的不好，是說有另一條路，而且已經走得通。`;

export const nClaim = `從裸機到自助服務，同一套 kubectl、YAML、RBAC、GitOps。
機器、叢集、上架規則都是 K8s 物件，等一下每一步都會看到 kubectl get。
好處在人：K8s 團隊直接接手基礎設施，不用另外養虛擬化、儲存的團隊。`;

export const nWhiteBox = `雲端業者早就是白牌伺服器加自研管理系統，只是管理系統不公開。
現在每一層都有成熟的開源專案，差別只剩有沒有人把它們接起來。
【彩蛋，可略】那些白牌伺服器很大一部分是台灣代工廠做的；K8s 也是雲端業者內部系統開源出來的。硬體和軟體我們都不是局外人。`;

export const nArchitecture = `由下往上念：Tinkerbell 裝機、Flatcar 當 OS、Rook-Ceph 和 Cilium、KubeVirt 跑虛擬機器、Cluster API 管叢集、kro 做自助 API。
今天動手碰 Cluster API 和 kro，示範碰 Tinkerbell 和 Flatcar，KubeVirt 只提不做。
每一層都是 CRD，這句話下面會反覆驗證。`;

export const nPrinciples = `三條：開源授權、每層可單獨換、商用 HCI 套裝和 source-available 不選。
缺點自己講：專案年輕、文件少、我們踩了六十多個坑，最後 Roadmap 會提。`;

export const nDemo1 = `【動作】切 day0-seed 終端：watch kubectl -n tinkerbell get hardware,workflow，畫面是空的。
【動作】另一視窗 ssh pve-node05 'qm start 9211'。說：「一台沒有 OS 的機器，剛開機。」
回簡報，接下來幾頁講原理，講完回來看它跑到哪。
決策點：120 秒沒看到 Hardware，改用 day-0 第 6 步重播頁，不等。`;

export const nTinkerbellStack = `smee 聽 PXE 廣播，不搶機房 DHCP。HookOS 是記憶體裡的小 Linux，不碰硬碟。tootles 給機器拿設定。tink 跑 workflow。Rufio 管 BMC 電源，選配。
一句收：Hardware、Template、Workflow 全是 CRD，全用 kubectl 管。
【若被問 tootles】舊名 hegel，v0.25 改名，功能一樣是 metadata 服務。`;

export const nEnrollFlow = `五步照念。第 5 步停一下：裝好 OS 是在池裡待命，不是加入叢集。
【若被問 什麼時候算進池】Hardware 出現就是登記進池；裝好 OS 是池內可用；加入叢集要等 Cluster API 來認領。三個時間點分開。
【若被問 為什麼不直接加入叢集】Tinkerbell 不知道叢集存在，Cluster API 不知道有機器插電。中間要有人決定這台去哪、當什麼角色。今天那個「人」還是人，Roadmap 要把它寫成 controller。`;

export const nHowPxe = `韌體內建的機制，1999 年的規格，每張伺服器網卡都有。
【若被問 順序】網卡發 DHCP discover → 機房 DHCP 給 IP，smee 以 ProxyDHCP 身份只補開機檔位址 → TFTP 抓 iPXE → HTTP 抓 HookOS kernel/initrd → HookOS 起來跟 tink 拿工作。
方向反過來：不是我們推指令，是機器每次開機來問。
BMC 不是必要。有 BMC 可以遠端開關機，沒有就得有人按電源或 ssh reboot。今天示範的機器都沒有 BMC。`;

export const nD0Prereq = `需要四樣，不需要四樣。重點在右邊：不需要既有 K8s、不需要 BMC、不需要動 DHCP。
【若被問 DHCP】IP 一直是機房 DHCP 發的。smee 走 auto-proxy 模式，只回答「開機檔在哪」，不發 IP。不用改交換器、不用改 DHCP 設定。
起始機可以是筆電，第 9 步會關掉它。`;

export const nD0Intro = `三組：準備起始機、自動上架、自我承載。
今天示範前六步，第一幕做完再回來講後三步。
每步一頁指令、一頁真實錄製的重播、一頁完整輸出。錄製是 8/25 在同一個環境錄的，跟現在投影的是同一台。`;

export const nD0S1 = `一行裝 k3s。兩個 disable 是踩過的雷：servicelb 會搶 kube-vip 的 IP，映像串流會斷。
重播 10 秒，看到 Ready 就翻。`;

export const nD0S2 = `helm 一行。values 只設四件事，念註解。
重播看三個 pod 和 CRD 清單。指著 CRD：「機器、範本、工作流都變成 K8s 物件了。」`;

export const nD0S3 = `原廠 Flatcar 映像、官方 SHA512 驗證、kubelet 用 sysext 疊上去。
為什麼 Flatcar：不可變 OS、沒有套件管理、升級是換整個 /usr。demo③ 靠這個。`;

export const nD0S4 = `base.bu 是 Butane 格式，轉成 Ignition。內容只有主機名、SSH 金鑰、kubelet sysext。
範本三個動作：寫映像、寫設定、重開機。它也是一個 K8s 物件。`;

export const nD0S5 = `這頁很短，重點在空景：Hardware 和 Workflow 都是零。
match-all 是示範用，正式環境會收斂成條件，例如特定機箱型號。
翻下一頁前說：「這就是剛才 demo 開始時的畫面。」`;

export const nD0S6 = `【動作】切回 day0-seed 終端。這時應該已有 Hardware 和 workflow，理想是 SUCCESS。
指著 Hardware 名字：MAC 是機器自己回報的，人沒有登記過。
workflow 三個動作跟第 4 步範本一致。
收尾動作：關 allowPXE，不然它每次開機都回到 HookOS。上游沒做，enrollment controller 要接。
現場沒跑完就用重播，實錄 5.5 分鐘壓成 25 秒。
結論一句：插電之後人沒碰過它。現在它在池裡待命。`;

export const nAct1Guide = `兩個終端機並排，一邊 machines 一邊 docker ps。
今天機器是 Docker container，因為教室沒有裸機。行為跟裸機一樣，只是快。
卡住就跑 reset 腳本，直接跳到第一幕結尾狀態。
【動作】確認全員 kind 已起來，沒起來的找助教。`;

export const nStep2 = `版本寫死是為了離線，讀的是會前預載的本地定義。
四個 provider：core、bootstrap、control-plane、infrastructure。infrastructure 今天是 docker，day-0 是 tinkerbell，其他三個一樣。`;

export const nStep3 = `先 less 看 200 行。七個物件，名字互相引用。
apply 之後看 machines 的 PHASE：Pending、Provisioning、Provisioned、Running。
docker ps 多三個 container：control plane、worker、負載平衡器。
【若被問 為什麼要 lb】kubeadm 控制平面前面固定要一個 endpoint，裸機上是 kube-vip 的 VIP，這裡用 haproxy container 代替。`;

export const nStep4 = `剛開好的叢集 NotReady 是正常的，Cluster API 不管 CNI。
裝 kindnet 是因為離線包小；正式環境是 Cilium。`;

export const nStep5 = `replicas 從 1 改 2，90 秒多一台。
第 8 步在裸機上做同一件事是 13 分鐘，因為要真的寫磁碟、真的重開機。`;

export const nStep6 = `MachineDeployment 跟 Deployment 同一套邏輯，少一台就補一台。
刪掉 2 秒新的就出現，53 秒 Running。
這是 Pod 的做法搬到機器層。記住這頁，demo② 要回來講它在裸機上的代價。
時間不夠先砍這步。`;

export const nStep7 = `delete cluster 一個指令，container 依序消失，沒有殘留。
mgmt 保留，第二幕還要用。`;

export const nAct1Recap = `左邊得到的、右邊付出的。付出的三條都是真的：200 行、名字錯一個字就垮、哪些欄位危險靠經驗。
最後一句：這是基礎設施工程師的日常，不該是使用者的日常。第二幕解這個。`;

export const nD0S7 = `跟第一幕步驟 2 同一個指令，差別是 infrastructure 換成 tinkerbell。
三個上游沒寫清楚的設定念註解。Ignition feature gate 要在 init 前開，因為 Flatcar 只吃 Ignition 不吃 cloud-init。`;

export const nD0S8 = `兩個 apply。第一個預先登記 Hardware，帶固定 IP 和 day0/role: mgmt 標籤。第二個是 Cluster API 叢集定義。
CAPT 看到 Machine，用 hardwareAffinity 挑有標籤的 Hardware，建 workflow，機器 PXE 進 HookOS 重灌，Ignition 裡有 kubeadm init。
重播 13 分鐘壓成 20 秒。Provisioning 停很久是正常的，機器在寫磁碟。
三顆雷：kubectl 的 machines 短名被 Rufio 的 BMC CRD 搶走要用全名、單控制平面要拔 taint、local PV 掛載點要 Ignition 預建。`;

export const nD0S9 = `管理叢集自己也要有 Tinkerbell 和 Cluster API，先裝。
搬 Hardware 和 Template，不搬 Workflow。Workflow 搬過去狀態歸零會重跑，機器會被重灌。
clusterctl move 之後停掉 seed 的 k3s，管理叢集裡的 Machine 還是 Running。
一句收：起始機關了，平台管理著自己。`;

export const nBootstrapFull = `四條照念。第一條是重點：起始機只放宣告，裝機和 kubeadm 是機器自己跑的。
move 搬的是 Cluster API 物件，apiserver 和 etcd 沒動過。
【若被問 雙向】move 沒有方向，只有來源和目標。管理叢集要重建時，先搬到臨時叢集接手，修好搬回來。Cluster API 文件就是這樣寫的。`;

export const nRoleDecision = `三個問題三個答案：哪一台看標籤、什麼角色看誰建的 Machine、幾台看 replicas。
上架是另一層，RuleSet 只管進不進池、裝什麼 OS。機器被認領前沒有角色。
【若被問 沒寫 hardwareAffinity】CAPT 從未認領的 Hardware 任選一台。第 6 步那台也在池裡，標籤是把「哪一台」從隨機變成可控。
【若被問 之後新機器怎麼加入】插電進池、人貼標籤、某個叢集 replicas 加一，CAPT 認領重灌加入。貼標籤今天是人手，這就是 Roadmap。`;

export const nPoolPolicy = `上游預設 HookOS 待命，認領時才裝，一次到位。代價：待命機不能 SSH、斷電要靠裝機服務拉起。
今天示範是先裝 Flatcar，池裡是活的機器，可以燒機、更新韌體。代價：被認領要再重灌一次。
誠實講：右邊「理論上可以直接 join」今天沒示範，走 CAPT 一律重灌。
沒有標準答案，是政策，可以按機型混用。政策要有地方宣告，Roadmap 會回來。`;

export const nAct2Intro = `右邊 6 行就是整個叢集定義。
平台工程是把第一幕那些決定寫成預設值，只開放需要選的欄位。
kro 是在 K8s 裡定義自己 API 的工具，RGD 一份 YAML 就長出 CRD 和 controller。`;

export const nFourLayers = `頂層精簡、advanced 選填、進階設定入口、其餘鎖死。
第 4 層反過來想：哪些欄位不開放，本身就是設計。步驟 5 會撞到。`;

export const nAct2Guide = `三種角色輪流：使用者、破壞者、平台工程師。
先確認第一幕的 demo 叢集拆了，8 GB 跑兩個叢集會不夠。
【動作】62 分：這時去測試床按 demo② 扳機（基線、delete Machine、PENDING 後 ssh reboot），再回來。`;

export const nA2S1 = `helm 裝 kro，apply RGD，等 STATE Active。
最後一行 get crd workloadclusters.kro.run：叢集裡多了一個 API。`;

export const nA2S2 = `spec: {} 就能開，所有欄位有預設。
4 分鐘收斂，CONTROLPLANEREADY 轉 true。底下七個 Cluster API 物件是 kro 建的。`;

export const nA2S3 = `patch nodes: 2，底下 MachineDeployment 跟著動。
使用者不知道 MachineDeployment 存在，也不需要知道。
【動作】70 分左右：確認 demo② 的 Machine 已 Running、Ceph HEALTH_OK，接著 patch kubeadmcontrolplane 版本按 demo③ 扳機，看到升級 Job 就回來。`;

export const nA2S4 = `profile: ha，kubeadmcontrolplane 的 DESIRED 變 3。
看到 3 就刪掉 team-ha，資源留給 team-a。`;

export const nA2S5 = `塞 certSANs，apply 直接被拒，unknown field。
不是 webhook 擋的，是這個欄位不在 schema 裡。`;

export const nA2S6 = `advanced.kubeletExtraArgs 原樣到底層 kubeadm。
注意控制平面開始滾動換機。改 kubeadm 設定就是換機器，這是 Cluster API 的正常行為。再一次鋪 demo②。`;

export const nA2S7 = `delete workloadcluster 一個指令，Cluster、Machine、container 全部回收，順序由 kro 和 Cluster API 處理。`;

export const nAct2Recap = `200 行變 6 行，少掉的是第一幕那些決定寫進 RGD。
我們自己的私有雲用同一份 WorkloadCluster schema，只換 infrastructure provider。
最後一句是問句：container 換一台幾十秒，裸機呢？翻頁。`;

export const nLineage = `Pod 換一個成本趨近零。Cluster API 把同一句話搬到 Machine：升級、修復都是換一台。
裸機換一台是重灌、搬資料、好幾個小時。這個落差是接下來兩個示範要解的。`;

export const nDemo2 = `【動作】切測試床終端。62 分按下的 delete 應該已跑完，Machine Running、Ceph HEALTH_OK。
這台節點上有 Ceph OSD。換機哲學最怕的就是有狀態的節點。
【若被問 Ceph 冗餘】三副本，一顆 OSD 離線是 HEALTH_WARN degraded，資料還有兩份。Rook 的 PDB 擋住 drain 不讓第二台同時走。OSD 離線約 10 分鐘會被標 out 開始搬資料，重灌要在這之前完成。
【若被問 HEALTH_OK 後面的 muted】Ceph 19.2.6 新增的 cephx 金鑰稽核，lab 內刻意靜音，Summit 後做金鑰輪替。`;

export const nD2Cmd = `念流程：記 sha256 和 fsid、delete Machine、等 PENDING、ssh reboot。
沒有 BMC 沒人幫它重開，這就是 Rufio 的位置。計畫性重灌一行 ssh 就走；機器爛到 ssh 不通那天，只剩電源鍵。
重灌只寫 OS 碟，資料碟 by-path 鎖定，Workflow 碰不到。`;

export const nD2Replay = `【動作】現場跑 verify-after.sh：fsid-MATCH、sha256-MATCH。
現場沒跑完就用這頁重播，8/31 排練實錄。
一句收：重灌了一台 Ceph 節點，資料一個位元都沒少。`;

export const nDemo3 = `裸機照換機哲學升級，每台重灌加資料重建。
Cluster API 的 in-place update 把升級交給外掛在節點上原地做。
驗證：Machine uid 不變、uptime 不歸零。`;

export const nD3Cmd = `只改 version 一個欄位。KCP 逐台編排，落後最多的先動。
maxSurge=0 是裸機前提：機房沒有多的機器可以先開一台。
9/11 場口頭改 v1.34.9。`;

export const nD3Replay = `【動作】現場 get machines.cluster.x-k8s.io 加 uid 欄；ssh mgmt-2 "uptime -s; kubelet --version"。
現場沒到就用這頁重播，8/26 實錄 v1.34.6→7。`;

export const nD3NodeReplay = `節點內部：sysext 換 /usr 疊加層、kubeadm upgrade node、restart kubelet。全程沒重開機。
【若被問 為什麼可以不重開】Flatcar 的 kubelet 是 sysext 疊加層，systemd-sysext refresh 換層不用重開。kubeadm upgrade 本來就是換 static pod。`;

export const nEcosystem = `GitOps、RBAC、Policy、觀測，四條各一句。
團隊每多會一個 K8s 工具，基礎設施就多一個能用的工具。`;

export const nRoadmap = `今天人手做的事：關 allowPXE、貼標籤、判斷開機時機。全該是同一個 controller。
Enrollment Controller：插電到退役；待命方式、貼標籤政策都在這裡宣告。
六十多項排雷是它的需求規格。開源進行，歡迎一起踩雷。`;

export const nCredits = `帶過。指一下簡報字體也是開源的。`;

export const nThanks = `repo 網址在畫面上，所有教材、day-0 九步都在裡面，可以自己照跟。
Q&A 區和寬橋攤位都找得到我。`;
