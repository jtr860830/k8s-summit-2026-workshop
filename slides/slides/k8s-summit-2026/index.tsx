import { useEffect, useState } from 'react';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import { RAW } from './rawlogs';
import * as N from './notes';
import './fonts.css';
import logoUrl from './assets/brobridge-logo.png';

export const design: DesignSystem = {
  palette: { bg: '#faf5f2', text: '#262626', accent: '#c00000' },
  fonts: {
    display: '"LINE Seed TW", "Noto Sans TC", system-ui, sans-serif',
    body: '"LINE Seed TW", "Noto Sans TC", system-ui, sans-serif',
  },
  typeScale: { hero: 150, body: 38 },
  radius: 14,
};

const muted = '#8f8f8f';
const mutedDark = '#d9d9d9';
const darkBg = 'linear-gradient(160deg, #17171c 0%, #1d1d24 70%, #26181a 100%)';
const mono = '"Maple Mono NF CN", monospace';
const codeBg = '#1b1b20';
const codeBorder = '#2c2c34';

const fill = { width: '100%', height: '100%', fontFamily: 'var(--osd-font-body)' } as const;

type World = 'demo' | 'lab';
const WORLD = {
  demo: { name: 'DEMO', sub: '真實機房，看投影就好', bg: 'rgba(240,181,161,0.16)', fg: '#f0b5a1', border: 'rgba(240,181,161,0.5)' },
  lab: { name: 'HANDS-ON', sub: '跟著做', bg: 'rgba(61,122,61,0.10)', fg: '#3d7a3d', border: 'rgba(61,122,61,0.45)' },
} as const;

const WorldChip = ({ world, hint, dark = false }: { world: World; hint?: string; dark?: boolean }) => {
  const w = WORLD[world];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 18px', borderRadius: 999,
      background: w.bg, border: `1px solid ${w.border}`, color: dark && world === 'lab' ? '#9fd39f' : w.fg,
      fontSize: 22, fontWeight: 800, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      {w.name}{(hint ?? w.sub) && <span style={{ fontWeight: 500, opacity: 0.85 }}>{hint ?? w.sub}</span>}
    </span>
  );
};

const Footer = ({ dark = false, world, hint }: { dark?: boolean; world?: World; hint?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute', left: 120, right: 120, bottom: 44,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 22, color: dark ? mutedDark : muted, letterSpacing: '0.05em',
      }}
    >
      <span>用 Kubernetes 打造自動化私有雲基礎設施 · KubeSummit 2026</span>
      {world && <WorldChip world={world} hint={hint} dark={dark} />}
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
  <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: size, fontWeight: 800, margin: '20px 0 0', lineHeight: 1.15 }}>
    {children}
  </h2>
);

const Light = ({ eyebrow, title, children, world, hint }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; world?: World; hint?: string }) => (
  <div style={{ ...fill, background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: 120, position: 'relative' }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <H>{title}</H>
    <div style={{ marginTop: 52 }}>{children}</div>
    <Footer world={world} hint={hint} />
  </div>
);

const Dark = ({ eyebrow, title, children, world, hint }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; world?: World; hint?: string }) => (
  <div style={{ ...fill, background: darkBg, color: '#ffffff', padding: 120, position: 'relative' }}>
    <Eyebrow dark>{eyebrow}</Eyebrow>
    <H size={88}>{title}</H>
    <div style={{ marginTop: 52 }}>{children}</div>
    <Footer dark world={world} hint={hint} />
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

const Logo = ({ height = 64 }: { height?: number }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '16px 28px' }}>
    <img src={logoUrl} alt="Brobridge" style={{ height, display: 'block' }} />
  </div>
);

/* ── 01 封面 ─────────────────────────────────────────── */
const Cover: Page = () => (
  <div style={{ ...fill, background: darkBg, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px', position: 'relative' }}>
    <div style={{ position: 'absolute', right: 160, bottom: 96 }}><Logo height={56} /></div>
    <Eyebrow dark>KUBESUMMIT 2026 · 體驗工作坊</Eyebrow>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 108, fontWeight: 800, margin: '36px 0 0', lineHeight: 1.2 }}>
      用 Kubernetes 打造<br />自動化私有雲基礎設施
    </h1>
    <p style={{ fontSize: 36, color: mutedDark, marginTop: 48 }}>
      插電上架 · 宣告式基礎設施 · 自助服務 —— 90 分鐘，親手體驗
    </p>
    <p style={{ fontSize: 30, color: mutedDark, marginTop: 60 }}>
      謝禹沆（Josh）<span style={{ color: '#f0b5a1', margin: '0 16px' }}>|</span>Platform Engineer, 寬橋
    </p>
  </div>
);

/* ── 02 開場約定 ─────────────────────────────────────── */

/* ── 02b Agenda ──────────────────────────────────────── */
const AgendaRow = ({ time, name, world }: { time: string; name: string; world?: World }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 30, background: '#fff', border: '1px solid #e8e2df', borderRadius: 10, padding: '19px 30px' }}>
    <div style={{ width: 190, fontFamily: mono, fontSize: 30, fontWeight: 700, color: 'var(--osd-accent)' }}>{time}</div>
    <div style={{ fontSize: 33, fontWeight: 800, flex: 1 }}>{name}</div>
    {world && <WorldChip world={world} hint="" />}
  </div>
);

const Agenda: Page = () => (
  <Light eyebrow="AGENDA" title="90 分鐘怎麼進行">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 2 }}>
      <AgendaRow time="03–10" name="主張：為什麼用 K8s 管基礎設施" />
      <AgendaRow time="10–30" name="示範①：插電上架 ＋ Day-0 建置（前六步）" world="demo" />
      <AgendaRow time="33–53" name="動手：純 Cluster API" world="lab" />
      <AgendaRow time="53–62" name="Day-0 後三步" world="demo" />
      <AgendaRow time="62–82" name="動手：kro 自助服務" world="lab" />
      <AgendaRow time="82–90" name="示範②③與總結" world="demo" />
    </div>
  </Light>
);

/* ── 03 Thesis ───────────────────────────────────────── */
const Thesis: Page = () => (
  <div style={{ ...fill, background: darkBg, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px', position: 'relative' }}>
    <Eyebrow dark>THESIS</Eyebrow>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 100, fontWeight: 800, margin: '36px 0 0', lineHeight: 1.25 }}>
      白牌硬體 + Kubernetes 原生<br />
      <span style={{ color: '#e05545' }}>= 不被授權綁住的私有雲</span>
    </h1>
    <p style={{ fontSize: 34, color: mutedDark, marginTop: 56, lineHeight: 1.6, maxWidth: 1400 }}>
      商用虛擬化的代價有兩個：授權費年年漲，還要養一批只會這個平台的人。
      被綁住的不只是錢，還有團隊的技術路線。
    </p>
    <Footer dark />
  </div>
);

/* ── 03a 主張 ────────────────────────────────────────── */
const Claim: Page = () => (
  <Dark eyebrow="THESIS" title="用 K8s 管理整個基礎設施">
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={36}><Red>從最底層的裸機到最上層的自助服務</Red>，同一套 kubectl、YAML、RBAC、GitOps 管到底</Li>
      <Li gap={36}>機器、叢集、上架規則都是 K8s 物件 —— <Red>一套心智模型</Red>管所有層</Li>
      <Li gap={36}>不用為虛擬化、儲存各養一批人 —— K8s 團隊的能力<Red>直接延伸</Red>到基礎設施</Li>
    </ul>
  </Dark>
);

/* ── 04 在地優勢 ─────────────────────────────────────── */
const WhiteBox: Page = () => (
  <Light eyebrow="WHY NOW" title="從裸機到儲存，每一層都有成熟的開源專案">
    <div style={{ display: 'flex', gap: 40, alignItems: 'stretch', fontSize: 34, marginTop: 8 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 40 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: muted }}>雲端巨頭</div>
        <p style={{ lineHeight: 1.6, marginTop: 22 }}>白牌伺服器 + <b>自研</b>管理系統</p>
      </div>
      <div style={{ alignSelf: 'center', fontSize: 56, color: muted }}>→</div>
      <div style={{ flex: 1, background: '#fff', border: '2px solid var(--osd-accent)', borderRadius: 'var(--osd-radius)', padding: 40 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: 'var(--osd-accent)' }}>現在</div>
        <p style={{ lineHeight: 1.6, marginTop: 22 }}>白牌伺服器 + <b style={{ color: 'var(--osd-accent)' }}>開源</b>管理系統</p>
        <p style={{ lineHeight: 1.6, marginTop: 10, color: '#5a5148' }}>裸機、叢集、虛擬機器、儲存、網路 —— 各有各的專案</p>
      </div>
    </div>
  </Light>
);

/* ── 05 Pod 哲學系譜 ─────────────────────────────────── */
const Lineage: Page = () => (
  <Light eyebrow="RECONCILE BY REPLACEMENT" title="壞了不修，直接換 —— 從 Pod 到裸機">
    <div style={{ display: 'flex', gap: 40, fontSize: 34, marginTop: 8 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 36 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: 'var(--osd-accent)' }}>Pod</div>
        <p style={{ lineHeight: 1.5, marginTop: 18 }}>壞了不修，<b>換一個</b><br />換掉的成本趨近於零，所以敢這樣做</p>
      </div>
      <div style={{ alignSelf: 'center', fontSize: 48, color: muted }}>→</div>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 36 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: 'var(--osd-accent)' }}>Machine</div>
        <p style={{ lineHeight: 1.5, marginTop: 18 }}>Cluster API 把同一句話搬到機器層<br />升級、修復 = <b>換一台新機器</b></p>
      </div>
      <div style={{ alignSelf: 'center', fontSize: 48, color: muted }}>→</div>
      <div style={{ flex: 1, background: '#fff', border: '2px solid var(--osd-accent)', borderRadius: 'var(--osd-radius)', padding: 36 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: 'var(--osd-accent)' }}>裸機</div>
        <p style={{ lineHeight: 1.5, marginTop: 18 }}>換一台 = 重灌、搬資料、好幾個小時<br /><b>這個落差，就是接下來兩個示範要解的</b></p>
      </div>
    </div>
  </Light>
);

/* ── 06 架構全景 ─────────────────────────────────────── */
const LayerRow = ({ name, tool, depth }: { name: string; tool: string; depth: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 1180,
    background: `rgba(38,38,38,${0.03 + depth * 0.035})`, border: '1px solid #e0d8d3', borderRadius: 8, padding: '18px 40px' }}>
    <div style={{ fontSize: 33, fontWeight: 800 }}>{name}</div>
    <div style={{ fontFamily: mono, fontSize: 29, color: 'var(--osd-accent)', fontWeight: 700 }}>{tool}</div>
  </div>
);

const Architecture: Page = () => (
  <Light eyebrow="架構全景" title="每一層，都是 K8s 的 API">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <LayerRow name="自助服務" tool="kro" depth={0} />
      <LayerRow name="叢集生命週期" tool="Cluster API" depth={1} />
      <LayerRow name="虛擬機器" tool="KubeVirt" depth={2} />
      <LayerRow name="儲存 / 網路" tool="Rook-Ceph / Cilium" depth={3} />
      <LayerRow name="作業系統" tool="Flatcar" depth={4} />
      <LayerRow name="裸機佈建" tool="Tinkerbell" depth={5} />
    </div>
  </Light>
);

/* ── 06b 名詞 ────────────────────────────────────────── */
const GBox = ({ title, sub, accent = false, children }: { title: string; sub?: string; accent?: boolean; children?: React.ReactNode }) => (
  <div style={{ background: '#fff', border: accent ? '2px solid var(--osd-accent)' : '1px solid #e8e2df', borderRadius: 10, padding: '14px 20px', textAlign: 'center' }}>
    <div style={{ fontSize: 27, fontWeight: 800, color: accent ? 'var(--osd-accent)' : undefined }}>{title}</div>
    {sub && <div style={{ fontSize: 21, color: '#5a5148', marginTop: 4 }}>{sub}</div>}
    {children}
  </div>
);
const GTerm = ({ term, zh, desc }: { term: string; zh?: string; desc: string }) => (
  <div style={{ fontSize: 25, lineHeight: 1.4 }}>
    <b style={{ color: 'var(--osd-accent)', fontFamily: mono, fontSize: 27 }}>{term}</b>{zh && <span style={{ color: muted, fontSize: 22 }}>　{zh}</span>}
    <div style={{ color: '#3a3a3a' }}>{desc}</div>
  </div>
);
const Glossary: Page = () => (
  <Light eyebrow="GLOSSARY" title="Cluster API">
    <div style={{ display: 'flex', gap: 44, marginTop: -8 }}>
      <div style={{ width: 880, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}><GBox title="起始叢集" sub="跑在起始機上的 k3s；動手環境沒有這步" /></div>
          <div style={{ fontSize: 24, color: 'var(--osd-accent)', fontWeight: 800, whiteSpace: 'nowrap' }}>pivot →</div>
          <div style={{ flex: 1.4 }}><GBox title="管理叢集" sub="Cluster API controller + provider" accent /></div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 24, color: muted }}>↓ 開出、擴縮、升級、拆掉</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}><GBox title="工作負載叢集 A" sub="Machine × 3 → Node × 3" /></div>
          <div style={{ flex: 1 }}><GBox title="工作負載叢集 B" sub="Machine × 2 → Node × 2" /></div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 23, color: muted }}>Machine 底下是 container（動手環境）／裸機（真實機房）／虛擬機器</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GTerm term="management cluster" zh="管理叢集" desc="放 Cluster API 的叢集，用它開別的叢集。動手環境是 kind；真實機房是三台裸機。" />
        <GTerm term="workload cluster" zh="工作負載叢集" desc="被開出來給人用的叢集。今天的 demo、team-a。" />
        <GTerm term="bootstrap cluster" zh="起始叢集" desc="跑在起始機上的臨時管理叢集，只為了開出第一個正式的管理叢集，之後關掉。" />
        <GTerm term="Machine" desc="一台機器的 K8s 物件。叢集裡看到的 Node 是同一台機器的另一個名字。" />
        <GTerm term="provider" desc="Cluster API 接底層的外掛：docker、tinkerbell、kubevirt。換底層只換這個。" />
      </div>
    </div>
  </Light>
);

/* ── 07 選型原則 ─────────────────────────────────────── */
const Principles: Page = () => (
  <Light eyebrow="選型原則" title="不被任何元件綁死">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>只用開源授權的專案（CNCF 或社群治理）—— <Red>不用付授權費</Red>，也不會有人突然改授權條款</Li>
      <Li>每個元件都能單獨換掉，不用動到其他層</Li>
      <Li>商用 HCI 套裝、Source-available 的方案不在選項裡 —— 好用，但<Red>容易被綁住</Red></Li>
    </ul>
    <p style={{ fontSize: 30, color: muted, marginTop: 40 }}>
      缺點也要講：這些專案都還年輕，文件少、坑要自己踩。
    </p>
  </Light>
);

/* ── 07a2 建置步驟 ───────────────────────────────────── */
const D0Phase = ({ title, steps }: { title: string; steps: [string, string][] }) => (
  <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: '26px 30px' }}>
    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 18 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {steps.map(([n, s]) => (
        <div key={n} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
          <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: 'var(--osd-accent)', width: 34, flexShrink: 0 }}>{n}</div>
          <div style={{ fontSize: 28, lineHeight: 1.35 }}>{s}</div>
        </div>
      ))}
    </div>
  </div>
);

const D0Intro: Page = () => (
  <Light eyebrow="DAY-0 · 從零建起" title="九個步驟">
    <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
      <D0Phase title="1–3 準備起始機" steps={[['1', '裝 k3s'], ['2', '裝 Tinkerbell'], ['3', '準備作業系統映像']]} />
      <D0Phase title="4–6 自動上架" steps={[['4', '定義安裝範本'], ['5', '定義上架規則'], ['6', '插電，看它自己上架']]} />
      <D0Phase title="7–9 自我承載" steps={[['7', '裝 Cluster API'], ['8', '開出管理叢集'], ['9', 'pivot，平台管理自己']]} />
    </div>
    <p style={{ fontSize: 32, marginTop: 34, fontWeight: 700 }}>
      九步之後起始機關機 —— 之後每台新機器，只剩插電、開機。
    </p>
  </Light>
);

const D0Prereq: Page = () => (
  <Light eyebrow="DAY-0 · 開工前" title="機房最低配備 —— 就這四樣">
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: '26px 32px' }}>
        <div style={{ fontSize: 29, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 16 }}>需要</div>
        <ul style={{ fontSize: 29, paddingLeft: 36, margin: 0, lineHeight: 1.65 }}>
          <li>一個 L2 網段當裝機網段</li>
          <li>機房既有的 DHCP</li>
          <li>一台 Linux 當起始機（seed），接外網與裝機網段</li>
          <li>要納管的伺服器支援網路開機（開機順序網路優先）</li>
        </ul>
      </div>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: '26px 32px' }}>
        <div style={{ fontSize: 29, fontWeight: 800, marginBottom: 16 }}>不需要</div>
        <ul style={{ fontSize: 29, paddingLeft: 36, margin: 0, lineHeight: 1.65, color: '#5a5148' }}>
          <li>BMC</li>
          <li>既有的 Kubernetes</li>
          <li>共享儲存、特殊交換器功能</li>
          <li>任何商業授權</li>
        </ul>
      </div>
    </div>
    <p style={{ fontSize: 31, marginTop: 30, fontWeight: 700 }}>
      人只裝起始機這一台，其餘每台都是平台裝的。IP 還是機房 DHCP 發的，不需要動現有網路設定。
    </p>
  </Light>
);

/* ── DAY-0 九組：指令頁 + 真實錄製重播頁 ─────────────── */
const d0s1Lines: RLine[] = [
  { t: 0.5, text: 'curl -sfL https://get.k3s.io | sh -s - --disable traefik --disable servicelb', kind: 'cmd' },
  { t: 1.6, text: '[INFO]  Finding release for channel stable\n[INFO]  Using v1.36.3+k3s1 as release' },
  { t: 3.2, text: '[INFO]  Downloading binary .../k3s-io/k3s/releases/download/v1.36.3+k3s1/k3s\n[INFO]  Verifying binary download\n[INFO]  Installing k3s to /usr/local/bin/k3s' },
  { t: 5.0, text: '[INFO]  Creating /usr/local/bin/kubectl symlink to k3s\n[INFO]  systemd: Enabling k3s unit\n[INFO]  systemd: Starting k3s' },
  { t: 7.0, text: 'sudo k3s kubectl get nodes', kind: 'cmd' },
  { t: 8.2, text: 'NAME        STATUS   ROLES           AGE   VERSION\nday0-seed   Ready    control-plane   20s   v1.36.3+k3s1' },
  { t: 9.4, text: '起始機就位：一台機器的 K8s', kind: 'ok' },
];
const D0S1Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={1} total={9} title="起始機裝上 K8s（k3s）"
    cmd={`curl -sfL https://get.k3s.io | sh -s - \\
  --disable traefik --disable servicelb`}
    expect="get nodes 看到 Ready" />
);
const D0S1Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 1 步 —— 實際執行過程" lines={d0s1Lines} />
);

const d0s2Lines: RLine[] = [
  { t: 0.5, text: 'helm install tinkerbell oci://ghcr.io/tinkerbell/charts/tinkerbell --version v0.25.0 \\\n  -n tinkerbell --create-namespace -f tinkerbell-values.yaml --wait', kind: 'cmd' },
  { t: 2.5, text: 'STATUS: deployed\nREVISION: 1' },
  { t: 4.0, text: 'kubectl -n tinkerbell get pods', kind: 'cmd' },
  { t: 5.2, text: 'NAME                          READY   STATUS    RESTARTS   AGE\nhookos-7878fc4769-75w27       2/2     Running   0          62s\nkube-vip-l8s68                1/1     Running   0          62s\ntinkerbell-59f4654b69-mhjd5   1/1     Running   0          62s' },
  { t: 7.0, text: 'kubectl get crd | grep tinkerbell.org', kind: 'cmd' },
  { t: 8.2, text: 'hardware.tinkerbell.org           2026-08-25T14:08:42Z\ntemplates.tinkerbell.org          2026-08-25T14:08:42Z\nworkflows.tinkerbell.org          2026-08-25T14:08:42Z\nworkflowrulesets.tinkerbell.org   2026-08-25T14:08:42Z\nmachines.bmc.tinkerbell.org       2026-08-25T14:08:42Z\n……（共 7 個）' },
  { t: 10.0, text: '機器、範本、工作流從此都是 K8s 物件', kind: 'ok' },
];
const D0S2Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={2} total={9} title="裝 Tinkerbell"
    cmd={`helm install tinkerbell \\
  oci://ghcr.io/tinkerbell/charts/tinkerbell \\
  --version v0.25.0 \\
  -n tinkerbell --create-namespace \\
  -f tinkerbell-values.yaml --wait
# values 只設四件事：收 PXE 廣播的網卡、
# 兩個服務 IP、auto-proxy 模式、自動發現/上架開關`}
    expect="STATUS: deployed；tinkerbell namespace 三個 pod Running；kubectl get crd 多出 tinkerbell.org 一組" />
);
const D0S2Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 2 步 —— 實際執行過程" lines={d0s2Lines} />
);

const d0s3Lines: RLine[] = [
  { t: 0.5, text: './fetch-artifacts.sh', kind: 'cmd' },
  { t: 2.5, text: 'Flatcar image SHA512 OK' },
  { t: 4.5, text: '-rw-rw-r-- 1 ubuntu ubuntu 479M Aug 25 14:09 flatcar_production_image.bin.gz\n-rw-rw-r-- 1 ubuntu ubuntu 108M Aug 25 14:15 kubernetes-v1.34.6-x86-64.raw' },
  { t: 6.5, text: '驗證檔案可經映像伺服器取得：\nHTTP/1.1 200 OK' },
  { t: 8.0, text: '原廠映像，官方雜湊驗證通過', kind: 'ok' },
];
const D0S3Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={3} total={9} title="備妥作業系統映像"
    cmd={`./fetch-artifacts.sh
# 內容三件事：
#   下載 Flatcar 原廠映像（驗 SHA512）
#   下載 kubelet sysext（疊加映像）
#   放進映像伺服器目錄`}
    expect="SHA512 OK；目錄下兩個檔案（Flatcar 映像、kubelet sysext）；curl 映像伺服器回 HTTP 200" />
);
const D0S3Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 3 步 —— 實際執行過程" lines={d0s3Lines} />
);

const d0s4Lines: RLine[] = [
  { t: 0.5, text: 'butane base.bu > config.ign', kind: 'cmd' },
  { t: 2.0, text: 'python3 gen-template.py config.ign | kubectl apply -f -', kind: 'cmd' },
  { t: 3.2, text: 'template.tinkerbell.org/flatcar-install created' },
  { t: 4.6, text: 'kubectl -n tinkerbell get template', kind: 'cmd' },
  { t: 5.8, text: 'NAME              STATE\nflatcar-install' },
  { t: 7.0, text: '安裝流程三個動作：寫映像 → 寫設定 → 重開機', kind: 'ok' },
];
const D0S4Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={4} total={9} title="安裝範本 —— 進來的機器怎麼裝"
    cmd={`butane base.bu > config.ign
python3 gen-template.py config.ign \\
  | kubectl apply -f -
# base.bu：新機器的最小設定（主機名、SSH 金鑰、kubelet sysext）
# 範本本身也只是一個 K8s 物件`}
    expect="看到 template.tinkerbell.org/flatcar-install created；get template 列出一筆" />
);
const D0S4Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 4 步 —— 實際執行過程" lines={d0s4Lines} />
);

const d0s5Lines: RLine[] = [
  { t: 0.5, text: 'kubectl -n tinkerbell get hardware,workflow', kind: 'cmd' },
  { t: 1.7, text: 'No resources found in tinkerbell namespace.' },
  { t: 3.4, text: 'kubectl apply -f ruleset.yaml', kind: 'cmd' },
  { t: 4.6, text: 'workflowruleset.tinkerbell.org/enroll-flatcar-all created' },
  { t: 6.0, text: 'kubectl -n tinkerbell get workflowruleset', kind: 'cmd' },
  { t: 7.2, text: 'NAME                 AGE\nenroll-flatcar-all   1s' },
  { t: 8.6, text: '池裡還沒有機器，規則已就位，等第一台機器插電', kind: 'ok' },
];
const D0S5Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={5} total={9} title="上架規則 —— 哪些機器要裝"
    cmd={`kubectl apply -f ruleset.yaml
# match-all：任何新機器回報屬性
# 就觸發安裝；正式環境可收斂成
# 精準條件（例：特定機箱廠商）`}
    expect="看到規則建立；Hardware 與 Workflow 都還是空的 —— 等第一台機器插電" />
);
const D0S5Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 5 步 —— 實際執行過程" lines={d0s5Lines} />
);

const d0s6Hdr = 'NAME                                    STATE     ACTION          AGENT';
const d0s6Lines: RLine[] = [
  { t: 0.5, text: 'watch kubectl -n tinkerbell get hardware,workflow', kind: 'cmd' },
  { t: 1.8, text: `${d0s6Hdr}\n（No resources found —— 機器剛接上電源）`, kind: 'frame' },
  { t: 5.0, text: `hardware/discovery-bc-24-11-5e-4f-a9\n\n${d0s6Hdr}\nenrollment-bc-24-11-5e-4f-a9            RUNNING   write-image     bc:24:11:5e:4f:a9`, kind: 'frame' },
  { t: 12.0, text: `hardware/discovery-bc-24-11-5e-4f-a9\n\n${d0s6Hdr}\nenrollment-bc-24-11-5e-4f-a9            RUNNING   write-ignition  bc:24:11:5e:4f:a9`, kind: 'frame' },
  { t: 14.5, text: `hardware/discovery-bc-24-11-5e-4f-a9\n\n${d0s6Hdr}\nenrollment-bc-24-11-5e-4f-a9            RUNNING   reboot          bc:24:11:5e:4f:a9`, kind: 'frame' },
  { t: 17.0, text: `hardware/discovery-bc-24-11-5e-4f-a9\n\n${d0s6Hdr}\nenrollment-bc-24-11-5e-4f-a9            SUCCESS   reboot          bc:24:11:5e:4f:a9   （實測 +332 秒）`, kind: 'frame' },
  { t: 19.5, text: "kubectl -n tinkerbell patch hardware discovery-bc-24-11-5e-4f-a9 --type=merge \\\n  -p '{\"spec\":{\"interfaces\":[{\"dhcp\":{\"mac\":\"bc:24:11:5e:4f:a9\"},\"netboot\":{\"allowPXE\":false}}]}}'", kind: 'cmd' },
  { t: 20.7, text: 'hardware.tinkerbell.org/discovery-bc-24-11-5e-4f-a9 patched' },
  { t: 22.5, text: 'ssh core@172.16.91.192 hostnamectl', kind: 'cmd' },
  { t: 23.7, text: ' Static hostname: pool-node\nOperating System: Flatcar Container Linux by Kinvolk 4593.2.5 (Oklo)\n          Kernel: Linux 6.12.102-flatcar' },
  { t: 25.5, text: '資源池第一台機器上線 —— 插電之後，人沒碰過它', kind: 'ok' },
];
const D0S6Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={6} total={9} title="插電時刻"
    cmd={`# 把空白機器接上網路，開機。
# 然後 —— 什麼都不用做。

watch kubectl -n tinkerbell \\
  get hardware,workflow
# 裝完補一手收尾（關 allowPXE）——
# 上游留白，enrollment controller 未來的職責`}
    expect="Hardware 無中生有；安裝 workflow 自動出現、逐步轉 SUCCESS；機器重開進 Flatcar（實錄 5.5 分鐘）" />
);
const D0S6Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 6 步 —— 插電，然後看著（實錄 5.5 分鐘）" lines={d0s6Lines} />
);

/* ── 第一幕 → day-0 後三步 過場 ─────────────────────── */
const PairRow = ({ you, me }: { you: string; me: string }) => (
  <div style={{ display: 'flex', gap: 20 }}>
    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '18px 26px', fontSize: 29, lineHeight: 1.45 }}>{you}</div>
    <div style={{ alignSelf: 'center', fontSize: 34, color: mutedDark }}>=</div>
    <div style={{ flex: 1, background: 'rgba(240,181,161,0.10)', border: '1px solid rgba(240,181,161,0.4)', borderRadius: 10, padding: '18px 26px', fontSize: 29, lineHeight: 1.45 }}>{me}</div>
  </div>
);
const BackToDay0: Page = () => (
  <Dark eyebrow="DEMO · DAY-0 後三步（約 9 分鐘）" title="放下鍵盤。你剛做的，真實機房做過一次" world="demo">
    <div style={{ display: 'flex', gap: 20, marginBottom: 14, fontSize: 26, fontWeight: 800, letterSpacing: '0.1em' }}>
      <div style={{ flex: 1, color: '#9fd39f' }}>動手環境（kind + Docker）</div>
      <div style={{ width: 34 }} />
      <div style={{ flex: 1, color: '#f0b5a1' }}>真實機房（k3s + 裸機）</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PairRow you="步驟 2：clusterctl init，infrastructure 是 docker" me="第 7 步：同一個指令，infrastructure 換成 tinkerbell" />
      <PairRow you="步驟 3：apply 200 行，開出 demo 叢集" me="第 8 步：同一個結構，開出跑在裸機上的管理叢集" />
      <PairRow you="（沒有這步，kind 用完就丟）" me="第 9 步：pivot，把管理權搬進剛開出來的叢集，關掉起始機" />
    </div>
  </Dark>
);

const d0s7Lines: RLine[] = [
  { t: 0.5, text: './install-capi.sh', kind: 'cmd' },
  { t: 1.7, text: 'clusterctl version: v1.12.5' },
  { t: 3.2, text: 'Fetching providers\nInstalling cert-manager version="v1.20.1"' },
  { t: 5.2, text: 'Installing provider="cluster-api" version="v1.12.5"\nInstalling provider="bootstrap-kubeadm" version="v1.12.5"\nInstalling provider="control-plane-kubeadm" version="v1.12.5"\nInstalling provider="infrastructure-tinkerbell" version="v0.7.0"' },
  { t: 7.5, text: 'Your management cluster has been initialized successfully!' },
  { t: 9.0, text: 'deployment.apps/capt-controller-manager env updated\ncapi-system    capi-controller-manager-...    1/1   Running\ncapt-system    capt-controller-manager-...    1/1   Running' },
  { t: 10.8, text: '開叢集從此也是宣告式 —— 下一步就開在裸機上', kind: 'ok' },
];
const D0S7Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={7} total={9} title="裝 Cluster API（含裸機 provider）"
    cmd={`./install-capi.sh
# 三個上游沒寫清楚的必要設定：
#   provider 名錄要手動登記 tinkerbell
#   CAPT 要知道 Tinkerbell 的位址
#   Ignition feature gate 要在 init 前開`}
    expect="看到 initialized successfully；core、bootstrap、control-plane、tinkerbell 四組 controller 全部 Running" />
);
const D0S7Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 7 步 —— 實際執行過程" lines={d0s7Lines} />
);

const d0s8Hdr = 'NAME            CLUSTER   NODE NAME   PHASE          AGE   VERSION';
const d0s8Lines: RLine[] = [
  { t: 0.5, text: 'python3 gen-mgmt-hardware.py 1 bc:24:11:df:f3:32 | kubectl apply -f -', kind: 'cmd' },
  { t: 1.6, text: 'hardware.tinkerbell.org/mgmt-1 created' },
  { t: 3.0, text: 'python3 gen-mgmt-cluster.py mgmt 1 oem-stub.json "$(cat ~/.ssh/id_ed25519.pub)" | kubectl apply -f -', kind: 'cmd' },
  { t: 4.2, text: 'cluster.cluster.x-k8s.io/mgmt created\ntinkerbellcluster.infrastructure.cluster.x-k8s.io/mgmt created\nkubeadmcontrolplane.controlplane.cluster.x-k8s.io/mgmt-cp created\ntinkerbellmachinetemplate.infrastructure.cluster.x-k8s.io/mgmt-cp created' },
  { t: 6.5, text: `${d0s8Hdr}\nmgmt-cp-nbwj8   mgmt                  Provisioning   5s    v1.34.6`, kind: 'frame' },
  { t: 10.0, text: `${d0s8Hdr}\nmgmt-cp-nbwj8   mgmt                  Provisioning   2m    v1.34.6\n（workflow：寫映像 → 寫 OEM stub → 重開 → kubeadm init）`, kind: 'frame' },
  { t: 14.0, text: `${d0s8Hdr}\nmgmt-cp-nbwj8   mgmt      mgmt-1      Running        13m   v1.34.6   （實測 +773 秒）`, kind: 'frame' },
  { t: 16.5, text: 'clusterctl get kubeconfig mgmt > mgmt.kubeconfig\nhelm install cilium cilium/cilium --kubeconfig mgmt.kubeconfig ...', kind: 'cmd' },
  { t: 18.0, text: 'kubectl --kubeconfig mgmt.kubeconfig get nodes', kind: 'cmd' },
  { t: 19.2, text: 'NAME     STATUS   ROLES           AGE    VERSION\nmgmt-1   Ready    control-plane   3m8s   v1.34.6' },
  { t: 21.0, text: '一份 YAML，開出一座跑在裸機上的 Kubernetes', kind: 'ok' },
];
const D0S8Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={8} total={9} title="開出管理叢集 —— 這次是裸機"
    cmd={`# 管理節點預先登記（固定 IP + 角色標籤）
python3 gen-mgmt-hardware.py 1 <MAC> \\
  | kubectl apply -f -
# 一個 Cluster API 叢集定義
python3 gen-mgmt-cluster.py mgmt 1 \\
  oem-stub.json "<你的公鑰>" \\
  | kubectl apply -f -`}
    expect="Machine 從 Provisioning 轉 Running（實錄 13 分鐘，全程不碰機器）；裝上 CNI 後 get nodes 看到 Ready" />
);
const D0S8Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 8 步 —— 實際執行過程（實錄 13 分鐘）" lines={d0s8Lines} />
);

const d0s9Hdr = 'NAME            CLUSTER   NODE NAME   READY   PHASE     AGE   VERSION';
const d0s9Lines: RLine[] = [
  { t: 0.5, text: 'helm install tinkerbell ... --kubeconfig mgmt.kubeconfig -f tinkerbell-values-mgmt.yaml\nEXP_KUBEADM_BOOTSTRAP_FORMAT_IGNITION=true clusterctl init --kubeconfig mgmt.kubeconfig ...', kind: 'cmd' },
  { t: 2.0, text: 'STATUS: deployed\nYour management cluster has been initialized successfully!' },
  { t: 4.0, text: '# 搬資料面：Hardware 與 Template（Workflow 歷史絕不搬）', kind: 'cmd' },
  { t: 5.2, text: 'hardware.tinkerbell.org/discovery-bc-24-11-5e-4f-a9 created\nhardware.tinkerbell.org/mgmt-1 created\ntemplate.tinkerbell.org/flatcar-install created' },
  { t: 7.2, text: 'clusterctl move --to-kubeconfig mgmt.kubeconfig', kind: 'cmd' },
  { t: 8.4, text: 'Creating objects in the target cluster\nDeleting objects from the source cluster' },
  { t: 10.4, text: 'kubectl --kubeconfig mgmt.kubeconfig get machines.cluster.x-k8s.io', kind: 'cmd' },
  { t: 11.6, text: `${d0s9Hdr}\nmgmt-cp-nbwj8   mgmt      mgmt-1      True    Running   15s   v1.34.6` },
  { t: 13.6, text: 'sudo systemctl stop k3s   # seed 停役', kind: 'cmd' },
  { t: 15.2, text: 'kubectl --kubeconfig mgmt.kubeconfig get machines.cluster.x-k8s.io', kind: 'cmd' },
  { t: 16.4, text: `${d0s9Hdr}\nmgmt-cp-nbwj8   mgmt      mgmt-1      True    Running   18s   v1.34.6` },
  { t: 18.4, text: '起始機已關 —— 平台管理著自己。day-0 完成', kind: 'ok' },
];
const D0S9Cmd: Page = () => (
  <StepCmd act="DAY-0 建置" step={9} total={9} title="pivot —— 平台開始管理自己"
    cmd={`# mgmt 就位：Tinkerbell + Cluster API
# 搬資料面（Workflow 歷史不搬 ——
#   匯入後狀態歸零會把機器重灌！）
clusterctl move \\
  --to-kubeconfig mgmt.kubeconfig
sudo systemctl stop k3s   # seed 停役`}
    expect="move 之後，管理叢集裡看得到自己的 Machine；起始機停掉 k3s 後，Machine 仍是 Running" />
);
const D0S9Replay: Page = () => (
  <ReplayPage world="demo" title="DAY-0 · 第 9 步 —— 實際執行過程" lines={d0s9Lines} />
);

/* ── 07b Tinkerbell 建置 ─────────────────────────────── */
const TinkRow = ({ name, role }: { name: string; role: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28, background: '#fff', border: '1px solid #e8e2df', borderRadius: 10, padding: '17px 30px' }}>
    <div style={{ width: 300, fontFamily: mono, fontSize: 30, fontWeight: 700, color: 'var(--osd-accent)' }}>{name}</div>
    <div style={{ fontSize: 29, color: '#5a5148' }}>{role}</div>
  </div>
);

const TinkerbellStack: Page = () => (
  <Light eyebrow="上架系統怎麼搭" title="Tinkerbell：五個元件">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 2 }}>
      <TinkRow name="smee" role="監聽 PXE 廣播、補充開機資訊 —— 不搶機房 DHCP 的位置" />
      <TinkRow name="HookOS" role="只存在於記憶體的小型 Linux —— 回報硬體、執行安裝，不碰硬碟" />
      <TinkRow name="tootles" role="中繼資料服務 —— 機器開機時來拿自己的設定" />
      <TinkRow name="tink" role="workflow 引擎 —— 定義裝機要做哪幾步" />
      <TinkRow name="Rufio（選配）" role="BMC 電源控制 —— 有 BMC 的機器可以遠端開關機" />
    </div>
    <p style={{ fontSize: 32, marginTop: 34, fontWeight: 700 }}>
      機器、範本、workflow 全部是 K8s CRD
    </p>
  </Light>
);

/* ── 07c 上架流程 ────────────────────────────────────── */
const FlowStep = ({ n, text }: { n: string; text: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--osd-accent)', color: '#fff', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontSize: 32, lineHeight: 1.4 }}>{text}</div>
  </div>
);

const EnrollFlow: Page = () => (
  <Light eyebrow="上架系統怎麼搭" title="插電之後，機器經歷了什麼">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 6 }}>
      <FlowStep n="1" text="插電開機 —— 網卡韌體廣播「我是 MAC xx:xx，該做什麼？」（PXE）" />
      <FlowStep n="2" text="smee 補充開機資訊 → 機器載入 HookOS（記憶體內，硬碟不動）" />
      <FlowStep n="3" text="HookOS 回報硬體規格 → 叢集裡自動出現一個 Hardware 物件" />
      <FlowStep n="4" text="符合規則就觸發 Workflow：把作業系統映像寫進指定硬碟" />
      <FlowStep n="5" text="重開機進正式系統，在池裡待命 —— 之後由 Cluster API 認領成叢集節點" />
    </div>
  </Light>
);

/* ── 03b 步驟 0：環境就緒 ────────────────────────────── */
const step0Lines: RLine[] = [
  { t: 0.5, text: 'cd k8s-summit-2026-workshop && ./setup/setup.sh', kind: 'cmd' },
  { t: 1.5, text: '==> 檢查 Docker\n ✓ CPU：4 核\n ✓ 記憶體：8 GB' },
  { t: 3.0, text: '==> 檢查工具鏈版本\n ✓ kind v0.30.0\n ✓ clusterctl v1.13.4\n ✓ kubectl\n ✓ helm' },
  { t: 5.0, text: '==> 預拉映像檔（會前已完成的話這裡秒過）\n ✓ kindest/node:v1.34.0\n ✓ registry.k8s.io/kro/kro:v0.9.3\n ✓ ……（共 10 個）' },
  { t: 7.0, text: '==> 產生離線快取\n ✓ 603M 已存檔' },
  { t: 8.5, text: '==> 自我驗證' },
  { t: 9.5, text: 'SETUP-OK —— 環境就緒，工作坊見！', kind: 'ok' },
];
const Step0Cmd: Page = () => (
  <StepCmd act="開始動手前" step={0} total={7} title="確認環境就緒"
    cmd={`cd k8s-summit-2026-workshop
./setup/setup.sh        # 會前跑過的話，這裡只是再驗證一次
# 沒跑過？舉手拿 USB：
./setup/load-from-usb.sh /path/to/usb`}
    expect="看到 SETUP-OK 就緒；有任何 ✗ 照訊息排除或舉手找助教" />
);
const Step0Replay: Page = () => (
  <ReplayPage world="lab" title="開始動手前 —— 環境驗證" lines={step0Lines} />
);

/* ── 08 demo① 過場 ───────────────────────────────────── */
const Demo1: Page = () => (
  <Dark eyebrow="DEMO ①" title="插電，然後看著它自己上架" world="demo">
    <ul style={{ fontSize: 42, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={34}>一台空機器：硬碟沒有 OS，只設成從網路開機</Li>
      <Li gap={34}>現在開機。畫面上 Hardware、Workflow 都還是空的</Li>
      <Li gap={34}>幾十秒後 Hardware <Red>自己出現</Red>；接著 Workflow 出現、開始裝</Li>
    </ul>
  </Dark>
);

/* ── 09 Tinkerbell 原理 ──────────────────────────────── */
const HowPxe: Page = () => (
  <Light eyebrow="它是怎麼辦到的" title="PXE：韌體內建的網路開機機制">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>網卡韌體會廣播：「我是 MAC xx:xx，有人要告訴我該做什麼嗎？」（PXE）</Li>
      <Li>Tinkerbell 只補充開機欄位 —— IP 照舊由機房 DHCP 發，<Red>不需要動現有網路設定</Red></Li>
      <Li>機器載入一個只活在記憶體的小系統，回報規格、執行安裝</Li>
      <Li>不是我們推指令給機器，是<Red>機器每次開機來問</Red>，我們只負責回答</Li>
      <Li>BMC 是選配而非必要 —— 連沒有 BMC 的消費級機器都能全自動</Li>
    </ul>
  </Light>
);

/* ── 10 第一幕指引 ───────────────────────────────────── */
const Act1Guide: Page = () => (
  <Light eyebrow="HANDS-ON · 第一幕（約 20 分鐘）" title="純 Cluster API：先看 200 行長什麼樣" world="lab" hint={LAB_HINT['第一幕']}>
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Code size={32}>{`cd k8s-summit-2026-workshop
less labs/01-capi/README.md   # 跟著走
# 卡住了：
./labs/checkpoints/reset-to-01-end.sh`}</Code>
        <p style={{ fontSize: 30, color: '#5a5148', marginTop: 28, lineHeight: 1.5 }}>
          兩個終端機並排：一邊 <span style={{ fontFamily: mono }}>watch kubectl get machines</span>，
          一邊 <span style={{ fontFamily: mono }}>watch docker ps</span>
        </p>
      </div>
      <ul style={{ fontSize: 34, paddingLeft: 40, margin: 0, width: 620 }}>
        <Li gap={24}>apply 七個物件 → 叢集長出來</Li>
        <Li gap={24}>每個 Machine 就是一個 container</Li>
        <Li gap={24}>擴容 = 改一個數字</Li>
        <Li gap={24}>升級 = <Red>換機器</Red>，不是修機器</Li>
      </ul>
    </div>
    <p style={{ fontSize: 31, marginTop: 30, fontWeight: 700 }}>
      剛剛看的是真實機房。接下來底層換成你電腦上的 Docker container，指令一樣。
    </p>
  </Light>
);


/* ── 終端重播元件 ────────────────────────────────────── */
type RLine = { t: number; text: string; kind?: 'cmd' | 'ok' | 'frame' };

const TerminalReplay = ({ lines, title, speed = 1 }: { lines: RLine[]; title: string; speed?: number }) => {
  const active = useIsActivePage();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    setElapsed(0);
    const t0 = performance.now();
    const id = setInterval(() => setElapsed(((performance.now() - t0) / 1000) * speed), 100);
    return () => clearInterval(id);
  }, [active, speed]);

  const visible = lines.filter((l) => l.t <= elapsed && l.kind !== 'frame');
  const frames = lines.filter((l) => l.kind === 'frame' && l.t <= elapsed);
  const frame = frames.length ? frames[frames.length - 1] : null;
  const done = lines.length > 0 && elapsed >= lines[lines.length - 1].t;

  return (
    <div style={{ background: codeBg, border: `1px solid ${codeBorder}`, borderRadius: 'var(--osd-radius)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderBottom: `1px solid ${codeBorder}` }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: '#ff5f57' }} />
        <span style={{ width: 16, height: 16, borderRadius: 8, background: '#febc2e' }} />
        <span style={{ width: 16, height: 16, borderRadius: 8, background: '#28c840' }} />
        <span style={{ marginLeft: 18, fontFamily: mono, fontSize: 22, color: '#909aa4' }}>{title}</span>
        <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 20, color: done ? '#7ee787' : '#909aa4' }}>
          {done ? '完成' : '播放中…'}
        </span>
      </div>
      <pre style={{ flex: 1, margin: 0, padding: '24px 32px', fontFamily: mono, fontSize: 26, lineHeight: 1.5, color: '#e8e8e8', userSelect: 'text', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
        {visible.map((l, i) => (
          <div key={i} style={{ color: l.kind === 'cmd' ? '#7ee787' : l.kind === 'ok' ? '#79c0ff' : '#e8e8e8' }}>
            {l.kind === 'cmd' ? '$ ' + l.text : l.text}
          </div>
        ))}
        {frame && <div style={{ color: '#e8e8e8' }}>{frame.text}</div>}
        {!done && <span style={{ display: 'inline-block', width: 14, height: 30, background: '#e8e8e8', verticalAlign: 'text-bottom' }} />}
      </pre>
    </div>
  );
};

const ReplayPage = ({ world, title, lines }: { world: World; title: string; lines: RLine[] }) => (
  <div style={{ ...fill, background: darkBg, padding: 80, position: 'relative' }}>
    <div style={{ position: 'absolute', top: 28, right: 80 }}><WorldChip world={world} hint={world === 'demo' ? '' : undefined} dark /></div>
    <TerminalReplay title={title} lines={lines} />
  </div>
);

/* ── 完整錄製檔頁（存證用，簡報時快速帶過）───────────── */
const RawLog = ({ k, title }: { k: string; title: string }) => (
  <div style={{ ...fill, background: darkBg, padding: '56px 80px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 20 }}>
      <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.12em', color: '#e05545' }}>完整錄製檔</span>
      <span style={{ marginLeft: 'auto' }}><WorldChip world={/^(d0|d2|d3)/.test(k) ? 'demo' : 'lab'} hint={/^(d0|d2|d3)/.test(k) ? '' : undefined} dark /></span>
      <span style={{ fontSize: 26, color: mutedDark }}>{title} · 原始輸出未剪裁（可捲動、可複製）</span>
    </div>
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: codeBg, border: `1px solid ${codeBorder}`, borderRadius: 'var(--osd-radius)', padding: '28px 34px' }}>
      <pre style={{ margin: 0, fontFamily: mono, fontSize: 19, lineHeight: 1.5, color: '#d8d8dc', whiteSpace: 'pre-wrap', wordBreak: 'break-all', userSelect: 'text' }}>{RAW[k]}</pre>
    </div>
  </div>
);
const RawS0: Page = () => <RawLog k="s0" title="開始動手前 · 環境驗證" />;
const RawS2: Page = () => <RawLog k="s2" title="第一幕 · 步驟 2" />;
const RawS1: Page = () => <RawLog k="s1" title="開始動手前 · 步驟 1" />;
const RawS3: Page = () => <RawLog k="s3" title="第一幕 · 步驟 3" />;
const RawS4: Page = () => <RawLog k="s4" title="第一幕 · 步驟 4" />;
const RawS5: Page = () => <RawLog k="s5" title="第一幕 · 步驟 5" />;
const RawS6: Page = () => <RawLog k="s6" title="第一幕 · 步驟 6" />;
const RawS7: Page = () => <RawLog k="s7" title="第一幕 · 步驟 7" />;
const RawA2S1: Page = () => <RawLog k="a2s1" title="第二幕 · 步驟 1" />;
const RawA2S2: Page = () => <RawLog k="a2s2" title="第二幕 · 步驟 2" />;
const RawA2S3: Page = () => <RawLog k="a2s3" title="第二幕 · 步驟 3" />;
const RawA2S4: Page = () => <RawLog k="a2s4" title="第二幕 · 步驟 4" />;
const RawA2S5: Page = () => <RawLog k="a2s5" title="第二幕 · 步驟 5" />;
const RawA2S6: Page = () => <RawLog k="a2s6" title="第二幕 · 步驟 6" />;
const RawA2S7: Page = () => <RawLog k="a2s7" title="第二幕 · 步驟 7" />;
const RawD0S1: Page = () => <RawLog k="d0s1" title="DAY-0 · 第 1 步" />;
const RawD0S2: Page = () => <RawLog k="d0s2" title="DAY-0 · 第 2 步" />;
const RawD0S3: Page = () => <RawLog k="d0s3" title="DAY-0 · 第 3 步" />;
const RawD0S4: Page = () => <RawLog k="d0s4" title="DAY-0 · 第 4 步" />;
const RawD0S5: Page = () => <RawLog k="d0s5" title="DAY-0 · 第 5 步" />;
const RawD0S6: Page = () => <RawLog k="d0s6" title="DAY-0 · 第 6 步（插電時刻）" />;
const RawD0S7: Page = () => <RawLog k="d0s7" title="DAY-0 · 第 7 步" />;
const RawD0S8: Page = () => <RawLog k="d0s8" title="DAY-0 · 第 8 步（開出管理叢集）" />;
const RawD0S9: Page = () => <RawLog k="d0s9" title="DAY-0 · 第 9 步（pivot）" />;
const RawD3: Page = () => <RawLog k="d3" title="DEMO ③ · 免重開升級" />;

const LAB_HINT: Record<string, string> = {
  '開始動手前': '跟著做 · setup/',
  '第一幕': '跟著做 · labs/01-capi/README.md',
  '第二幕': '跟著做 · labs/02-kro/README.md',
};
const worldOf = (act: string): World => (act in LAB_HINT ? 'lab' : 'demo');

const StepCmd = ({ act, step, total, title, cmd, expect }: { act: string; step: number; total: number; title: string; cmd: string; expect: string }) => {
  const world = worldOf(act);
  const demo = world === 'demo';
  return (
    <div style={{ ...fill, background: demo ? darkBg : 'var(--osd-bg)', color: demo ? '#ffffff' : 'var(--osd-text)', padding: 120, position: 'relative' }}>
      <Eyebrow dark={demo}>{demo ? (act.startsWith('DEMO') ? act : `${WORLD.demo.name} · ${act} · 第 ${step}/${total} 步`) : `${WORLD.lab.name} · ${act} · 步驟 ${step}/${total}`}</Eyebrow>
      <H>{title}</H>
      <div style={{ marginTop: 56 }}>
        <Code size={34}>{cmd}</Code>
        <p style={{ fontSize: 34, marginTop: 44, lineHeight: 1.55, color: demo ? '#f0f0f0' : undefined }}>
          <Red>{demo ? '會看到：' : '預期：'}</Red>{expect}
        </p>
      </div>
      <Footer dark={demo} world={world} hint={demo ? '' : LAB_HINT[act]} />
    </div>
  );
};

// 真實輸出（2026-08-25 錄於驗收機；時間軸壓縮為演講節奏，雜訊行已剪）
const step1Lines: RLine[] = [
  { t: 0.5, text: 'kind create cluster --config labs/01-capi/kind-mgmt.yaml --name mgmt', kind: 'cmd' },
  { t: 1.2, text: 'Creating cluster "mgmt" ...' },
  { t: 2.4, text: ' ✓ Ensuring node image (kindest/node:v1.34.0) 🖼' },
  { t: 3.6, text: ' ✓ Preparing nodes 📦' },
  { t: 4.4, text: ' ✓ Writing configuration 📜' },
  { t: 6.2, text: ' ✓ Starting control-plane 🕹️' },
  { t: 7.0, text: ' ✓ Installing CNI 🔌' },
  { t: 7.6, text: ' ✓ Installing StorageClass 💾' },
  { t: 8.4, text: 'Set kubectl context to "kind-mgmt"', kind: 'ok' },
  { t: 10.0, text: 'kind load image-archive ~/.summit-workshop/images.tar --name mgmt', kind: 'cmd' },
  { t: 12.0, text: '（載入約 4 分鐘 —— 實際等待已快轉）' },
  { t: 13.5, text: 'Image archive loaded into node mgmt-control-plane', kind: 'ok' },
];

const machinesHeader = 'NAME                       CLUSTER   NODE NAME                  PHASE          AGE     VERSION';
const step3Lines: RLine[] = [
  { t: 0.5, text: 'kubectl apply -f labs/01-capi/cluster-raw.yaml', kind: 'cmd' },
  { t: 1.4, text: 'cluster.cluster.x-k8s.io/demo created' },
  { t: 1.8, text: 'dockercluster.infrastructure.cluster.x-k8s.io/demo created' },
  { t: 2.2, text: 'dockermachinetemplate.infrastructure.cluster.x-k8s.io/demo-control-plane created' },
  { t: 2.6, text: 'kubeadmcontrolplane.controlplane.cluster.x-k8s.io/demo-control-plane created' },
  { t: 3.0, text: 'dockermachinetemplate.infrastructure.cluster.x-k8s.io/demo-md-0 created' },
  { t: 3.4, text: 'kubeadmconfigtemplate.bootstrap.cluster.x-k8s.io/demo-md-0 created' },
  { t: 3.8, text: 'machinedeployment.cluster.x-k8s.io/demo-md-0 created' },
  { t: 5.5, text: 'watch kubectl get machines', kind: 'cmd' },
  { t: 6.5, kind: 'frame', text: machinesHeader + '\n' +
    'demo-control-plane-grlj9   demo                                 Pending        6s      v1.34.0' },
  { t: 10.0, kind: 'frame', text: machinesHeader + '\n' +
    'demo-control-plane-grlj9   demo                                 Provisioning   41s     v1.34.0\n' +
    'demo-md-0-rw9sc-r44fv      demo                                 Pending        19s     v1.34.0' },
  { t: 14.0, kind: 'frame', text: machinesHeader + '\n' +
    'demo-control-plane-grlj9   demo                                 Provisioned    2m19s   v1.34.0\n' +
    'demo-md-0-rw9sc-r44fv      demo                                 Pending        1m57s   v1.34.0' },
  { t: 18.0, kind: 'frame', text: machinesHeader + '\n' +
    'demo-control-plane-grlj9   demo   demo-control-plane-grlj9      Running        2m57s   v1.34.0\n' +
    'demo-md-0-rw9sc-r44fv      demo                                 Provisioning   2m35s   v1.34.0' },
  { t: 20.0, text: '（另一個終端機同時 watch docker ps —— 每台 Machine 就是一個 container）', kind: 'ok' },
];

const Step1Cmd: Page = () => (
  <StepCmd act="開始動手前" step={1} total={7} title="建立管理叢集 —— 為第一幕動手做準備"
    cmd={`# 管理叢集：放 Cluster API 的叢集，之後用它開別的叢集
kind create cluster \\
  --config labs/01-capi/kind-mgmt.yaml --name mgmt
kind load image-archive \\
  ~/.summit-workshop/images.tar --name mgmt`}
    expect="看到 Set kubectl context to kind-mgmt、Image archive loaded；兩個指令共約 7 分鐘" />
);

const Step1Replay: Page = () => (
  <ReplayPage world="lab" title="開始動手前 · 步驟 1 —— 參考輸出（會前錄製）" lines={step1Lines} />
);

const Step3Cmd: Page = () => (
  <StepCmd act="第一幕" step={3} total={7} title="開一個叢集 —— 原始的方式"
    cmd={`less labs/01-capi/cluster-raw.yaml   # 先看看 200 行長什麼樣
kubectl apply -f labs/01-capi/cluster-raw.yaml
watch kubectl get machines`}
    expect="七個物件建立後，Machine 約 3 分鐘轉為 Running；docker ps 會多出三個 container" />
);

const Step3Replay: Page = () => (
  <ReplayPage world="lab" title="第一幕 · 步驟 3 —— 參考輸出（會前錄製）" lines={step3Lines} />
);

const step2Lines: RLine[] = [
  { t: 0.5, text: 'clusterctl init --core cluster-api:v1.13.4 --bootstrap kubeadm:v1.13.4 \\', kind: 'cmd' },
  { t: 0.5, text: '    --control-plane kubeadm:v1.13.4 --infrastructure docker:v1.14.0', kind: 'cmd' },
  { t: 1.6, text: 'Fetching providers' },
  { t: 2.6, text: 'Installing cert-manager version="v1.20.3"' },
  { t: 4.2, text: 'Waiting for cert-manager to be available...' },
  { t: 6.0, text: 'Installing provider="cluster-api" version="v1.13.4" targetNamespace="capi-system"' },
  { t: 7.0, text: 'Installing provider="bootstrap-kubeadm" version="v1.13.4" targetNamespace="capi-kubeadm-bootstrap-system"' },
  { t: 8.0, text: 'Installing provider="control-plane-kubeadm" version="v1.13.4" targetNamespace="capi-kubeadm-control-plane-system"' },
  { t: 9.0, text: 'Installing provider="infrastructure-docker" version="v1.14.0" targetNamespace="capd-system"' },
  { t: 10.5, text: 'Your management cluster has been initialized successfully!', kind: 'ok' },
];

const Step2Cmd: Page = () => (
  <StepCmd act="第一幕" step={2} total={7} title="安裝 Cluster API"
    cmd={`clusterctl init --core cluster-api:v1.13.4 \\
  --bootstrap kubeadm:v1.13.4 \\
  --control-plane kubeadm:v1.13.4 \\
  --infrastructure docker:v1.14.0
# 版本寫死：讀會前預載的本地定義檔，全程不需要網路`}
    expect="看到 initialized successfully；約 2–3 分鐘" />
);
const Step2Replay: Page = () => (
  <ReplayPage world="lab" title="第一幕 · 步驟 2 —— 參考輸出（會前錄製）" lines={step2Lines} />
);

const step4Lines: RLine[] = [
  { t: 0.5, text: 'clusterctl get kubeconfig demo > /tmp/demo.kubeconfig', kind: 'cmd' },
  { t: 1.5, text: 'kubectl --kubeconfig /tmp/demo.kubeconfig get nodes', kind: 'cmd' },
  { t: 2.5, text: 'NAME                       STATUS     ROLES           AGE   VERSION\ndemo-control-plane-945t7   NotReady   control-plane   71s   v1.34.0' },
  { t: 4.5, text: 'kubectl --kubeconfig /tmp/demo.kubeconfig apply -f labs/01-capi/kindnet.yaml', kind: 'cmd' },
  { t: 5.5, text: 'daemonset.apps/kindnet created（其餘 RBAC 物件略）' },
  { t: 7.5, text: 'kubectl --kubeconfig /tmp/demo.kubeconfig get nodes', kind: 'cmd' },
  { t: 9.0, text: 'NAME                       STATUS   ROLES           AGE    VERSION\ndemo-control-plane-945t7   Ready    control-plane   119s   v1.34.0', kind: 'ok' },
];
const Step4Cmd: Page = () => (
  <StepCmd act="第一幕" step={4} total={7} title="進入新叢集、裝 CNI"
    cmd={`clusterctl get kubeconfig demo > /tmp/demo.kubeconfig
kubectl --kubeconfig /tmp/demo.kubeconfig \\
  apply -f labs/01-capi/kindnet.yaml`}
    expect="新叢集的節點先是 NotReady（還沒有 CNI）；裝上 CNI 後約 1 分鐘轉 Ready" />
);
const Step4Replay: Page = () => (
  <ReplayPage world="lab" title="第一幕 · 步驟 4 —— 參考輸出（會前錄製）" lines={step4Lines} />
);

const mHdr = 'NAME                       PHASE          AGE';
const step5Lines: RLine[] = [
  { t: 0.5, text: 'kubectl scale machinedeployment demo-md-0 --replicas=2', kind: 'cmd' },
  { t: 1.4, text: 'machinedeployment.cluster.x-k8s.io/demo-md-0 scaled' },
  { t: 2.6, text: 'watch kubectl get machines', kind: 'cmd' },
  { t: 3.6, kind: 'frame', text: mHdr + '\ndemo-control-plane-945t7   Running        4m\ndemo-md-0-dllkk-qclx2      Running        3m59s' },
  { t: 6.5, kind: 'frame', text: mHdr + '\ndemo-control-plane-945t7   Running        4m11s\ndemo-md-0-dllkk-8qfxp      Provisioning   17s\ndemo-md-0-dllkk-qclx2      Running        3m59s' },
  { t: 10.0, kind: 'frame', text: mHdr + '\ndemo-control-plane-945t7   Running        4m54s\ndemo-md-0-dllkk-8qfxp      Provisioned    60s\ndemo-md-0-dllkk-qclx2      Running        4m42s' },
  { t: 13.5, kind: 'frame', text: mHdr + '\ndemo-control-plane-945t7   Running        5m15s\ndemo-md-0-dllkk-8qfxp      Running        81s\ndemo-md-0-dllkk-qclx2      Running        5m3s' },
  { t: 15.5, text: '（docker ps 同步多出一個 container）', kind: 'ok' },
];
const Step5Cmd: Page = () => (
  <StepCmd act="第一幕" step={5} total={7} title="擴容"
    cmd={`kubectl scale machinedeployment demo-md-0 --replicas=2
watch kubectl get machines`}
    expect="約 90 秒後 get machines 多出一台 md-0 worker，Running" />
);
const Step5Replay: Page = () => (
  <ReplayPage world="lab" title="第一幕 · 步驟 5 —— 參考輸出（會前錄製）" lines={step5Lines} />
);

const dHdr = 'NAMES                      STATUS';
const step7Lines: RLine[] = [
  { t: 0.5, text: 'kubectl delete cluster demo', kind: 'cmd' },
  { t: 1.5, text: 'cluster.cluster.x-k8s.io "demo" deleted' },
  { t: 3.0, text: 'watch docker ps', kind: 'cmd' },
  { t: 4.0, kind: 'frame', text: dHdr + '\ndemo-md-0-dllkk-8qfxp      Up 6 minutes\ndemo-md-0-dllkk-qclx2      Up 7 minutes\ndemo-control-plane-945t7   Up 10 minutes\ndemo-lb                    Up 10 minutes' },
  { t: 8.0, kind: 'frame', text: dHdr + '\ndemo-control-plane-945t7   Up 10 minutes\ndemo-lb                    Up 11 minutes' },
  { t: 11.0, kind: 'frame', text: dHdr + '\ndemo-lb                    Up 11 minutes' },
  { t: 13.5, kind: 'frame', text: dHdr },
  { t: 15.0, text: '（三台機器與負載平衡器全部回收 —— 管理叢集 mgmt 保留，第二幕要用）', kind: 'ok' },
];
const Step7Cmd: Page = () => (
  <StepCmd act="第一幕" step={7} total={7} title="拆掉"
    cmd={`kubectl delete cluster demo
watch docker ps`}
    expect="機器 container 依序消失；mgmt 管理叢集保留給第二幕" />
);
const Step7Replay: Page = () => (
  <ReplayPage world="lab" title="第一幕 · 步驟 7 —— 參考輸出（會前錄製）" lines={step7Lines} />
);

const step6Lines: RLine[] = [
  { t: 0.5, text: 'kubectl delete machine demo-md-0-7jc8c-kwm9t &', kind: 'cmd' },
  { t: 1.5, text: 'machine.cluster.x-k8s.io "demo-md-0-7jc8c-kwm9t" deleted' },
  { t: 3.0, text: 'watch kubectl get machines', kind: 'cmd' },
  { t: 4.0, kind: 'frame', text: mHdr + '\ndemo-control-plane-6dwhv   Running        3m53s\ndemo-md-0-7jc8c-kwm9t      Running        3m42s' },
  { t: 7.0, kind: 'frame', text: mHdr + '\ndemo-control-plane-6dwhv   Running        4m8s\ndemo-md-0-7jc8c-6t82d      （新機出現）    2s' },
  { t: 10.0, kind: 'frame', text: mHdr + '\ndemo-control-plane-6dwhv   Running        4m28s\ndemo-md-0-7jc8c-6t82d      Provisioning   22s' },
  { t: 13.0, kind: 'frame', text: mHdr + '\ndemo-control-plane-6dwhv   Running        4m43s\ndemo-md-0-7jc8c-6t82d      Provisioned    37s' },
  { t: 16.0, kind: 'frame', text: mHdr + '\ndemo-control-plane-6dwhv   Running        4m59s\ndemo-md-0-7jc8c-6t82d      Running        53s' },
  { t: 18.0, text: '（刪掉 2 秒後就有新機補位，53 秒回到 Running —— 機器是 cattle）', kind: 'ok' },
];
const Step6Cmd: Page = () => (
  <StepCmd act="第一幕" step={6} total={7} title="砍一台機器，看它自動補"
    cmd={`kubectl delete machine \\
  $(kubectl get machines -o name | grep md-0 | head -1 | cut -d/ -f2) &
watch kubectl get machines`}
    expect="被刪的 worker 進入 Deleting；同時出現一台新 worker，Provisioning 轉 Running" />
);
const Step6Replay: Page = () => (
  <ReplayPage world="lab" title="第一幕 · 步驟 6 —— 參考輸出（會前錄製）" lines={step6Lines} />
);

/* ── 11 第一幕回收 ───────────────────────────────────── */
const Act1Recap: Page = () => (
  <Light eyebrow="第一幕 · 你剛剛做了什麼" title="好用，但也真的很囉唆">
    <div style={{ display: 'flex', gap: 48 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: 40 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: '#3d7a3d' }}>得到的</div>
        <ul style={{ fontSize: 33, paddingLeft: 40, marginTop: 20, lineHeight: 1.55 }}>
          <li>叢集 = 一份宣告，apply 即得</li>
          <li>擴縮、汰換全是改欄位</li>
          <li>機器變成 cattle</li>
        </ul>
      </div>
      <div style={{ flex: 1, background: '#fff', border: '2px solid var(--osd-accent)', borderRadius: 'var(--osd-radius)', padding: 40 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--osd-accent)' }}>付出的</div>
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
  <Dark eyebrow="第二幕" title={<>把 200 行，變成 6 行</>}>
    <div style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
      <Code size={30}>{`apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata:
  name: team-a
spec: {}`}</Code>
      <ul style={{ fontSize: 38, paddingLeft: 40, margin: 0, color: '#f0f0f0', flex: 1 }}>
        <Li gap={28}>平台工程 = 把第一幕那些決定<Red>寫成預設值</Red></Li>
        <Li gap={28}>只開放需要選的欄位</Li>
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
      <FourLayer n="3" name="進階設定入口" desc="進階設定原樣傳到底層 —— 但只在平台指定的位置" />
      <FourLayer n="4" name="其餘鎖死" desc="schema 沒宣告的欄位直接被拒 —— 哪些不可調，本身就是設計" />
    </div>
  </Light>
);

/* ── 14 第二幕指引 ───────────────────────────────────── */
const Act2Guide: Page = () => (
  <Light eyebrow="HANDS-ON · 第二幕（約 25 分鐘）" title="kro 自助服務：三種角色輪流當" world="lab" hint={LAB_HINT['第二幕']}>
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Code size={32}>{`less labs/02-kro/README.md
# 卡住了：
./labs/checkpoints/reset-to-02-end.sh`}</Code>
        <p style={{ fontSize: 30, color: '#5a5148', marginTop: 28, lineHeight: 1.55 }}>
          先確認第一幕的 demo 叢集拆掉了 ——<br />8 GB 記憶體同時跑兩個叢集會不夠
        </p>
      </div>
      <ul style={{ fontSize: 34, paddingLeft: 40, margin: 0, width: 640 }}>
        <Li gap={24}><Red>使用者</Red>：6 行開叢集、改 profile 變 HA</Li>
        <Li gap={24}><Red>破壞者</Red>：塞不該開放的欄位，看 apply 被拒</Li>
        <Li gap={24}><Red>平台工程師</Red>：改 RGD，演進你的 API</Li>
      </ul>
    </div>
    <p style={{ fontSize: 31, marginTop: 30, fontWeight: 700 }}>
      回到動手。管理叢集還是剛才那個 kind，這次在它上面多裝一層 kro。
    </p>
  </Light>
);

const a2s1Lines: RLine[] = [
  { t: 0.5, text: 'helm install kro ~/.summit-workshop/kro-0.9.3.tgz -n kro-system --create-namespace', kind: 'cmd' },
  { t: 1.6, text: 'NAME: kro\nSTATUS: deployed\nREVISION: 1' },
  { t: 3.4, text: 'kubectl apply -f rgd/workloadcluster-capd.yaml', kind: 'cmd' },
  { t: 4.4, text: 'resourcegraphdefinition.kro.run/workloadcluster created' },
  { t: 6.0, text: 'kubectl get rgd', kind: 'cmd' },
  { t: 7.0, text: 'NAME              APIVERSION   KIND              STATE    READY\nworkloadcluster   v1alpha1     WorkloadCluster   Active   True' },
  { t: 9.0, text: 'kubectl get crd workloadclusters.kro.run', kind: 'cmd' },
  { t: 10.2, text: 'workloadclusters.kro.run（Kubernetes 裡多了一個新的 API）', kind: 'ok' },
];
const A2S1Cmd: Page = () => (
  <StepCmd act="第二幕" step={1} total={7} title="安裝 kro、定義平台 API"
    cmd={`helm install kro ~/.summit-workshop/kro-0.9.3.tgz \\
  -n kro-system --create-namespace
kubectl apply -f rgd/workloadcluster-capd.yaml
kubectl get rgd -w   # 等 STATE 變 Active`}
    expect="RGD 轉 Active 後，叢集裡多了一個新的 API：WorkloadCluster" />
);
const A2S1Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 1 —— 參考輸出（會前錄製）" lines={a2s1Lines} />
);

const wHdr = 'NAME     STATE    READY   |  MACHINE                        PHASE          AGE';
const a2s2Lines: RLine[] = [
  { t: 0.5, text: 'kubectl apply -f - <<EOF', kind: 'cmd' },
  { t: 0.5, text: 'apiVersion: kro.run/v1alpha1\nkind: WorkloadCluster\nmetadata: {name: team-a}\nspec: {}\nEOF' },
  { t: 2.0, text: 'workloadcluster.kro.run/team-a created' },
  { t: 3.5, text: 'watch kubectl get workloadclusters,machines', kind: 'cmd' },
  { t: 4.5, kind: 'frame', text: wHdr + '\nteam-a   ACTIVE   False   |  team-a-control-plane-zwlvk     Pending        4s' },
  { t: 8.0, kind: 'frame', text: wHdr + '\nteam-a   ACTIVE   False   |  team-a-control-plane-zwlvk     Provisioning   31s\n                          |  team-a-md-0-9t7q5-jwwmd        Pending        6s' },
  { t: 12.0, kind: 'frame', text: wHdr + '\nteam-a   ACTIVE   False   |  team-a-control-plane-zwlvk     Provisioned    83s\n                          |  team-a-md-0-9t7q5-jwwmd        Pending        58s' },
  { t: 16.0, kind: 'frame', text: wHdr + '\nteam-a   ACTIVE   True    |  team-a-control-plane-zwlvk     Running        4m\n                          |  team-a-md-0-9t7q5-jwwmd        Running        3m35s' },
  { t: 18.5, text: '（spec: {} —— 所有欄位都有預設值；status 由底層自動匯總）', kind: 'ok' },
];
const A2S2Cmd: Page = () => (
  <StepCmd act="第二幕" step={2} total={7} title="六行，一個叢集"
    cmd={`cat <<EOF | kubectl apply -f -
apiVersion: kro.run/v1alpha1
kind: WorkloadCluster
metadata: {name: team-a}
spec: {}
EOF`}
    expect="約 4 分鐘後 get cluster 的 CONTROLPLANEREADY 轉 true；底層 CAPI 物件由 kro 代為建立" />
);
const A2S2Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 2 —— 參考輸出（會前錄製）" lines={a2s2Lines} />
);

const a2s3Lines: RLine[] = [
  { t: 0.5, text: "kubectl patch workloadcluster team-a --type merge -p '{\"spec\":{\"nodes\":2}}'", kind: 'cmd' },
  { t: 1.5, text: 'workloadcluster.kro.run/team-a patched' },
  { t: 3.0, text: 'watch kubectl get machines', kind: 'cmd' },
  { t: 4.0, kind: 'frame', text: mHdr + '\nteam-a-control-plane-zwlvk   Running        5m4s\nteam-a-md-0-9t7q5-jwwmd      Running        4m39s' },
  { t: 7.5, kind: 'frame', text: mHdr + '\nteam-a-control-plane-zwlvk   Running        5m24s\nteam-a-md-0-9t7q5-6drmh      Provisioning   20s\nteam-a-md-0-9t7q5-jwwmd      Running        4m59s' },
  { t: 11.0, kind: 'frame', text: mHdr + '\nteam-a-control-plane-zwlvk   Running        5m44s\nteam-a-md-0-9t7q5-6drmh      Running        80s\nteam-a-md-0-9t7q5-jwwmd      Running        5m19s' },
  { t: 13.0, text: '（高階 API 改一個數字，底層 MachineDeployment 跟著動）', kind: 'ok' },
];
const A2S3Cmd: Page = () => (
  <StepCmd act="第二幕" step={3} total={7} title="用平台使用者的方式擴容"
    cmd={`kubectl patch workloadcluster team-a \\
  --type merge -p '{"spec":{"nodes":2}}'
watch kubectl get machines`}
    expect="約 90 秒後 get machines 多一台 team-a-md-0 worker，Running" />
);
const A2S3Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 3 —— 參考輸出（會前錄製）" lines={a2s3Lines} />
);

const a2s4Lines: RLine[] = [
  { t: 0.5, text: 'kubectl apply -f - <<EOF', kind: 'cmd' },
  { t: 0.5, text: 'apiVersion: kro.run/v1alpha1\nkind: WorkloadCluster\nmetadata: {name: team-ha}\nspec: {profile: ha, nodes: 0}\nEOF' },
  { t: 2.0, text: 'workloadcluster.kro.run/team-ha created' },
  { t: 4.0, text: 'kubectl get kubeadmcontrolplane team-ha-control-plane', kind: 'cmd' },
  { t: 5.5, text: 'NAME                    CLUSTER   DESIRED   AGE\nteam-ha-control-plane   team-ha   3         17s', kind: 'ok' },
  { t: 8.0, text: 'kubectl delete workloadcluster team-ha   # 看到 3 就好，資源留給 team-a', kind: 'cmd' },
  { t: 9.0, text: 'workloadcluster.kro.run "team-ha" deleted' },
];
const A2S4Cmd: Page = () => (
  <StepCmd act="第二幕" step={4} total={7} title="高可用 —— 加一行"
    cmd={`# spec 加一行：profile: ha
kubectl get kubeadmcontrolplane team-ha-control-plane`}
    expect="kubeadmcontrolplane 的 DESIRED 顯示 3；使用者只寫了 profile: ha" />
);
const A2S4Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 4 —— 參考輸出（會前錄製）" lines={a2s4Lines} />
);

const a2s5Lines: RLine[] = [
  { t: 0.5, text: 'kubectl apply -f - <<EOF', kind: 'cmd' },
  { t: 0.5, text: 'apiVersion: kro.run/v1alpha1\nkind: WorkloadCluster\nmetadata: {name: bad}\nspec: {certSANs: [evil.example]}\nEOF' },
  { t: 2.5, text: 'Error from server (BadRequest): error when creating "STDIN":' },
  { t: 3.0, text: 'WorkloadCluster in version "v1alpha1" cannot be handled as a WorkloadCluster:' },
  { t: 3.5, text: 'strict decoding error: unknown field "spec.certSANs"' },
  { t: 6.0, text: '（schema 沒開放的欄位碰不到 —— 哪些鎖死，本身就是平台設計）', kind: 'ok' },
];
const A2S5Cmd: Page = () => (
  <StepCmd act="第二幕" step={5} total={7} title="改不該碰的欄位，會怎樣"
    cmd={`# 試著直接改憑證設定
spec: {certSANs: [evil.example]}`}
    expect="apply 被拒，錯誤是 unknown field；這個欄位不在 API 裡" />
);
const A2S5Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 5 —— 參考輸出（會前錄製）" lines={a2s5Lines} />
);

const a2s6Lines: RLine[] = [
  { t: 0.5, text: 'kubectl apply -f - <<EOF', kind: 'cmd' },
  { t: 0.5, text: 'apiVersion: kro.run/v1alpha1\nkind: WorkloadCluster\nmetadata: {name: team-a}\nspec:\n  nodes: 2\n  advanced:\n    kubeletExtraArgs: {v: "2"}\nEOF' },
  { t: 2.5, text: 'workloadcluster.kro.run/team-a configured' },
  { t: 4.5, text: 'kubectl get kcp team-a-control-plane -o jsonpath=\'{...kubeletExtraArgs}\'', kind: 'cmd' },
  { t: 6.0, text: '[{"name":"v","value":"2"}]', kind: 'ok' },
  { t: 9.0, text: '（進階設定原樣到達底層；同時注意 —— 控制平面開始滾動換機：', kind: 'ok' },
  { t: 9.5, text: '  改了 kubeadm 設定，Cluster API 就照換機哲學行動）', kind: 'ok' },
];
const A2S6Cmd: Page = () => (
  <StepCmd act="第二幕" step={6} total={7} title="但保留進階設定的入口"
    cmd={`spec:
  nodes: 2
  advanced:
    kubeletExtraArgs: {v: "2"}`}
    expect="kubeadmcontrolplane 的 kubeletExtraArgs 出現 v=2；控制平面接著滾動換機，這是改 kubeadm 設定的正常行為" />
);
const A2S6Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 6 —— 參考輸出（會前錄製）" lines={a2s6Lines} />
);

const cHdr = 'NAME     PHASE         |  MACHINE                        PHASE      AGE';
const a2s7Lines: RLine[] = [
  { t: 0.5, text: 'kubectl delete workloadcluster team-a', kind: 'cmd' },
  { t: 1.5, text: 'workloadcluster.kro.run "team-a" deleted' },
  { t: 3.0, text: 'watch kubectl get cluster,machines', kind: 'cmd' },
  { t: 4.0, kind: 'frame', text: cHdr + '\nteam-a   Provisioned   |  team-a-control-plane-zwlvk     Deleting   9m12s\n                     |  team-a-md-0-9t7q5-6drmh        Deleting   5m1s' },
  { t: 8.0, kind: 'frame', text: cHdr + '\nteam-a   Provisioned   |  team-a-control-plane-zwlvk     Deleting   9m33s' },
  { t: 11.5, kind: 'frame', text: 'No resources found in default namespace.' },
  { t: 13.5, text: '（七個 Cluster API 物件與所有 container 都已回收，沒有殘留）', kind: 'ok' },
];
const A2S7Cmd: Page = () => (
  <StepCmd act="第二幕" step={7} total={7} title="拆掉"
    cmd={`kubectl delete workloadcluster team-a
watch kubectl get cluster,machines`}
    expect="Cluster、Machine 依序消失，docker ps 不再有 team-a 的 container；順序由 kro 與 Cluster API 處理" />
);
const A2S7Replay: Page = () => (
  <ReplayPage world="lab" title="第二幕 · 步驟 7 —— 參考輸出（會前錄製）" lines={a2s7Lines} />
);

/* ── 15 第二幕回收 ───────────────────────────────────── */
const Act2Recap: Page = () => (
  <Light eyebrow="第二幕 · 你剛剛做了什麼" title="你在 K8s 裡加了一個新的 API">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>200 行變 6 行，少掉的部分是<Red>把第一幕的決定寫進 RGD</Red>：版本、CNI、控制平面數量、哪些欄位開放</Li>
      <Li>status、更新、刪除都照 K8s 原本的方式運作，使用者不需要知道底下有 Cluster API</Li>
      <Li>我們自己的私有雲用<Red>同一份 WorkloadCluster schema</Red>，只有 infrastructure provider 不同</Li>
      <Li>今天底下是 Docker container；實際平台底下是裸機（Tinkerbell）和虛擬機器（KubeVirt）</Li>
    </ul>
    <p style={{ fontSize: 38, marginTop: 40, fontWeight: 700 }}>
      兩幕裡機器壞了或設定改了，Cluster API 的做法都是換一台。container 換一台幾十秒，裸機呢？
    </p>
  </Light>
);

/* ── 16 demo② 過場 ───────────────────────────────────── */
const Demo2: Page = () => (
  <Dark eyebrow="DEMO ②" title="重灌一台節點，資料一個位元都不少" world="demo">
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={30}>HCI 節點上有分散式儲存（Ceph）—— 「換機哲學」最怕的就是它</Li>
      <Li gap={30}>現場刪掉一台 Machine → 自動重灌作業系統 → 重新入列</Li>
      <Li gap={30}>資料碟全程不動，Ceph <Red>原碟認領</Red></Li>
      <Li gap={30}>驗證：重灌前後的 <span style={{ fontFamily: mono }}>sha256</span> 與叢集 fsid <Red>完全一致</Red></Li>
    </ul>
    <p style={{ fontSize: 30, color: mutedDark, marginTop: 34 }}>對照：第一幕步驟 6 你刪過一台 Machine，底下是 container。這次底下是裸機。</p>
  </Dark>
);

/* ── 16b demo② 指令與錄製 ────────────────────────────── */
const D2Cmd: Page = () => (
  <StepCmd act="DEMO ② · 重灌保資料" step={1} total={1} title="刪掉一台正在承載 Ceph 的節點"
    cmd={`# 先記下資料檔的 sha256 與 Ceph fsid
sha256sum /data/evidence.bin
ceph fsid

kubectl delete machines.cluster.x-k8s.io \\
  <一台 mgmt 的 Machine>
# 之後：等 workflow 出現（PENDING），
# ssh 進去 reboot —— 沒有 BMC 沒人幫它重開`}
    expect="Machine 轉 Deleting，drain 受 Ceph PDB 限制；新 Machine 重灌只寫 OS 碟；Ceph 回到 HEALTH_OK、osd 3 up；fsid 與 sha256 前後一致" />
);

const d2wHdr = 'MACHINE         PHASE          |  WORKFLOW 動作     |  ceph';
const d2Lines: RLine[] = [
  { t: 0.5, text: 'sha256sum /data/evidence.bin ; ceph fsid', kind: 'cmd' },
  { t: 1.6, text: 'c1043a6162484b93396dbf2e01a2591b94bf34ef50a28c87c0a58b2b5b7ee084  /data/evidence.bin\n2e0e652d-3c57-48f8-98cc-23a958b9a66e' },
  { t: 3.4, text: 'kubectl delete machines.cluster.x-k8s.io mgmt-cp-65blj   # 它跑著 osd.1', kind: 'cmd' },
  { t: 4.5, text: 'machine.cluster.x-k8s.io "mgmt-cp-65blj" deleted' },
  { t: 6.5, text: `${d2wHdr}\nmgmt-cp-65blj   Deleting       |  drain 中          |  HEALTH_WARN · osd: 2 up, 3 in（noout —— PDB 看守，等它回來、不搬資料）`, kind: 'frame' },
  { t: 10.0, text: `${d2wHdr}\nmgmt-cp-qh8fm   Provisioning   |  PENDING           |  HEALTH_WARN\n（新 Machine 已生成 —— 這裡 ssh 進去 reboot，機器 PXE 進 HookOS 接單）`, kind: 'frame' },
  { t: 13.5, text: `${d2wHdr}\nmgmt-cp-qh8fm   Provisioning   |  write-image       |  HEALTH_WARN · osd: 2 up\n（只重寫 OS 碟 —— 資料碟 by-path 鎖定，一個位元都不碰）`, kind: 'frame' },
  { t: 17.0, text: `${d2wHdr}\nmgmt-cp-qh8fm   Provisioned    |  SUCCESS · reboot  |  HEALTH_WARN · osd: 2 up`, kind: 'frame' },
  { t: 20.0, text: `${d2wHdr}\nmgmt-cp-qh8fm   Running        |  SUCCESS           |  HEALTH_OK · osd: 3 up, 3 in（原碟認領 —— 實測 +13 分鐘）`, kind: 'frame' },
  { t: 22.5, text: './verify-after.sh', kind: 'cmd' },
  { t: 23.6, text: 'fsid-MATCH: 2e0e652d-3c57-48f8-98cc-23a958b9a66e\nsha256-MATCH: c1043a6162484b93396dbf2e01a2591b94bf34ef50a28c87c0a58b2b5b7ee084' },
  { t: 25.5, text: '重灌了一台 Ceph 節點 —— 資料一個位元都沒少', kind: 'ok' },
];
const D2Replay: Page = () => (
  <ReplayPage world="demo" title="DEMO ② —— 換機哲學碰上分散式儲存（實錄）" lines={d2Lines} />
);
const RawD2: Page = () => <RawLog k="d2" title="DEMO ② · 重灌保資料" />;

/* ── 17 demo③ 過場 ───────────────────────────────────── */
const Demo3: Page = () => (
  <Dark eyebrow="DEMO ③" title="升級 Kubernetes，機器不用重開機" world="demo">
    <ul style={{ fontSize: 40, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={30}>裸機的痛：照 Pod 哲學「換機升級」，每台要重灌 + 資料重建</Li>
      <Li gap={30}>Cluster API 的 in-place update：升級<Red>交給外掛</Red>在節點上原地執行</Li>
      <Li gap={30}>現場改一個版本欄位 → kubelet 原地換版</Li>
      <Li gap={30}>驗證：Machine uid 不變、<span style={{ fontFamily: mono }}>uptime</span> 不歸零</Li>
    </ul>
    <p style={{ fontSize: 30, color: mutedDark, marginTop: 34 }}>對照：第二幕步驟 6 改設定時控制平面滾動換機。裸機上這樣做太貴，所以要原地升級。</p>
  </Dark>
);

/* ── 17b demo③ 指令與錄製 ────────────────────────────── */
const D3Cmd: Page = () => (
  <StepCmd act="DEMO ③ · 免重開升級" step={1} total={1} title="升級 Kubernetes，只改一個欄位"
    cmd={`kubectl patch kubeadmcontrolplane mgmt-cp \\
  --type=merge \\
  -p '{"spec":{"version":"v1.34.8"}}'
# 之後 —— 什麼都不用做。
# KCP 逐台編排，升級外掛原地執行
# 裸機前提：maxSurge=0（機房沒有多的機器可以先開）`}
    expect="三台 Machine 依序 Updating 再回 Running；升級後 Machine uid 不變、uptime 不歸零、kubelet 顯示新版" />
);

const d3mHdr = 'MACHINE         NODE          READY   PHASE      VERSION   |  NODE          VERSION';
const d3Lines: RLine[] = [
  { t: 0.5, text: "kubectl patch kubeadmcontrolplane mgmt-cp --type=merge -p '{\"spec\":{\"version\":\"v1.34.7\"}}'", kind: 'cmd' },
  { t: 1.5, text: 'kubeadmcontrolplane.controlplane.cluster.x-k8s.io/mgmt-cp patched' },
  { t: 3.0, text: `${d3mHdr}\nmgmt-cp-65blj   poc3-mgmt-3   True    Running    v1.34.6   |  poc3-mgmt-3   v1.34.6\nmgmt-cp-6qd5x   poc3-mgmt-2   True    Running    v1.34.6   |  poc3-mgmt-2   v1.34.1\nmgmt-cp-mmdqb   poc3-mgmt-1   True    Running    v1.34.6   |  poc3-mgmt-1   v1.34.6`, kind: 'frame' },
  { t: 6.5, text: `${d3mHdr}\nmgmt-cp-65blj   poc3-mgmt-3   True    Running    v1.34.6   |  poc3-mgmt-3   v1.34.6\nmgmt-cp-6qd5x   poc3-mgmt-2   False   Updating   v1.34.7   |  poc3-mgmt-2   v1.34.1  ←落後最多的先動\nmgmt-cp-mmdqb   poc3-mgmt-1   True    Running    v1.34.6   |  poc3-mgmt-1   v1.34.6`, kind: 'frame' },
  { t: 10.0, text: `${d3mHdr}\nmgmt-cp-65blj   poc3-mgmt-3   True    Running    v1.34.6   |  poc3-mgmt-3   v1.34.6\nmgmt-cp-6qd5x   poc3-mgmt-2   True    Running    v1.34.7   |  poc3-mgmt-2   v1.34.7  （+440 秒）\nmgmt-cp-mmdqb   poc3-mgmt-1   True    Running    v1.34.6   |  poc3-mgmt-1   v1.34.6`, kind: 'frame' },
  { t: 13.0, text: `${d3mHdr}\nmgmt-cp-65blj   poc3-mgmt-3   False   Updating   v1.34.7   |  poc3-mgmt-3   v1.34.6\nmgmt-cp-6qd5x   poc3-mgmt-2   True    Running    v1.34.7   |  poc3-mgmt-2   v1.34.7\nmgmt-cp-mmdqb   poc3-mgmt-1   True    Running    v1.34.6   |  poc3-mgmt-1   v1.34.6`, kind: 'frame' },
  { t: 16.5, text: `${d3mHdr}\nmgmt-cp-65blj   poc3-mgmt-3   True    Running    v1.34.7   |  poc3-mgmt-3   v1.34.7\nmgmt-cp-6qd5x   poc3-mgmt-2   True    Running    v1.34.7   |  poc3-mgmt-2   v1.34.7\nmgmt-cp-mmdqb   poc3-mgmt-1   False   Updating   v1.34.7   |  poc3-mgmt-1   v1.34.7  （最後一台）`, kind: 'frame' },
  { t: 20.0, text: 'kubectl get machines -o custom-columns=NAME:.metadata.name,UID:.metadata.uid', kind: 'cmd' },
  { t: 21.2, text: 'mgmt-cp-65blj   3a804c6d-14d5-459d-9749-bc368d1140ea   ← 與升級前逐字相同\nmgmt-cp-6qd5x   55c32675-0b8b-4203-8203-0d8268ebe393\nmgmt-cp-mmdqb   86110dfb-1cdb-4b42-adc1-a88273cc6138' },
  { t: 23.0, text: 'ssh mgmt-2 "uptime -s; kubelet --version"', kind: 'cmd' },
  { t: 24.2, text: '2026-08-18 06:40:36   ← 開機時間不變，全程沒重開機\nKubernetes v1.34.7' },
  { t: 26.0, text: '三台原地升級完成（實測 30 分鐘）—— uid 不變、uptime 不歸零', kind: 'ok' },
];
const D3Replay: Page = () => (
  <ReplayPage world="demo" title="DEMO ③ · 控制面視角 —— 一個欄位，三台逐台原地升級" lines={d3Lines} />
);

const d3jLines: RLine[] = [
  { t: 0.5, text: '# 升級外掛在節點上建的 Job（nsenter 進主機執行）—— mgmt-2 實錄', kind: 'cmd' },
  { t: 2.0, text: '+ curl -fL -o /opt/extensions/kubernetes-v1.34.7-x86-64.raw http://172.16.90.4:7173/...\n100  107M  100  107M   33.8M/s  0:00:03' },
  { t: 4.5, text: "+ ln -sf /opt/extensions/kubernetes-v1.34.7-x86-64.raw /etc/extensions/kubernetes.raw\n+ systemd-sysext refresh\nUsing extensions 'containerd-flatcar.raw', 'docker-flatcar.raw', 'kubernetes.raw'.\nMerged extensions into '/usr'." },
  { t: 7.5, text: '+ kubeadm version -o short\nv1.34.7   ← 新版工具鏈已疊上，一次重開機都沒有' },
  { t: 10.0, text: '+ kubeadm upgrade node\n[upgrade/staticpods] Preparing for "etcd" upgrade\n[upgrade/staticpods] Renewing etcd-server certificate\n[upgrade/staticpods] Component "etcd" upgraded successfully!' },
  { t: 13.5, text: '[upgrade/staticpods] Preparing for "kube-apiserver" upgrade\n[upgrade/control-plane] The control plane instance for this node was successfully upgraded!\n[upgrade/kubelet-config] The kubelet configuration for this node was successfully upgraded!' },
  { t: 16.5, text: '+ systemctl restart kubelet\nupgrade-script-done' },
  { t: 18.5, text: '換的是 /usr 上的「疊加層」—— 主機、磁碟、記憶體裡的一切原地不動', kind: 'ok' },
];
const D3NodeReplay: Page = () => (
  <ReplayPage world="demo" title="DEMO ③ · 節點內部視角 —— sysext 換版 + kubeadm 升級實錄" lines={d3jLines} />
);

/* ── day-0 章節收束：自舉與角色 ──────────────────────── */
const BootstrapFull: Page = () => (
  <Dark eyebrow="DAY-0 · 收束" title="起始機做了什麼、沒做什麼">
    <ul style={{ fontSize: 38, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={28}>起始機沒有建叢集，它只放了宣告；<Red>裝機、kubeadm、加入叢集都是機器自己跑完的</Red></Li>
      <Li gap={28}>起始機可以是一台筆電：接上機房網段、跑完九步、pivot、關機。管理叢集不依賴它</Li>
      <Li gap={28}>move 搬的是 Cluster API 的物件（Cluster、Machine、Hardware），不是叢集本身；apiserver、etcd、workload 全程沒動</Li>
      <Li gap={28}>move 不只用在 pivot：管理叢集要重建或搬遷時，<Red>先把物件搬到一個臨時叢集接手，修好再搬回來</Red></Li>
    </ul>
  </Dark>
);

const RoleKnob = ({ q, a, detail }: { q: string; a: string; detail: string }) => (
  <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: '28px 32px' }}>
    <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>{q}</div>
    <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 14 }}>{a}</div>
    <div style={{ fontSize: 26, color: '#5a5148', lineHeight: 1.45 }}>{detail}</div>
  </div>
);

const RoleDecision: Page = () => (
  <Light eyebrow="DAY-0 · 收束" title="一台機器的角色，是怎麼決定的">
    <div style={{ display: 'flex', gap: 24, marginBottom: 30 }}>
      <RoleKnob q="哪一台？" a="標籤" detail="Hardware 上貼標籤，Machine template 用 hardwareAffinity 挑有對應標籤的機器。第 8 步的 day0/role: mgmt 就是這個" />
      <RoleKnob q="什麼角色？" a="誰建的 Machine" detail="KubeadmControlPlane 建的 Machine 是控制平面，MachineDeployment 建的是 worker。第一幕的 demo-md-0 就是後者" />
      <RoleKnob q="幾台？" a="replicas" detail="擴容、縮容、HA 都是改這個數字。kro 的 profile: ha 展開後也是改它" />
    </div>
    <ul style={{ fontSize: 31, paddingLeft: 44, margin: 0 }}>
      <Li gap={18}>上架是另一層：RuleSet 只管誰能進池、裝哪個 OS。機器在被認領之前沒有角色</Li>
      <Li gap={18}>這次的管理叢集只有控制平面、沒有 worker，<Red>拔掉 taint 讓平台元件直接跑在上面</Red>；worker 留給 工作負載叢集</Li>
    </ul>
  </Light>
);

/* ── 池策略（Roadmap 前橋接頁）─────────────────────────── */
const PoolPolicy: Page = () => (
  <Light eyebrow="DAY-0 · 收束" title="資源池的兩種待命方式">
    <div style={{ display: 'flex', gap: 24, marginBottom: 26 }}>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: '26px 30px' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 14 }}>HookOS 待命（上游預設）</div>
        <ul style={{ fontSize: 27, paddingLeft: 34, margin: 0, lineHeight: 1.55 }}>
          <li>認領那一刻才裝，<b>一次到位</b>（裝的就是最後要跑的系統）</li>
          <li>不需要裝後收尾狀態機</li>
          <li>代價：待命機在記憶體小系統裡 —— 不可 SSH、斷電後要靠裝機服務重新拉起</li>
        </ul>
      </div>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e8e2df', borderRadius: 'var(--osd-radius)', padding: '26px 30px' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 14 }}>先裝基礎 OS（今天的示範）</div>
        <ul style={{ fontSize: 27, paddingLeft: 34, margin: 0, lineHeight: 1.55 }}>
          <li>池裡是活的機器：可 SSH、可燒機、可更新韌體</li>
          <li>理論上可以直接 join 進現有叢集（今天沒示範）</li>
          <li>代價：被認領去開新叢集時要<b>再重灌一次</b></li>
        </ul>
      </div>
    </div>
    <p style={{ fontSize: 33, fontWeight: 700, margin: 0 }}>
      沒有標準答案，這是<span style={{ color: 'var(--osd-accent)' }}>政策</span>，可以按機型混用。今天是人在決定；讓它變成可宣告的設定，是最後 Roadmap 的一項。
    </p>
  </Light>
);

/* ── 21 前沿稅 ───────────────────────────────────────── */

const Ecosystem: Page = () => (
  <Dark eyebrow="這條路換到什麼" title="都是 K8s 物件之後，現有工具直接能用">
    <ul style={{ fontSize: 38, paddingLeft: 46, margin: 0, color: '#f0f0f0' }}>
      <Li gap={26}><Red>GitOps</Red>：機房狀態全進 Git —— 叢集、機器、上架規則可版控、可稽核、可重建</Li>
      <Li gap={26}><Red>RBAC</Red>：「誰能開機器、誰能刪叢集」—— 用管 Pod 的同一套權限模型管到裸機</Li>
      <Li gap={26}><Red>Policy</Red>：「沒貼標籤的機器不准進池」—— 一條 admission 規則的事</Li>
      <Li gap={26}><Red>觀測</Red>：機器的生命週期就是 events 與 metrics —— 現有監控告警直接沿用</Li>
    </ul>
    <p style={{ fontSize: 34, marginTop: 38, fontWeight: 700, color: '#f0f0f0' }}>
      之後團隊每多會一個 K8s 工具，基礎設施就多一個能用的工具。
    </p>
  </Dark>
);

/* ── 22 Roadmap ──────────────────────────────────────── */
const Roadmap: Page = () => (
  <Light eyebrow="下一步" title="還缺一個 controller">
    <ul style={{ fontSize: 'var(--osd-size-body)', paddingLeft: 46, margin: 0 }}>
      <Li>今天有三件事靠腳本或人手補：上架裝完關 allowPXE、補齊 Hardware 欄位讓 CAPT 能認領、決定角色貼標籤</Li>
      <Li>要寫一個 <Red>enrollment controller</Red> 接手，管機器從插電到退役；待命方式、貼標籤規則用 CRD 宣告</Li>
      <Li>這幾個月踩到的六十多個坑，整理成它的需求清單</Li>
      <Li>會開源，歡迎一起做</Li>
    </ul>
  </Light>
);

/* ── 23b 開源致謝 ────────────────────────────────────── */
const CreditCol = ({ title, items }: { title: string; items: string[] }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--osd-accent)', marginBottom: 14 }}>{title}</div>
    <div style={{ fontFamily: mono, fontSize: 24, lineHeight: 1.75, color: '#3a3a3a' }}>
      {items.map((i) => <div key={i}>{i}</div>)}
    </div>
  </div>
);

const OpenSourceCredits: Page = () => (
  <Light eyebrow="致謝" title="這場工作坊，全部由開源軟體組成">
    <div style={{ display: 'flex', gap: 40, marginTop: 4 }}>
      <CreditCol title="平台核心" items={[
        'Kubernetes / kubeadm', 'Cluster API（CAPD/CAPT/CAPK）', 'Tinkerbell + HookOS',
        'Flatcar Container Linux', 'kro', 'kube-vip',
      ]} />
      <CreditCol title="儲存・網路・虛擬化" items={[
        'Rook + Ceph', 'Cilium / kindnet', 'KubeVirt + CDI',
        'containerd', 'etcd / CoreDNS', 'dnsmasq',
      ]} />
      <CreditCol title="工具鏈" items={[
        'kind / k3s', 'clusterctl / kubectl', 'Helm',
        'Butane / Ignition', 'systemd-sysext', 'Docker',
      ]} />
      <CreditCol title="簡報本身" items={[
        'open-slide（1weiho）', 'LINE Seed TW（LY Corp.）', 'Noto Sans TC（Google）',
        'Maple Mono（subframe7536）', '—— 字體皆 SIL OFL',
      ]} />
    </div>
    <p style={{ fontSize: 30, marginTop: 40, fontWeight: 700 }}>
      謝謝每一位維護者。今天示範的每一層都是<span style={{ color: 'var(--osd-accent)' }}>開源社群的成果</span>，我們只是把它們接起來。
    </p>
  </Light>
);

/* ── 24 封底 ─────────────────────────────────────────── */
const Thanks: Page = () => (
  <div style={{ ...fill, background: darkBg, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 140, fontWeight: 800, margin: 0 }}>謝謝</h1>
    <p style={{ fontSize: 30, color: mutedDark, marginTop: 60 }}>
      謝禹沆（Josh） · 寬橋 · KubeSummit 2026
    </p>
    <p style={{ fontFamily: mono, fontSize: 30, color: '#7ee787', marginTop: 48 }}>
      github.com/jtr860830/k8s-summit-2026-workshop
    </p>
    <p style={{ fontSize: 27, color: mutedDark, marginTop: 18 }}>
      會後在 Q&A 區或寬橋攤位，都找得到我 —— 歡迎來交流。
    </p>
    <div style={{ marginTop: 84 }}><Logo height={52} /></div>
  </div>
);

export const meta: SlideMeta = {
  title: '用 Kubernetes 打造自動化私有雲基礎設施',
  theme: 'brobridge',
  createdAt: '2026-08-24T06:16:30.606Z',
};

export default [
  Cover, Agenda,
  Step0Cmd, Step0Replay, RawS0, Step1Cmd, Step1Replay, RawS1,
  Thesis, Claim, WhiteBox, Architecture, Glossary, Principles,
  TinkerbellStack, EnrollFlow, HowPxe,
  D0Prereq, D0Intro, Demo1,
  D0S1Cmd, D0S1Replay, RawD0S1, D0S2Cmd, D0S2Replay, RawD0S2, D0S3Cmd, D0S3Replay, RawD0S3,
  D0S4Cmd, D0S4Replay, RawD0S4, D0S5Cmd, D0S5Replay, RawD0S5, D0S6Cmd, D0S6Replay, RawD0S6,
  Act1Guide, Step2Cmd, Step2Replay, RawS2, Step3Cmd, Step3Replay, RawS3, Step4Cmd, Step4Replay, RawS4, Step5Cmd, Step5Replay, RawS5, Step6Cmd, Step6Replay, RawS6, Step7Cmd, Step7Replay, RawS7, Act1Recap,
  BackToDay0, D0S7Cmd, D0S7Replay, RawD0S7, D0S8Cmd, D0S8Replay, RawD0S8, D0S9Cmd, D0S9Replay, RawD0S9, BootstrapFull, RoleDecision, PoolPolicy,
  Act2Intro, FourLayers, Act2Guide, A2S1Cmd, A2S1Replay, RawA2S1, A2S2Cmd, A2S2Replay, RawA2S2, A2S3Cmd, A2S3Replay, RawA2S3, A2S4Cmd, A2S4Replay, RawA2S4, A2S5Cmd, A2S5Replay, RawA2S5, A2S6Cmd, A2S6Replay, RawA2S6, A2S7Cmd, A2S7Replay, RawA2S7, Act2Recap,
  Lineage,
  Demo2, D2Cmd, D2Replay, RawD2, Demo3, D3Cmd, D3Replay, D3NodeReplay, RawD3,
  Ecosystem, Roadmap, OpenSourceCredits, Thanks,
] satisfies Page[];

// 講者備忘：與上方頁面陣列同索引（簡報者模式按 P）
const R = N.RAW_NOTE;
export const notes: string[] = [
  N.nCover, N.nAgenda,
  N.nStep0, N.nStep0, R, N.nStep1, N.nStep1, R,
  N.nThesis, N.nClaim, N.nWhiteBox, N.nArchitecture, N.nGlossary, N.nPrinciples,
  N.nTinkerbellStack, N.nEnrollFlow, N.nHowPxe,
  N.nD0Prereq, N.nD0Intro, N.nDemo1,
  N.nD0S1, N.nD0S1, R, N.nD0S2, N.nD0S2, R, N.nD0S3, N.nD0S3, R,
  N.nD0S4, N.nD0S4, R, N.nD0S5, N.nD0S5, R, N.nD0S6, N.nD0S6, R,
  N.nAct1Guide, N.nStep2, N.nStep2, R, N.nStep3, N.nStep3, R, N.nStep4, N.nStep4, R, N.nStep5, N.nStep5, R, N.nStep6, N.nStep6, R, N.nStep7, N.nStep7, R, N.nAct1Recap,
  N.nBackToDay0, N.nD0S7, N.nD0S7, R, N.nD0S8, N.nD0S8, R, N.nD0S9, N.nD0S9, R, N.nBootstrapFull, N.nRoleDecision, N.nPoolPolicy,
  N.nAct2Intro, N.nFourLayers, N.nAct2Guide, N.nA2S1, N.nA2S1, R, N.nA2S2, N.nA2S2, R, N.nA2S3, N.nA2S3, R, N.nA2S4, N.nA2S4, R, N.nA2S5, N.nA2S5, R, N.nA2S6, N.nA2S6, R, N.nA2S7, N.nA2S7, R, N.nAct2Recap,
  N.nLineage,
  N.nDemo2, N.nD2Cmd, N.nD2Replay, R, N.nDemo3, N.nD3Cmd, N.nD3Replay, N.nD3NodeReplay, R,
  N.nEcosystem, N.nRoadmap, N.nCredits, N.nThanks,
];
