// Speaker script (shown in presenter mode, press P). Plain text, newlines preserved.
// Per page: spoken script -> 【動作】 screen switches / demo triggers -> 【若被問】 likely questions.
// Timeline, demo trigger timing and cut order live in instructor/script.md.

export const RAW_NOTE = '完整錄製檔，帶過。有人問細節時停在這頁往下捲。';

export const nCover = `大家好，我是 Josh，在寬橋做平台工程。今天這 90 分鐘要講的東西，是我們自己私有雲的做法，不是概念，是這幾個月真的在機房裡跑起來的。

今天做三件事。第一，看一台空機器插電之後自己把作業系統裝好。第二，你們自己動手，用 Cluster API 開一個 Kubernetes 叢集。第三，把那七個物件包成一個，變成一個自助服務的 API。中間會穿插我們怎麼從零把整個平台建起來。`;

export const nAbout = `簡單自我介紹。我是謝禹沆，Josh，在寬橋做平台工程，同時是資工博士生。做的東西一直在基礎設施這一層：作業系統、網路、Kubernetes，最近幾年都在裸機和私有雲上面。

有在給幾個開源專案送 patch，rustup、Kubernetes 文件、koa 這些。今天講的內容也會用同樣的方式開源出來。`;

export const nAgenda = `時間配置是這樣。兩段動手各 20 分鐘，其餘是示範跟解說。動手段有助教在場，卡住就舉手；每一步都有 reset 腳本，落後了可以直接跳到那一步的結尾狀態，不會被丟下。

Q&A 大會另外有場地，結束之後我會在那邊，這 90 分鐘就專心把東西跑完。

現在請大家先翻到下一頁，有兩個指令要先跑，需要幾分鐘。`;

export const nStep0 = `第一個指令是環境檢查。會前有跑過的人，這裡大概 10 秒就會看到 SETUP-OK。

沒跑過、或者現在網路不通的，舉手，助教手上有 USB，跑 load-from-usb.sh 就好，所有映像跟定義檔都在裡面，全程不需要網路。

有任何一項打叉的，照訊息排除，排不掉就找助教。看到 SETUP-OK 再往下。`;

export const nStep1 = `第二個指令是建管理叢集。兩行貼上去就好，kind create 加上載入映像，大概 7 分鐘。這段時間我來講為什麼要做這件事。

【動作】等多數人指令跑起來就翻頁，不用等跑完。`;

export const nThesis = `先講立場。商用虛擬化平台的成本有兩個。第一個大家都知道，授權費，而且這幾年漲得很兇。第二個比較少人算進去：你要養一批只會那個平台的人，他們的技能綁在那個產品上，產品換了、授權模式變了，這批人的技能也跟著貶值。

我們的立場是，白牌硬體加上 Kubernetes 原生的開源工具，可以組出一套不被授權綁住的私有雲。不是說商用的不好，是說有另一條路，而且這條路現在已經走得通。今天就是把它走一遍給大家看。`;

export const nClaim = `具體的主張是這三條。

第一，從最底層的裸機到最上層的自助服務，全部用同一套工具管：kubectl、YAML、RBAC、GitOps。你不需要為了機器學一套、為了虛擬機器學一套、為了叢集再學一套。

第二，機器、叢集、上架規則，全部都是 Kubernetes 物件。等一下每一步你都會看到 kubectl get 出來一個東西，那個東西就是機器本身。

第三，也是我覺得最重要的：好處在人。你的 Kubernetes 團隊可以直接接手基礎設施，不用另外養虛擬化團隊、儲存團隊。`;

export const nWhiteBox = `為什麼是現在？大型雲端業者很早就是這樣做的：白牌伺服器，加上自己寫的管理系統。只是那套管理系統不公開，我們看不到。

現在不一樣了。裝機有 Tinkerbell，叢集有 Cluster API，儲存有 Rook-Ceph，虛擬機器有 KubeVirt，每一層都有成熟的開源專案。差別只剩下有沒有人把它們接起來。今天要示範的就是接起來之後長什麼樣。

怎麼挑，兩個原則。只用開源授權的專案，CNCF 或社群治理的，不用付授權費，也不會有人突然改條款。每個元件都能單獨抽換，不動其他層。商用 HCI 套裝跟 source-available 的方案因此不在選項裡，它們好用，但一用下去就被綁住了。

缺點也要自己講。這些專案都還年輕，文件少，坑要自己踩。我們這幾個月踩了六十多個，最後 Roadmap 會提怎麼處理。

【彩蛋，可略】順便講一個，那些白牌伺服器很大一部分是台灣代工廠做的；Kubernetes 本身也是雲端業者內部系統開源出來的。硬體跟軟體，我們都不是局外人。`;

export const nArchitecture = `這是整體架構，由下往上念。最底下 Tinkerbell 負責裸機裝機。上面一層 Flatcar 是作業系統。再上去儲存跟網路，Rook-Ceph 跟 Cilium。虛擬機器用 KubeVirt。叢集生命週期是 Cluster API。最上面 kro 做自助服務的 API。

今天你們動手會碰到 Cluster API 跟 kro；示範會碰到 Tinkerbell 跟 Flatcar；KubeVirt 只提不做，時間不夠。

右邊每一個工具，都是用 CRD 跟 controller 的方式運作。這句話等一下會反覆驗證。`;

export const nGlossary = `接下來會一直用到幾個詞，先用一張圖對齊。

左上是起始叢集，跑在起始機上的 k3s。它開出右邊的管理叢集，然後把管理權搬過去，這個動作叫 pivot，之後起始機就可以關掉。動手環境沒有這一步，你的 kind 一開始就是管理叢集。

管理叢集裡放的是 Cluster API 的 controller 和 provider。它往下開出工作負載叢集，擴縮、升級、拆掉也都是它做。每個工作負載叢集裡有幾個 Machine，對應幾個 Node。Machine 底下今天是 container，真實機房是裸機，也可以是虛擬機器。

下一頁把這五個詞各給一句定義。`;

export const nGlossaryTerms = `bootstrap cluster，起始叢集。跑在起始機上的臨時管理叢集，只為了開出第一個正式的管理叢集，之後關掉。動手環境沒有這一步。

中間兩個是今天最常講的。management cluster，管理叢集。放 Cluster API 那些 controller 的叢集，用它去開別的叢集。動手環境就是那個 kind；真實機房是三台裸機。workload cluster，工作負載叢集。被開出來、給人用的叢集。今天你們會開的 demo、team-a 都是。

provider。Cluster API 接底層的外掛。docker、tinkerbell、kubevirt。換底層只換這個，上面的 YAML 不動。這也是動手環境跟真實機房唯一的差別。

Machine。一台機器的 Kubernetes 物件。底下可能是 container、裸機、虛擬機器。你在叢集裡 get nodes 看到的 Node，是同一台機器的另一個名字。

後面聽到這五個詞，就回到前一頁那張圖。`;

export const nBackToDay0 = `第一幕收了，放下鍵盤，回到真實機房。

demo① 那台機器現在裝好 Flatcar，在資源池待命，還沒加入任何叢集。接下來三步是把 Cluster API 裝進起始機、在裸機上開出管理叢集、最後 pivot 讓它管理自己，起始機關機。

你剛做的步驟 2 和步驟 3，在這裡會用同樣的指令再看一次，差別只有 provider 從 docker 換成 tinkerbell。`;

export const nDemo1 = `九步講之前，先把機器開起來。接下來這一段是真實機房的示範，你們不用動手，看投影就好。

【動作】切 day0-seed 終端。畫面上是 watch kubectl get hardware,workflow，現在是空的，什麼都沒有。
【動作】另一個視窗 qm start 9211。

我剛剛開機了一台機器。這台機器硬碟是空的，沒有作業系統，沒有任何 agent，它只知道要從網路開機。接下來我什麼都不會做。我們回簡報講前五步，講到第 6 步回來看它。

決策點：120 秒沒看到 Hardware 出現，直接用 day-0 第 6 步的重播頁，不等。`;

export const nTinkerbellStack = `上架這件事靠 Tinkerbell，五個元件。

smee 負責聽 PXE 廣播、補充開機資訊，它不發 IP，不搶機房 DHCP 的位置。HookOS 是一個只存在記憶體裡的小型 Linux，機器開機先載入它，它回報硬體規格、執行安裝，不碰硬碟。tootles 是 metadata 服務，機器開機時來這裡拿自己的設定。tink 是 workflow 引擎，定義裝機要做哪幾步。Rufio 是 BMC 電源控制，選配，有 BMC 的機器可以遠端開關機。

重點是最後這句：Hardware、Template、Workflow 全部都是 CRD，全部用 kubectl 管。

【若被問 tootles】舊名 hegel，v0.25 改名，功能一樣。`;

export const nEnrollFlow = `插電之後機器經歷了什麼，五步。

第一步，網卡韌體廣播「我是這個 MAC，該做什麼？」，這就是 PXE。第二步，smee 補充開機資訊，機器把 HookOS 載進記憶體，硬碟還沒動。第三步，HookOS 回報硬體規格，叢集裡自動出現一個 Hardware 物件。第四步，符合規則就觸發 Workflow，把作業系統映像寫進硬碟。第五步，重開機進正式系統。

第五步停一下。裝好系統之後，機器是在資源池裡待命，不是加入叢集。加入哪個叢集、當什麼角色，是之後 Cluster API 來認領時決定的。這兩件事分開，後面會再講為什麼。

【若被問 什麼時候算進池】Hardware 出現就是登記進池；裝好 OS 是池內可用；加入叢集要等 Cluster API 認領。三個時間點分開。
【若被問 為什麼不直接加入叢集】Tinkerbell 不知道叢集存在，Cluster API 不知道有機器插電。中間要有人決定這台去哪、當什麼角色。今天那個「人」還是人，Roadmap 要把它寫成 controller。`;

export const nHowPxe = `PXE 不是新東西，1999 年的規格，每張伺服器網卡都內建。

網卡開機時會廣播：我是這個 MAC，有人要告訴我該做什麼嗎。Tinkerbell 只補充開機欄位，IP 照舊由機房 DHCP 發，所以不需要動現有網路設定。機器載入一個只活在記憶體的小系統，回報規格、執行安裝。

方向要注意，是反過來的。不是我們推指令給機器，是機器每次開機都來問，我們只負責回答。這代表機器不需要預先裝任何東西。

BMC 不是必要。有 BMC 可以遠端開關機，沒有就得有人按電源或 ssh reboot。今天示範的機器都沒有 BMC，連消費級的機器都能走這條路。

【若被問 順序】網卡發 DHCP discover → 機房 DHCP 給 IP，smee 以 ProxyDHCP 身份只補開機檔位址 → TFTP 抓 iPXE → HTTP 抓 HookOS kernel 和 initrd → HookOS 起來跟 tink 拿工作。`;

export const nD0Prereq = `那機房要準備什麼？需要四樣：一個 L2 網段當裝機網段、機房既有的 DHCP、一台 Linux 當起始機、要納管的伺服器支援網路開機。

重點在右邊，不需要的。不需要既有的 Kubernetes，不需要 BMC，不需要共享儲存或特殊交換器功能，不需要任何商業授權。

人只裝起始機這一台，其餘每台都是平台裝的。IP 還是機房 DHCP 發的，不用動現有網路設定。起始機可以是一台筆電，等一下第 9 步會把它關掉。

【若被問 DHCP】smee 走 auto-proxy 模式，只回答「開機檔在哪」，不發 IP。不用改交換器、不用改 DHCP 設定。`;

export const nD0Intro = `從零建起這個平台是九個步驟，三組。一到三準備起始機，四到六自動上架，七到九讓平台自己承載自己。

今天先示範前六步，第一幕做完再回來講後三步。每一步一頁指令、一頁真實錄製的重播、一頁完整輸出。錄製是 8 月 25 日在同一個環境錄的，跟現在投影的是同一台起始機。

九步走完起始機關機，之後每台新機器只剩插電、開機。`;

export const nD0S1 = `第一步，起始機裝 Kubernetes。用 k3s，一行。

兩個 disable 是踩過的雷。servicelb 會搶 kube-vip 的 IP，映像串流會斷在一半，第一輪裸裝就是這樣掛的。traefik 用不到，關掉省資源。

重播 10 秒，看到 Ready 就翻。`;

export const nD0S2 = `第二步，裝 Tinkerbell。helm 一行，values 只設四件事：收 PXE 廣播的網卡、兩個服務 IP、auto-proxy 模式、自動發現跟上架的開關。

重播看三個 pod 起來，還有 CRD 清單。指著 CRD：從這一刻起，機器、範本、工作流都變成 Kubernetes 物件了。`;

export const nD0S3 = `第三步，準備作業系統映像。三件事：下載 Flatcar 原廠映像，驗 SHA512；下載 kubelet 的 sysext，這是疊在映像上的一層；放進映像伺服器目錄。

為什麼選 Flatcar。它是不可變的作業系統，沒有套件管理，升級是整個 /usr 換掉。demo③ 的免重開升級就是靠這個特性。`;

export const nD0S4 = `第四步，安裝範本，定義進來的機器怎麼裝。

base.bu 是 Butane 格式，轉成 Ignition。內容只有主機名、SSH 金鑰、kubelet sysext，最小設定。範本本身三個動作：寫映像、寫設定、重開機。它也是一個 Kubernetes 物件，kubectl get template 看得到。`;

export const nD0S5 = `第五步，上架規則，定義哪些機器要裝。

這頁的重點在空景。apply 規則之前先 get 一次，Hardware 跟 Workflow 都是零。規則建好了，池裡還沒有任何機器。

今天用 match-all，任何機器回報屬性就觸發安裝。正式環境會收斂成條件，例如只收特定機箱型號。

翻下一頁前說：這就是剛才 demo 開始時的畫面。`;

export const nD0S6 = `第六步，插電。我們回去看剛才那台機器。

【動作】切回 day0-seed 終端。這時候應該已經有 Hardware 和 workflow，理想狀態是 SUCCESS。

看 Hardware 的名字，後面那串是 MAC，是機器自己回報的，我沒有登記過它。workflow 三個動作跟第 4 步範本一致：寫映像、寫設定、重開機。

有一個收尾動作要講：關 allowPXE。不然它每次開機都會回到 HookOS 重來一次。這是上游沒做的事，今天是腳本補的，之後要交給 controller。

現場沒跑完就用重播，實錄 5.5 分鐘壓成 25 秒。

結論一句：插電之後人沒有碰過它。現在它在池裡待命，可以 ssh 進去，是一台活的 Flatcar。`;

export const nAct1Guide = `剛剛那段是真實機房。現在回到動手，第一幕開始，接下來 20 分鐘你們自己動手。

先講今天跟真實環境的差別。教室沒有裸機，所以今天的機器是 Docker container。Cluster API 有一個 Docker 的 provider，行為跟裸機完全一樣，只是快很多。

建議開兩個終端機並排，一邊 watch kubectl get machines，一邊 watch docker ps，你會看到 Machine 物件跟 container 一對一出現。

README 在 labs/01-capi 裡，照著走。卡住就跑 reset 腳本，直接跳到第一幕結尾狀態。

【動作】確認全員 kind 已起來，沒起來的找助教。`;

export const nStep2 = `步驟 2，裝 Cluster API。版本寫死是為了離線，讀的是會前預載的本地定義檔。

四個 provider：core、bootstrap、control-plane、infrastructure。infrastructure 今天是 docker，day-0 是 tinkerbell，其他三個一模一樣。這就是 Cluster API 的設計，換底層只換一個 provider。`;

export const nStep3 = `步驟 3，開一個叢集，用最原始的方式。先 less 看一下那份 YAML，感受一下。七個物件，名字互相引用。

apply 之後看 machines 的 PHASE 走：Pending、Provisioning、Provisioned、Running，大概 3 分鐘。另一邊 docker ps 會多三個 container：一台 control plane、一台 worker、一個負載平衡器。

【若被問 為什麼要 lb】kubeadm 控制平面前面固定要一個 endpoint，裸機上是 kube-vip 的 VIP，這裡用 haproxy container 代替。`;

export const nStep4 = `步驟 4，進新叢集裝 CNI。剛開好的叢集節點是 NotReady，這是正常的，Cluster API 不管 CNI，它只管機器。

裝 kindnet 是因為離線包小；正式環境我們用 Cilium。裝完大概 1 分鐘轉 Ready。`;

export const nStep5 = `步驟 5，擴容。replicas 從 1 改 2，90 秒多一台 worker。

記一下這個時間。等一下 day-0 第 8 步在裸機上做同一件事是 13 分鐘，因為要真的寫磁碟、真的重開機。指令完全一樣，差的只是底層。`;

export const nStep6 = `步驟 6，砍一台機器，看它自動補。MachineDeployment 跟 Deployment 是同一套邏輯，少一台就補一台。

錄製裡刪掉 2 秒新的就出現，53 秒回到 Running。這是 Pod 的做法搬到機器層。記住這頁，demo② 要回來講它在裸機上的代價。

時間不夠這步先砍。`;

export const nStep7 = `步驟 7，拆掉。delete cluster 一個指令，container 依序消失，沒有殘留。

mgmt 那個 kind 叢集不要刪，第二幕還要用。`;

export const nAct1Recap = `第一幕你們剛剛做了什麼。左邊是得到的：叢集是一份宣告，apply 就有；擴縮、汰換都是改欄位；機器變成 cattle。

右邊是付出的，三條都是真的。七個物件、一整份 YAML。名稱互相引用，錯一個字全垮。哪些欄位危險，要靠經驗。

這是基礎設施工程師的日常，但不該是使用者的日常。第二幕就是解這個。在那之前，先把 day-0 後三步講完。`;

export const nD0S7 = `第七步，起始機裝 Cluster API。跟你們剛才步驟 2 是同一個指令，差別是 infrastructure 換成 tinkerbell。

三個上游沒寫清楚的設定：provider 名錄要手動登記 tinkerbell，clusterctl 內建清單裡沒有它；CAPT 的 controller 要知道 Tinkerbell 的位址；Ignition 的 feature gate 要在 init 之前開，因為 Flatcar 只吃 Ignition，不吃 cloud-init。`;

export const nD0S8 = `第八步，開出管理叢集，這次是裸機。兩個 apply。

第一個預先登記一台 Hardware，帶固定 IP 跟一個標籤 day0/role: mgmt。第二個是 Cluster API 的叢集定義，跟你們第一幕那份同一個結構。

之後發生的事：CAPT 看到 Machine，用 hardwareAffinity 挑有標籤的 Hardware，替它建 workflow。機器 PXE 進 HookOS 重灌，這次 Ignition 裡有 kubeadm init。重開之後控制平面起來，Machine 轉 Running。

重播 13 分鐘壓成 20 秒。Provisioning 停很久是正常的，機器在寫磁碟。

這條 Flatcar 的 bootstrap 鏈在乾淨環境第一次全通，踩了三顆雷：kubectl 的 machines 短名被 Rufio 的 BMC CRD 搶走，要用全名；單控制平面要拔 taint，平台元件才排得上去；local PV 的掛載點要 Ignition 預建。`;

export const nD0S9 = `第九步，pivot，平台開始管理自己。

管理叢集自己也要有 Tinkerbell 跟 Cluster API，先裝。然後搬 Hardware 跟 Template，不搬 Workflow。Workflow 搬過去狀態會歸零，tink 會當成新的重跑，機器會被重灌，這是炸彈。

clusterctl move 之後，管理叢集裡看得到自己的 Machine。接著把起始機的 k3s 停掉，再看一次，Machine 還是 Running。

起始機關了，平台管理著自己。day-0 完成。

【若被問 為什麼叫 pivot】pivot 是 Cluster API 文件對這個場景的稱呼：起始叢集開出一個叢集，再把管理權搬進去，被管的變成管自己的，關係翻轉。早期 clusterctl 真的有 pivot 這個子指令，後來抽成通用的 move。move 是動作，pivot 是「目標叢集是自己開出來的」這種特例。`;

export const nBootstrapFull = `收一下 day-0，起始機做了什麼、沒做什麼。

它沒有建叢集。它只放了宣告，裝機、kubeadm、加入叢集都是機器自己跑完的。所以起始機可以是一台筆電，接上機房網段、跑完九步、pivot、關機，管理叢集不依賴它。

move 搬的是 Cluster API 的物件，Cluster、Machine、Hardware，不是叢集本身。apiserver、etcd、上面跑的東西全程沒動。

move 也不只用在 pivot。管理叢集要重建或搬遷的時候，先把物件搬到一個臨時叢集接手，修好再搬回來。Cluster API 文件就是這樣寫的。

【若被問 雙向】move 沒有方向的概念，只有來源跟目標。
【若被問 任何叢集都能搬】不是。目標要先 clusterctl init 同一組 provider；搬的是 Cluster API 物件加關聯的 Secret，Tinkerbell 的 Hardware、Template 不在範圍要自己搬；搬之前 Cluster 會被 paused，狀態要穩定。`;

export const nRoleDecision = `一台機器的角色是怎麼決定的，三個問題。

哪一台？看標籤。Hardware 上貼標籤，Machine template 用 hardwareAffinity 挑有對應標籤的機器，第 8 步的 day0/role: mgmt 就是這個。什麼角色？看誰建的 Machine。KubeadmControlPlane 建的是控制平面，MachineDeployment 建的是 worker，你們第一幕的 demo-md-0 就是後者。幾台？看 replicas。擴容、縮容、HA 都是改這個數字。

上架是另一層。RuleSet 只管誰能進池、裝哪個 OS。機器在被認領之前沒有角色。

今天的管理叢集只有控制平面、沒有 worker，拔掉 taint 讓平台元件直接跑在上面，worker 留給 工作負載叢集。

【若被問 沒寫 hardwareAffinity】CAPT 從未認領的 Hardware 任選一台。第 6 步那台也在池裡，標籤是把「哪一台」從隨機變成可控。
【若被問 之後新機器怎麼加入】插電進池、貼標籤、某個叢集 replicas 加一，CAPT 認領重灌加入。貼標籤今天是人手，這就是 Roadmap。`;

export const nPoolPolicy = `機器在池裡待命的時候，是什麼狀態？兩種做法。

上游預設是 HookOS 待命。機器停在記憶體裡的小系統，被認領那一刻才裝，一次到位，裝的就是最後要跑的系統，不需要收尾。代價是待命機不能 ssh，斷電之後要靠裝機服務重新拉起。

今天示範的是先裝一份基礎 Flatcar。池裡是活的機器，可以 ssh、可以燒機、可以更新韌體。代價是被認領去開新叢集時要再重灌一次。

誠實講，右邊那條「理論上可以直接 join 進現有叢集」今天沒示範，走 CAPT 一律重灌。

沒有標準答案，這是政策，可以按機型混用，已知機型直接裝、未知機型待命等鑑定。政策要有地方宣告，Roadmap 會回來講。`;

export const nAct2Intro = `第二幕，回到動手。右邊這幾行就是一個完整的叢集定義。

平台工程在做的事，是把第一幕那些決定寫成預設值：版本、CNI、控制平面幾台、哪些欄位開放。使用者只需要碰需要選的那幾個欄位。

用的工具是 kro。它讓你在 Kubernetes 裡定義自己的 API：寫一份 ResourceGraphDefinition，它就長出 CRD 跟 controller。`;

export const nFourLayers = `我們的平台 API 分四層。

頂層精簡，version、nodes、profile，全部有預設，spec 空的就能開。advanced 選填，網段、kubelet 參數，要調的人才需要知道它存在。第三層是進階設定的入口，原樣傳到底層，但只在平台指定的位置。第四層其餘鎖死，schema 沒宣告的欄位直接被拒。

第四層要反過來想：哪些欄位不開放，本身就是設計。步驟 5 會撞到它。`;

export const nAct2Guide = `第二幕開始，25 分鐘，三種角色輪流當。使用者：一個物件開叢集，改 profile 變 HA。破壞者：塞不該開放的欄位，看 apply 被拒。平台工程師：改 RGD，演進你的 API。

先確認第一幕的 demo 叢集拆了。8 GB 記憶體同時跑兩個叢集會不夠。

README 在 labs/02-kro。

【動作】62 分：這時去測試床按 demo② 扳機（記 sha256/fsid 基線、delete Machine、看到 PENDING 就 ssh reboot），再回來。`;

export const nA2S1 = `步驟 1，裝 kro，apply RGD，等 STATE 變 Active。

最後一行 get crd workloadclusters.kro.run。叢集裡多了一個 API，是你剛剛定義的。`;

export const nA2S2 = `步驟 2，一個物件，一個叢集。spec 是空的，所有欄位都有預設值。

大概 4 分鐘收斂，CONTROLPLANEREADY 轉 true。底下那七個 Cluster API 物件是 kro 建的，你沒有碰它們。`;

export const nA2S3 = `步驟 3，用平台使用者的方式擴容。patch nodes 等於 2，底下 MachineDeployment 跟著動，90 秒多一台。

使用者不知道 MachineDeployment 存在，也不需要知道。

【動作】70 分左右：確認 demo② 的 Machine 已 Running、Ceph HEALTH_OK，接著 patch kubeadmcontrolplane 版本按 demo③ 扳機，看到升級 Job 出現就回來。`;

export const nA2S4 = `步驟 4，高可用。加一行 profile: ha，kubeadmcontrolplane 的 DESIRED 變 3。使用者只寫了兩個字，控制平面從 1 台變 3 台。

看到 3 就把 team-ha 刪掉，資源留給 team-a。`;

export const nA2S5 = `步驟 5，換角色，當破壞者。塞一個 certSANs 進去，apply 直接被拒，錯誤是 unknown field。

注意這不是 webhook 擋的，是這個欄位不在 schema 裡。使用者連碰都碰不到。`;

export const nA2S6 = `步驟 6，但進階設定有入口。advanced.kubeletExtraArgs 原樣到底層 kubeadm，去 get kcp 可以看到 v 等於 2。

同時注意另一件事：控制平面開始滾動換機。改了 kubeadm 設定，Cluster API 的做法就是換機器，這是正常行為。記住這個，demo② 要講它在裸機上的代價。`;

export const nA2S7 = `步驟 7，拆掉。delete workloadcluster 一個指令，Cluster、Machine、container 全部回收，順序由 kro 跟 Cluster API 處理，使用者不需要知道要先拆什麼。`;

export const nAct2Recap = `第二幕你們做了什麼：在 Kubernetes 裡加了一個新的 API。

七個物件變一個，少掉的部分是第一幕那些決定寫進了 RGD。status、更新、刪除都照 Kubernetes 原本的方式運作，使用者不需要知道底下有 Cluster API。

我們自己的私有雲用的是同一份 WorkloadCluster schema，只換 infrastructure provider。今天底下是 Docker container，實際平台底下是裸機跟虛擬機器。

最後一個問題。兩幕裡機器壞了或設定改了，Cluster API 的做法都是換一台。container 換一台幾十秒。裸機呢？`;

export const nLineage = `最後這段，放下鍵盤，看真實機房。

這個原則叫 reconcile by replacement，壞了不修，直接換。

Pod 是這樣，換一個的成本趨近於零，所以敢這樣做。Cluster API 把同一句話搬到 Machine：升級、修復都是換一台新機器。

到了裸機，換一台是重灌、搬資料、好幾個小時。這個落差就是接下來兩個示範要解的。`;

export const nDemo2 = `demo②，重灌一台節點，資料一個位元都不少。

【動作】切測試床終端。62 分按下的 delete 應該已經跑完，Machine Running、Ceph HEALTH_OK。

這台節點上有 Ceph 的 OSD。換機哲學最怕的就是有狀態的節點，換一台等於資料要搬。我們的做法是：刪掉 Machine，Cluster API 自動重灌作業系統，重新入列，但資料碟全程不動，Ceph 沿用原來的 OSD。

驗證方式是重灌前後比對 sha256 跟叢集的 fsid。

【若被問 Ceph 冗餘】三副本，一顆 OSD 離線是 HEALTH_WARN degraded，資料還有兩份。Rook 的 PDB 擋住 drain，不讓第二台同時走。OSD 離線約 10 分鐘會被標 out 開始搬資料，重灌要在這之前完成。
【若被問 HEALTH_OK 後面的 muted】Ceph 19.2.6 新增的 cephx 金鑰稽核，lab 內刻意靜音，Summit 後做金鑰輪替。`;

export const nD2Cmd = `流程是這樣。先記下資料檔的 sha256 跟 Ceph 的 fsid。delete Machine，要用全名 machines.cluster.x-k8s.io，短名被 BMC 的 CRD 搶走了。

接著等 workflow 出現 PENDING，然後 ssh 進去 reboot。為什麼要人 reboot？因為這台沒有 BMC，沒人幫它重開，舊 OS 會一直跑。計畫性重灌一行 ssh 就走；機器爛到 ssh 不通的那天，你只剩電源鍵。這就是 Rufio 跟 BMC 的位置。

重灌只寫 OS 碟。資料碟用 by-path 鎖定，Workflow 碰不到它。`;

export const nD2Replay = `【動作】現場跑 verify-after.sh，看 fsid-MATCH、sha256-MATCH。

現場沒跑完就用這頁重播，8 月 31 日排練實錄。看 Ceph 那欄：osd 從 2 up 回到 3 up，HEALTH_OK，沿用原來的 OSD，實測 13 分鐘。

重灌了一台 Ceph 節點，資料一個位元都沒少。`;

export const nDemo3 = `demo③，升級 Kubernetes，機器不用重開機。

裸機照換機哲學升級，每台都要重灌加資料重建，三台控制平面就是三次。Cluster API 現在有 in-place update，把升級交給一個外掛在節點上原地執行，Machine 不換。

驗證方式：Machine 的 uid 不變，uptime 不歸零。`;

export const nD3Cmd = `只改 kubeadmcontrolplane 的 version 一個欄位，之後什麼都不用做。KCP 逐台編排，落後最多的先動，一台好了才輪下一台。

maxSurge 等於 0 是裸機的前提。雲上升級是先開一台新的再拆舊的，機房沒有多的機器可以先開。

9/11 場口頭改成 v1.34.9。`;

export const nD3Replay = `【動作】現場 get machines.cluster.x-k8s.io 加 uid 欄，跟升級前逐字相同；ssh mgmt-2 看 uptime -s 跟 kubelet --version。

現場沒到就用這頁重播，8 月 26 日實錄 v1.34.6 升 7。三台依序 Updating 再回 Running，30 分鐘。`;

export const nD3NodeReplay = `這頁是節點內部視角，升級外掛在節點上做了什麼。

下載新版 kubelet 的 sysext，換掉 /usr 上的疊加層，systemd-sysext refresh。kubeadm version 已經是新版。然後 kubeadm upgrade node，換 etcd 跟 apiserver 的 static pod。最後 restart kubelet。全程沒有重開機。

【若被問 為什麼可以不重開】Flatcar 的 kubelet 是 sysext 疊加層，refresh 換層不用重開。kubeadm upgrade 本來就是換 static pod。`;

export const nEcosystem = `都變成 Kubernetes 物件之後，你換到什麼。

GitOps：機房狀態全進 Git，叢集、機器、上架規則可版控、可稽核、可重建。RBAC：誰能開機器、誰能刪叢集，用管 Pod 的同一套權限模型。Policy：沒貼標籤的機器不准進池，一條 admission 規則的事。觀測：機器的生命週期就是 events 跟 metrics，現有監控直接沿用。

之後團隊每多會一個 Kubernetes 工具，基礎設施就多一個能用的工具。`;

export const nRoadmap = `下一步是把今天講的東西系統化，開源出來。

第一，今天有三件事還是靠腳本或人手補：上架裝完關 allowPXE、補齊 Hardware 欄位讓 CAPT 能認領、決定角色貼標籤。這些都要自動化，機器從插電到退役不用人碰。怎麼做我們還在收斂，controller 是其中一個做法。

第二，這幾個月的 POC、設定檔、踩到的六十多個坑，整理成一套完整的系統，不只是今天這份教材。

會開源。有興趣一起做的，會後找我。

【對應】關 allowPXE 是第 6 步，RuleSet 建的 Workflow 不能帶 bootOptions 所以翻不回來，錄製時是腳本等 SUCCESS 後 patch；CAPT 建的 Workflow 有 toggleAllowNetboot，第 8 步和 demo② 都是自動的。補欄位是第 8 步的預先登記，auto-discovery 產的 Hardware 缺 metadata.instance.id，CAPT 會 panic。貼標籤是第 8 步和角色頁。
【若被問 為什麼不用腳本就好】除了 BMC 電源之外都能先用腳本頂，但腳本是輪詢，會錯過 waitdaemon 45 秒的時序；controller 是 watch，還有 status 記狀態。計畫是先把腳本合成一個 Deployment 跑在管理叢集，再改寫成正式的。
demo② 的 ssh reboot 不算在內，那是沒有 BMC 的問題，該由 Rufio 接手。`;

export const nCredits = `這場工作坊全部由開源軟體組成，包括這份簡報跟它的字體。謝謝每一位維護者。今天示範的每一層都是開源社群的成果。`;

export const nThanks = `謝謝大家。repo 網址在畫面上，所有教材、day-0 那九步的設定檔都在裡面，回去可以自己照跟。

Q&A 區跟寬橋的攤位都找得到我，歡迎來聊。`;
