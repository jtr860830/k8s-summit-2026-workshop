import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#faf5f2', text: '#262626', accent: '#c00000' },
  fonts: {
    display: '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif',
    body: '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif',
  },
  typeScale: { hero: 150, body: 38 },
  radius: 14,
};

const muted = '#8f8f8f';
const mutedDark = '#d9d9d9';
const darkBg = 'linear-gradient(160deg, #17171c 0%, #1d1d24 70%, #26181a 100%)';
const mono = '"Maple Mono NF CN", "Maple Mono", Consolas, Menlo, monospace';
const codeBg = '#1b1b20';
const codeBorder = '#2c2c34';

const fill = { width: '100%', height: '100%', fontFamily: 'var(--osd-font-body)' } as const;

const Footer = ({ dark = false }: { dark?: boolean }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute', left: 120, right: 120, bottom: 44,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 22, color: dark ? mutedDark : muted, letterSpacing: '0.05em',
      }}
    >
      <span>用 Kubernetes 打造自動化私有雲基礎設施 · KubeSummit 2026</span>
      <span>{String(current).padStart(2, '0')} / {total}</span>
    </div>
  );
};

const Eyebrow = ({ children, dark = false }: { children: string; dark?: boolean }) => (
  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.25em', color: dark ? '#f0b5a1' : 'var(--osd-accent)' }}>
    {children}
  </div>
);

const H = ({ children, size = 76 }: { children: React.ReactNode; size?: number }) => (
  <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: size, fontWeight: 900, margin: '20px 0 0', lineHeight: 1.15 }}>
    {children}
  </h2>
);

const Light = ({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) => (
  <div style={{ ...fill, background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: 120, position: 'relative' }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <H>{title}</H>
    <div style={{ marginTop: 52 }}>{children}</div>
    <Footer />
  </div>
);

const Dark = ({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) => (
  <div style={{ ...fill, background: darkBg, color: '#ffffff', padding: 120, position: 'relative' }}>
    <Eyebrow dark>{eyebrow}</Eyebrow>
    <H size={88}>{title}</H>
    <div style={{ marginTop: 52 }}>{children}</div>
    <Footer dark />
  </div>
);

const Code = ({ children, size = 30 }: { children: string; size?: number }) => (
  <pre
    style={{
      fontFamily: mono, fontSize: size, lineHeight: 1.55, color: '#e8e8e8',
      background: codeBg, border: `1px solid ${codeBorder}`, borderRadius: 'var(--osd-radius)',
      padding: '28px 36px', margin: 0, whiteSpace: 'pre',
    }}
  >
    {children}
  </pre>
);

const Li = ({ children, gap = 22 }: { children: React.ReactNode; gap?: number }) => (
  <li style={{ marginBottom: gap, lineHeight: 1.55 }}>{children}</li>
);

const Red = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)', fontWeight: 800 }}>{children}</span>
);

/* ── 01 封面 ─────────────────────────────────────────── */
const Cover: Page = () => (
  <div style={{ ...fill, background: darkBg, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px', position: 'relative' }}>
    <Eyebrow dark>KUBESUMMIT 2026 · 體驗工作坊</Eyebrow>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 108, fontWeight: 900, margin: '36px 0 0', lineHeight: 1.2 }}>
      用 Kubernetes 打造<br />自動化私有雲基礎設施
    </h1>
    <p style={{ fontSize: 36, color: mutedDark, marginTop: 48 }}>
      插電上架 · 宣告式叢集 · 自助服務 —— 90 分鐘，親手體驗
    </p>
    <p style={{ fontSize: 30, color: mutedDark, marginTop: 60 }}>
      謝禹沆（Josh）<span style={{ color: '#f0b5a1', margin: '0 16px' }}>|</span>Platform Engineer, 寬橋
    </p>
  </div>
);

/* ── 02 開場約定 ─────────────────────────────────────── */
const Housekeeping: Page = () => (
  <Light eyebrow="開始之前" title="今天怎麼進行">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li><Red>一半時間你動手</Red>：筆電開 Docker，跟著教材開出自己的叢集</Li>
      <Li><Red>一半時間看真的</Red>：真實裸機測試床的三段現場示範</Li>
      <Li>完成會前準備的人：等一下聽到口令直接開跑</Li>
      <Li>沒完成的人：舉手，助教送上 USB 備援；或看鄰座的就好</Li>
      <Li>卡住不用怕：每一段都有「追趕腳本」，一鍵回到隊伍</Li>
    </ul>
  </Light>
);


/* ── 02b Agenda ──────────────────────────────────────── */
const AgendaRow = ({ time, name, note }: { time: string; name: string; note: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 30, background: '#fff', border: '1px solid #e8e2df', borderRadius: 10, padding: '17px 30px' }}>
    <div style={{ width: 190, fontFamily: mono, fontSize: 29, fontWeight: 700, color: 'var(--osd-accent)' }}>{time}</div>
    <div style={{ width: 430, fontSize: 31, fontWeight: 800 }}>{name}</div>
    <div style={{ fontSize: 27, color: '#5a5148' }}>{note}</div>
  </div>
);

const Agenda: Page = () => (
  <Light eyebrow="AGENDA" title="90 分鐘怎麼走">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 2 }}>
      <AgendaRow time="00–15" name="為什麼這樣做" note="白牌硬體、K8s 原生、Pod 哲學怎麼影響機器管理" />
      <AgendaRow time="15–20" name="示範①：插電上架" note="同時：你的筆電先跑第一幕步驟 1" />
      <AgendaRow time="20–40" name="動手：裸 Cluster API" note="200 行 YAML 開出一個叢集" />
      <AgendaRow time="40–65" name="動手：kro 自助服務" note="同一個叢集，6 行就好" />
      <AgendaRow time="65–75" name="示範②③：重灌與升級" note="資料不丟、機器不重開" />
      <AgendaRow time="75–90" name="排雷故事與問答" note="三個實際踩過的坑，加上下一步" />
    </div>
  </Light>
);

/* ── 03 Thesis ───────────────────────────────────────── */
const Thesis: Page = () => (
  <Dark eyebrow="THESIS" title={<>白牌硬體 + Kubernetes 原生<br />= 不交保護費的私有雲</>}>
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={30}>商用虛擬化的雙重成本：<Red>授權費年年漲</Red>，還要養一批只熟該平台的技能</Li>
      <Li gap={30}>被鎖住的不只是錢 —— 是<Red>團隊的技術路徑</Red></Li>
      <Li gap={30}>主張：K8s 團隊用<Red>單一技術堆疊</Red>管理整個基礎設施，從自助服務一路到裸機</Li>
    </ul>
  </Dark>
);

/* ── 04 在地優勢 ─────────────────────────────────────── */
const WhiteBox: Page = () => (
  <Light eyebrow="為什麼是現在" title="Hyperscaler 的做法，每一層都有開源實作了">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>Google、Meta、AWS 的機房：<Red>白牌伺服器 + 自研管理系統</Red>，不買商用虛擬化</Li>
      <Li>那些白牌伺服器，大多是台灣代工的 —— 廣達、緯穎、英業達</Li>
      <Li>以前的門檻：管理系統要自己寫，只有他們寫得起</Li>
      <Li>現在：裸機供裝、叢集管理、VM、儲存 —— <Red>每一層都有成熟的開源專案</Red></Li>
      <Li>Kubernetes 自己就是例子：從 Google 內部的 Borg 演化出來</Li>
    </ul>
  </Light>
);

/* ── 05 Pod 哲學系譜 ─────────────────────────────────── */
const Lineage: Page = () => (
  <Light eyebrow="從 Pod 到裸機" title="Reconcile by Replacement">
    <div style={{ display: 'flex', gap: 40, fontSize: 34, marginTop: 8 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 36 }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: 'var(--osd-accent)' }}>Pod</div>
        <p style={{ lineHeight: 1.5, marginTop: 18 }}>壞了不修，<b>換一個</b>。<br />替換成本趨近於零</p>
      </div>
      <div style={{ alignSelf: 'center', fontSize: 48, color: muted }}>→</div>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 36 }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: 'var(--osd-accent)' }}>Machine</div>
        <p style={{ lineHeight: 1.5, marginTop: 18 }}>Cluster API 逐字翻譯：<br />升級機器 = <b>換一台機器</b></p>
      </div>
      <div style={{ alignSelf: 'center', fontSize: 48, color: muted }}>→</div>
      <div style={{ flex: 1, background: '#fff', border: '2px solid var(--osd-accent)', borderRadius: 'var(--osd-radius)', padding: 36 }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: 'var(--osd-accent)' }}>裸機？</div>
        <p style={{ lineHeight: 1.5, marginTop: 18 }}>換一台 = 重灌 + 資料 + 小時級<br /><b>這個落差，就是今天要解的問題</b></p>
      </div>
    </div>
  </Light>
);

/* ── 06 架構全景 ─────────────────────────────────────── */
const LayerRow = ({ name, tool, note }: { name: string; tool: string; note: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28, background: '#fff', border: '1px solid #e8e2df', borderRadius: 10, padding: '18px 30px' }}>
    <div style={{ width: 210, fontWeight: 800, fontSize: 30 }}>{name}</div>
    <div style={{ width: 330, fontFamily: mono, fontSize: 29, color: 'var(--osd-accent)', fontWeight: 700 }}>{tool}</div>
    <div style={{ fontSize: 27, color: '#5a5148' }}>{note}</div>
  </div>
);

const Architecture: Page = () => (
  <Light eyebrow="架構全景" title="每一層，都是 K8s 的 API">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
      <LayerRow name="自助服務" tool="kro" note="使用者看到的高階 API（service catalog）—— 今天第二幕" />
      <LayerRow name="叢集生命週期" tool="Cluster API" note="宣告式開叢集 —— 今天第一幕" />
      <LayerRow name="虛擬機" tool="KubeVirt" note="VM 也是一種 K8s 資源" />
      <LayerRow name="儲存 / 網路" tool="Rook-Ceph / Cilium" note="分散式儲存與 CNI + LB" />
      <LayerRow name="作業系統" tool="Flatcar" note="不可變、原子更新的容器 OS" />
      <LayerRow name="裸機供裝" tool="Tinkerbell" note="插電自動上架 —— 等一下的示範" />
    </div>
  </Light>
);

/* ── 07 選型原則 ─────────────────────────────────────── */
const Principles: Page = () => (
  <Light eyebrow="選型原則" title="我們只挑「隨時可以離開」的積木">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>100% 開源授權、CNCF 或社群治理 —— <Red>沒有授權費這個變數</Red></Li>
      <Li>每一塊都有明確退路：換掉任何一塊，不動其他層</Li>
      <Li>商用 HCI 套裝、Source-available 授權的方案 —— 好用，但與這個原則不相容</Li>
      <Li>代價也說清楚：這條路<Red>可行但前沿</Red>，結尾的排雷段就是價目表</Li>
    </ul>
  </Light>
);

/* ── 08 demo① 過場 ───────────────────────────────────── */
const Demo1: Page = () => (
  <Dark eyebrow="DEMO ①（同時：請開始跑第一幕步驟 1）" title="插電，然後看著它自己上架">
    <div style={{ display: 'flex', gap: 56 }}>
      <ul style={{ fontSize: 38, paddingLeft: 46, margin: 0, color: '#f0f0f0', flex: 1 }}>
        <Li gap={28}>一台空機器開機 —— 沒有 OS、沒有代理程式</Li>
        <Li gap={28}>看 <span style={{ fontFamily: mono }}>Hardware</span> 物件<Red>無中生有</Red>、規格自動回報</Li>
        <Li gap={28}>切到已完成的機器：它已是叢集成員</Li>
      </ul>
      <div style={{ width: 560, background: 'rgba(255,255,255,0.06)', border: '1px solid #2c2c34', borderRadius: 'var(--osd-radius)', padding: 32, fontSize: 30, lineHeight: 1.6, color: mutedDark }}>
        你的筆電此刻應該在跑：
        <div style={{ fontFamily: mono, fontSize: 26, marginTop: 16, color: '#7ee787' }}>
          kind create cluster ...<br />kind load image-archive ...
        </div>
        <div style={{ marginTop: 16 }}>約 6 分鐘 —— 正好看完這段示範</div>
      </div>
    </div>
  </Dark>
);

/* ── 09 Tinkerbell 原理 ──────────────────────────────── */
const HowPxe: Page = () => (
  <Light eyebrow="它是怎麼辦到的" title="每台機器出廠就內建的自動化鉤子">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>網卡韌體天生會廣播：「我是 MAC xx:xx，<Red>有人要告訴我該做什麼嗎？</Red>」（PXE）</Li>
      <Li>Tinkerbell 只「補答」開機欄位 —— IP 照舊由機房 DHCP 發，零侵入</Li>
      <Li>機器載入一個只活在記憶體的小系統，回報規格、執行安裝</Li>
      <Li>控制流反轉：不是我們推指令，是<Red>機器每次開機來問</Red>，而答案由我們決定</Li>
      <Li>BMC 是升級選配，不是入場門票 —— 白牌機器也能全自動</Li>
    </ul>
  </Light>
);

/* ── 10 第一幕指引 ───────────────────────────────────── */
const Act1Guide: Page = () => (
  <Dark eyebrow="HANDS-ON · 第一幕（約 20 分鐘）" title="裸 Cluster API：感受 200 行的份量">
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Code size={32}>{`cd k8s-summit-2026-workshop
less labs/01-capi/README.md   # 跟著走
# 卡住了：
./labs/checkpoints/reset-to-01-end.sh`}</Code>
        <p style={{ fontSize: 32, color: mutedDark, marginTop: 28, lineHeight: 1.5 }}>
          兩個終端機並排：一邊 <span style={{ fontFamily: mono }}>watch kubectl get machines</span>，
          一邊 <span style={{ fontFamily: mono }}>watch docker ps</span>
        </p>
      </div>
      <ul style={{ fontSize: 34, paddingLeft: 40, margin: 0, color: '#f0f0f0', width: 620 }}>
        <Li gap={24}>apply 七個物件 → 叢集長出來</Li>
        <Li gap={24}>每個 Machine 就是一個容器</Li>
        <Li gap={24}>擴容 = 改一個數字</Li>
        <Li gap={24}>升級 = <Red>換機器</Red>，不是修機器</Li>
      </ul>
    </div>
  </Dark>
);

/* ── 11 第一幕回收 ───────────────────────────────────── */
const Act1Recap: Page = () => (
  <Light eyebrow="第一幕 · 你剛剛做了什麼" title="好用，但也真的很囉唆">
    <div style={{ display: 'flex', gap: 48 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 40 }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#3d7a3d' }}>得到的</div>
        <ul style={{ fontSize: 33, paddingLeft: 40, marginTop: 20, lineHeight: 1.55 }}>
          <li>叢集 = 一份宣告，apply 即得</li>
          <li>擴縮、汰換全是改欄位</li>
          <li>機器變成 cattle</li>
        </ul>
      </div>
      <div style={{ flex: 1, background: '#fff', border: '2px solid var(--osd-accent)', borderRadius: 'var(--osd-radius)', padding: 40 }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--osd-accent)' }}>付出的</div>
        <ul style={{ fontSize: 33, paddingLeft: 40, marginTop: 20, lineHeight: 1.55 }}>
          <li>七個物件、200 行 YAML</li>
          <li>名稱互相引用，錯一個字全垮</li>
          <li>哪些欄位危險？要靠經驗</li>
        </ul>
      </div>
    </div>
    <p style={{ fontSize: 38, marginTop: 44, fontWeight: 700 }}>
      這是基礎設施工程師的日常，但不該是使用者的日常。
    </p>
  </Light>
);

/* ── 12 第二幕過場 ───────────────────────────────────── */
const Act2Intro: Page = () => (
  <Dark eyebrow="第二幕的賭注" title={<>把 200 行，變成 6 行</>}>
    <div style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
      <Code size={30}>{`apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata:
  name: team-a
spec: {}`}</Code>
      <ul style={{ fontSize: 38, paddingLeft: 40, margin: 0, color: '#f0f0f0', flex: 1 }}>
        <Li gap={28}>平台工程 = 把專家知識<Red>封裝成預設值</Red></Li>
        <Li gap={28}>把選擇權留在高階 API 上</Li>
        <Li gap={28}>用 kro 在 K8s 裡定義你自己的 API</Li>
      </ul>
    </div>
  </Dark>
);

/* ── 13 四層 API 設計 ────────────────────────────────── */
const FourLayer = ({ n, name, desc }: { n: string; name: string; desc: string }) => (
  <div style={{ display: 'flex', gap: 26, alignItems: 'center', background: '#fff', border: '1px solid #e8e2df', borderRadius: 10, padding: '20px 32px' }}>
    <div style={{ fontFamily: mono, fontSize: 40, fontWeight: 800, color: 'var(--osd-accent)', width: 60 }}>{n}</div>
    <div style={{ width: 300, fontSize: 33, fontWeight: 800 }}>{name}</div>
    <div style={{ fontSize: 29, color: '#5a5148', lineHeight: 1.4 }}>{desc}</div>
  </div>
);

const FourLayers: Page = () => (
  <Light eyebrow="平台 API 的四層設計" title="高階好用，細節可調，危險碰不到">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
      <FourLayer n="1" name="頂層精簡" desc="version / nodes / profile —— 全部有合理預設，spec: {} 就能開" />
      <FourLayer n="2" name="advanced 選填" desc="網段、kubelet 參數 —— 要調的人才需要知道它存在" />
      <FourLayer n="3" name="object 逃生門" desc="進階設定原樣透傳到底層 —— 但只在平台指定的錨點" />
      <FourLayer n="4" name="紀律鎖死" desc="schema 沒宣告的欄位直接被拒 —— 哪些不可調，本身就是設計" />
    </div>
  </Light>
);

/* ── 14 第二幕指引 ───────────────────────────────────── */
const Act2Guide: Page = () => (
  <Dark eyebrow="HANDS-ON · 第二幕（約 25 分鐘）" title="kro 自助服務：三種角色輪流當">
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Code size={32}>{`less labs/02-kro/README.md
# 卡住了：
./labs/checkpoints/reset-to-02-end.sh`}</Code>
        <p style={{ fontSize: 32, color: mutedDark, marginTop: 28, lineHeight: 1.55 }}>
          先確認第一幕的 demo 叢集拆掉了 ——<br />8 GB 的機器同時養兩個叢集會餓死
        </p>
      </div>
      <ul style={{ fontSize: 34, paddingLeft: 40, margin: 0, color: '#f0f0f0', width: 640 }}>
        <Li gap={24}><Red>使用者</Red>：6 行開叢集、改 profile 變 HA</Li>
        <Li gap={24}><Red>破壞者</Red>：塞禁止欄位，看平台說不</Li>
        <Li gap={24}><Red>平台工程師</Red>：改 RGD，演進你的 API</Li>
      </ul>
    </div>
  </Dark>
);

/* ── 15 第二幕回收 ───────────────────────────────────── */
const Act2Recap: Page = () => (
  <Light eyebrow="第二幕 · 你剛剛做了什麼" title="你在 K8s 裡創造了一個新的 API">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>200 行 → 6 行的差距不是魔法，是<Red>封裝過的專家知識</Red></Li>
      <Li>status 匯總、更新傳導、cascade 刪除 —— 生命週期語義全部穿透</Li>
      <Li>我們的真實私有雲用<Red>一字不差的 schema</Red> —— 底層只是換了 provider</Li>
      <Li>今天：Docker 容器當機器；真平台：裸機（Tinkerbell）與虛擬機（KubeVirt）</Li>
    </ul>
    <p style={{ fontSize: 38, marginTop: 40, fontWeight: 700 }}>
      接下來的兩段示範，就是同一套 API 在真實硬體上的樣子。
    </p>
  </Light>
);

/* ── 16 demo② 過場 ───────────────────────────────────── */
const Demo2: Page = () => (
  <Dark eyebrow="DEMO ②" title="重灌一台節點，資料一個位元都不少">
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={30}>HCI 節點上有分散式儲存（Ceph）—— 「換機哲學」最怕的就是它</Li>
      <Li gap={30}>現場刪掉一台 Machine → 自動重灌作業系統 → 重新入列</Li>
      <Li gap={30}>資料碟全程不動，Ceph <Red>原碟認領</Red></Li>
      <Li gap={30}>判決證據：重灌前後的 <span style={{ fontFamily: mono }}>sha256</span> 與叢集 fsid <Red>完全一致</Red></Li>
    </ul>
  </Dark>
);

/* ── 17 demo③ 過場 ───────────────────────────────────── */
const Demo3: Page = () => (
  <Dark eyebrow="DEMO ③" title="升級 Kubernetes，機器連重開機都沒有">
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={30}>裸機的痛：照 Pod 哲學「換機升級」，每台要重灌 + 資料重建</Li>
      <Li gap={30}>Cluster API 新世代的 in-place updates：升級<Red>委派給外掛</Red>原地執行</Li>
      <Li gap={30}>現場改一個版本欄位 → kubelet 原地換版</Li>
      <Li gap={30}>判決證據：machine uid 不變、<span style={{ fontFamily: mono }}>uptime</span> 不歸零</Li>
    </ul>
  </Dark>
);

/* ── 18 排雷一 ───────────────────────────────────────── */
const Mine1: Page = () => (
  <Light eyebrow="排雷 · 一" title="不報錯的失敗，最難查">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>一台 VM 開機完全正常：有 IP、有主機名、sshd 在跑 —— 但誰都連不進去</Li>
      <Li>兇手：映像檔缺一行 <span style={{ fontFamily: mono }}>oem_id</span>，開機設定系統<Red>安靜地忽略</Red>了所有設定</Li>
      <Li>同一顆雷我們踩了兩次 —— 自建映像一次、原廠映像一次</Li>
      <Li>教訓：<Red>映像檔出廠檢查</Red>是供應鏈紀律，不能靠下游記得</Li>
    </ul>
  </Light>
);

/* ── 19 排雷二 ───────────────────────────────────────── */
const Mine2: Page = () => (
  <Light eyebrow="排雷 · 二" title="保護機制預設沒開，等於沒有">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>例行維運：排空一台節點 —— 結果儲存叢集的仲裁成員被<Red>一起趕走</Red></Li>
      <Li>連鎖：失去仲裁 → 儲存全面凍結 → 連自我修復的元件也癱了</Li>
      <Li>根因：Rook 的保護機制（PodDisruptionBudget）<Red>預設是關的</Red></Li>
      <Li>教訓：文件寫「有保護」與「保護開著」是兩件事 —— 上線前手動演練一次故障</Li>
    </ul>
  </Light>
);

/* ── 20 排雷三 ───────────────────────────────────────── */
const Mine3: Page = () => (
  <Light eyebrow="排雷 · 三" title="雲的預設值，到了機房會咬人">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>Cluster API 升級預設「先開新機、再關舊機」（maxSurge=1）</Li>
      <Li>雲上合理 —— 機器隨叫隨到；機房裡<Red>沒有那台多的機器</Red></Li>
      <Li>結果：升級永遠卡在「等一台不存在的機器」</Li>
      <Li>教訓：跑在裸機上，<span style={{ fontFamily: mono }}>maxSurge: 0</span> 是紀律；每個雲時代的預設值都要重新質疑</Li>
    </ul>
  </Light>
);

/* ── 21 前沿稅 ───────────────────────────────────────── */
const FrontierTax: Page = () => (
  <Dark eyebrow="誠實的總結" title="這條路：可行，但前沿">
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={30}>七個驗證專案、六十多項實測發現 —— <Red>沒有一條退路被迫啟用</Red></Li>
      <Li gap={30}>剛才三則故事是「前沿稅」的價目表：無聲、無文件、只有實測炸得出來</Li>
      <Li gap={30}>付得起這筆稅，換到的是<Red>單一控制平面的複利</Red>：一套 RBAC、一套 GitOps、一種除錯路徑</Li>
    </ul>
  </Dark>
);

/* ── 22 Roadmap ──────────────────────────────────────── */
const Roadmap: Page = () => (
  <Light eyebrow="下一步" title="把「人肉控制器」寫成真的控制器">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>今天所有示範裡的人工膠水 —— 開機時機、健康閘門、模板渲染 —— 全指向同一個元件</Li>
      <Li>Enrollment Controller：機器從<Red>插電到退役</Red>的完整生命週期自動化</Li>
      <Li>六十多項排雷發現，就是它的需求規格書</Li>
      <Li>預計以開源方式進行 —— 歡迎關注、更歡迎一起來踩雷</Li>
    </ul>
  </Light>
);

/* ── 23 資源頁 ───────────────────────────────────────── */
const Resources: Page = () => (
  <Light eyebrow="帶回家" title="所有教材，回家可以重跑">
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, fontSize: 36, lineHeight: 1.7 }}>
        <p style={{ margin: 0 }}>教材 repo（含完整 labs 與追趕腳本）：</p>
        <p style={{ fontFamily: mono, fontSize: 32, color: 'var(--osd-accent)', fontWeight: 700, margin: '12px 0 36px' }}>
          github.com/jtr860830/k8s-summit-2026-workshop
        </p>
        <p style={{ margin: 0 }}>附錄：Tinkerbell playground —— 在自己的 Linux 機器上重現「插電上架」</p>
      </div>
      <div style={{ width: 420, height: 420, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: muted }}>
        QR Code（W3 放入）
      </div>
    </div>
  </Light>
);

/* ── 24 封底 ─────────────────────────────────────────── */
const Thanks: Page = () => (
  <div style={{ ...fill, background: darkBg, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 140, fontWeight: 900, margin: 0 }}>謝謝</h1>
    <p style={{ fontSize: 40, color: mutedDark, marginTop: 44 }}>
      機器插電，剩下的交給 YAML。
    </p>
    <p style={{ fontSize: 30, color: mutedDark, marginTop: 60 }}>
      謝禹沆（Josh） · 寬橋 · KubeSummit 2026
    </p>
  </div>
);

export const meta: SlideMeta = {
  title: '用 Kubernetes 打造自動化私有雲基礎設施',
  theme: 'brobridge',
  createdAt: '2026-08-24T06:16:30.606Z',
};

export default [
  Cover, Housekeeping, Agenda, Thesis, WhiteBox, Lineage, Architecture, Principles,
  Demo1, HowPxe, Act1Guide, Act1Recap,
  Act2Intro, FourLayers, Act2Guide, Act2Recap,
  Demo2, Demo3,
  Mine1, Mine2, Mine3,
  FrontierTax, Roadmap, Resources, Thanks,
] satisfies Page[];
