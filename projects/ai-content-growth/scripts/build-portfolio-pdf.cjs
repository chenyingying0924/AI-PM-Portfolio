const { writeFileSync, readFileSync, mkdirSync } = require('node:fs');
const { existsSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { pathToFileURL } = require('node:url');

const RUNTIME_NODE_MODULES =
  process.env.RUNTIME_NODE_MODULES ||
  '/Users/chenyingying/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';

let playwright;
try {
  playwright = require('playwright');
} catch (err) {
  playwright = require(join(RUNTIME_NODE_MODULES, 'playwright'));
}

const OUT_DIR = resolve(__dirname, '..', 'portfolio');
const SOURCE_FILE = join(OUT_DIR, 'source.html');
const PDF_FILE = join(OUT_DIR, 'ai-overseas-content-agent.pdf');

const SYSTEM_CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].find(existsSync);

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1280px; }
body {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #152521;
  background: #eef1ef;
}
.slide {
  position: relative;
  width: 1280px;
  height: 720px;
  background: #fbfcfa;
  overflow: hidden;
  padding: 30px 46px 26px;
  display: flex;
  flex-direction: column;
  page-break-after: always;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  margin-bottom: 16px;
}
.kicker {
  font-size: 11px;
  letter-spacing: .18em;
  color: #0d7c6b;
  font-weight: 700;
}
.brand {
  font-size: 10px;
  color: #7b8b85;
}
.title-row { margin-bottom: 14px; }
h1 {
  font-size: 24px;
  line-height: 1.22;
  font-weight: 800;
  letter-spacing: 0;
}
.subtitle {
  margin-top: 5px;
  font-size: 12px;
  color: #5d6f68;
  line-height: 1.5;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-height: 0;
}
footer {
  display: flex;
  justify-content: space-between;
  color: #8a9892;
  font-size: 9.5px;
  margin-top: 12px;
  border-top: 1px solid #e4eae7;
  padding-top: 8px;
}
.card {
  background: #ffffff;
  border: 1px solid #dde5e1;
  border-radius: 8px;
  padding: 11px 13px;
  box-shadow: 0 1px 2px rgba(16, 35, 31, .05);
}
.card h3 {
  font-size: 12.5px;
  margin-bottom: 5px;
  color: #0d5146;
  font-weight: 700;
}
.card p, .card li {
  font-size: 10.8px;
  line-height: 1.42;
  color: #42534d;
}
.card ul { list-style: none; }
.card li { padding-left: 10px; position: relative; margin-top: 3px; }
.card li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #0d7c6b;
}
.tone-teal { background: #e9f5f1; border-color: #bfe0d7; }
.tone-amber { background: #fdf3e3; border-color: #eed9ad; }
.tone-coral { background: #fceeea; border-color: #f0cdc3; }
.tone-ink { background: #10231f; color: #f4f1e8; }
.tone-ink h3 { color: #e9c46a; }
.tone-ink p, .tone-ink li { color: #d8e2dc; }
.tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
  background: #e9f5f1;
  color: #0d7c6b;
  white-space: nowrap;
}
.tag.amber { background: #fdf3e3; color: #a56508; }
.tag.coral { background: #fceeea; color: #b54b35; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 11px; }
.hint {
  font-size: 10px;
  color: #6d7e77;
  background: #f0f5f2;
  border: 1px dashed #c7d5cf;
  border-radius: 8px;
  padding: 7px 10px;
}
.shot-frame {
  border: 1px solid rgba(16, 35, 31, .12);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  line-height: 0;
}
.shot-frame img {
  width: 100%;
  max-height: 176px;
  object-fit: cover;
  object-position: top;
}
.shot-caption {
  font-size: 9px;
  line-height: 1.3;
  color: #5d6f68;
  background: #f4f7f5;
  border-top: 1px solid rgba(16, 35, 31, .08);
  padding: 5px 9px;
}
.workflow-shots {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.workflow-shots .shot-frame img {
  max-height: 92px;
}
.workflow-shots .shot-caption {
  text-align: center;
  font-size: 8.5px;
}
.flow-step {
  flex: 1;
  background: #ffffff;
  border: 1px solid #dde5e1;
  border-radius: 8px;
  padding: 9px 10px;
}
.flow-step .num {
  font-size: 9.5px;
  font-weight: 800;
  color: #0d7c6b;
  margin-bottom: 3px;
}
.flow-step .ft {
  font-size: 11.5px;
  font-weight: 700;
  color: #152521;
  margin-bottom: 3px;
}
.flow-step .fd {
  font-size: 9.6px;
  line-height: 1.35;
  color: #5d6f68;
}
.flow-row { display: flex; gap: 6px; align-items: stretch; }
.flow-arrow {
  align-self: center;
  color: #0d7c6b;
  font-size: 15px;
  font-weight: 800;
}
.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.8px;
  line-height: 1.32;
}
.mini-table th, .mini-table td {
  border: 1px solid #d9e2dd;
  padding: 6px 7px;
  text-align: left;
  vertical-align: top;
  color: #33443e;
}
.mini-table th {
  background: #e9f5f1;
  color: #0d5146;
  font-weight: 700;
  white-space: nowrap;
}
.mini-table .hl { background: #fdf3e3; font-weight: 700; color: #8a5200; }
.opp-row {
  display: grid;
  grid-template-columns: 1.15fr 1.25fr 1.6fr;
  gap: 8px;
  align-items: stretch;
}
.opp-row .cell {
  background: #fff;
  border: 1px solid #dde5e1;
  border-radius: 8px;
  padding: 8px 10px;
}
.opp-row .cell b {
  display: block;
  font-size: 9.8px;
  color: #7b8b85;
  margin-bottom: 3px;
}
.opp-row .cell p { font-size: 10.4px; line-height: 1.4; color: #33443e; }
.opp-row .cell.opp { background: #e9f5f1; border-color: #bfe0d7; }
.opp-row .cell.opp p { color: #0d5146; font-weight: 600; }
.bar-row { display: grid; grid-template-columns: 92px 1fr 74px; gap: 8px; align-items: center; }
.bar-row .label { font-size: 9.8px; color: #42534d; font-weight: 700; }
.bar-track { height: 12px; background: #e9efec; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; background: #0d7c6b; }
.bar-fill.amber { background: #e09a2f; }
.bar-val { font-size: 9.8px; color: #152521; font-weight: 700; text-align: right; }
.cover {
  background: #10231f;
  color: #f4f1e8;
  padding: 0;
}
.cover-inner {
  width: 1280px;
  height: 720px;
  display: grid;
  grid-template-columns: 1.25fr .75fr;
  align-items: center;
  gap: 48px;
  padding: 62px 72px;
}
.cover-kicker {
  font-size: 12px;
  letter-spacing: .3em;
  color: #e9c46a;
  font-weight: 700;
  margin-bottom: 18px;
}
.cover-title {
  font-size: 50px;
  line-height: 1.12;
  font-weight: 900;
  letter-spacing: 0;
}
.cover-title-sub {
  font-size: 38px;
  line-height: 1.15;
  font-weight: 800;
  color: #e9c46a;
  margin-top: 6px;
  letter-spacing: 0;
}
.cover-desc {
  margin-top: 22px;
  font-size: 14px;
  line-height: 1.65;
  color: #c8d5cf;
  max-width: 620px;
}
.cover-tags { margin-top: 26px; display: flex; gap: 8px; flex-wrap: wrap; }
.cover-tags span {
  border: 1px solid #3f554e;
  border-radius: 999px;
  padding: 6px 13px;
  font-size: 10.5px;
  color: #dce6e1;
}
.cover-right {
  background: #17322c;
  border: 1px solid #315048;
  border-radius: 10px;
  padding: 30px 26px;
}
.cover-flow { display: flex; flex-direction: column; gap: 10px; }
.cover-flow > div:not(.cover-base) {
  background: #f4f1e8;
  color: #10231f;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}
.cover-flow > i {
  font-style: normal;
  text-align: center;
  color: #e9c46a;
  font-size: 15px;
}
.cover-base {
  border: 1px dashed #e9c46a;
  color: #e9c46a;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  margin-top: 4px;
}
.hypothesis {
  background: #10231f;
  color: #f4f1e8;
  border-radius: 8px;
  padding: 13px 18px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
.hypothesis span {
  color: #e9c46a;
}
.persona-grid {
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 11px;
  flex: 1;
  min-height: 0;
}
.journey {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.journey .j-step {
  flex: 1;
  background: #fff;
  border: 1px solid #dde5e1;
  border-radius: 8px;
  padding: 7px 8px;
}
.journey .j-step b {
  display: block;
  font-size: 9.8px;
  color: #0d5146;
}
.journey .j-step p { font-size: 8.8px; color: #5d6f68; margin-top: 2px; line-height: 1.3; }
.score-card .score-track {
  height: 9px;
  background: #e9efec;
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0 5px;
}
.score-card .score-fill { height: 100%; width: 42%; background: #0d7c6b; border-radius: 999px; }
.arch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
  flex: 1;
}
.arch .base {
  grid-column: 1 / 3;
  background: #10231f;
  color: #f4f1e8;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
}
.arch .base b { color: #e9c46a; font-size: 12px; }
.arch .base p { color: #c8d5cf; font-size: 9.8px; margin-top: 3px; }
.prompt-box {
  background: #10231f;
  color: #e6efe9;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 9.2px;
  line-height: 1.55;
  white-space: pre-wrap;
}
.prompt-box b { color: #e9c46a; }
.check-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; }
.check-card {
  background: #fff;
  border: 1px solid #dde5e1;
  border-radius: 8px;
  padding: 10px 12px;
}
.check-card h3 { font-size: 12px; color: #0d5146; margin-bottom: 4px; }
.check-card p { font-size: 10px; line-height: 1.4; color: #42534d; }
.code-line { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9.2px; }
.metric-col { display: flex; flex-direction: column; gap: 8px; }
`;

function slide({ kicker, title, subtitle, body, page }) {
  return `
<section class="slide">
  <header class="top">
    <div class="kicker">${kicker}</div>
    <div class="brand">AI出海内容增长助手 Agent · AI PM Portfolio</div>
  </header>
  <div class="title-row">
    <h1>${title}</h1>
    ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
  </div>
  <div class="content">${body}</div>
  <footer>
    <span>AI出海内容增长助手 Agent · MVP作品集</span>
    <span>${String(page).padStart(2, '0')} / 20</span>
  </footer>
</section>`;
}

const cover = `
<section class="slide cover">
  <div class="cover-inner">
    <div>
      <div class="cover-kicker">AI PRODUCT PORTFOLIO</div>
      <h1 class="cover-title">AI出海内容增长助手</h1>
      <h2 class="cover-title-sub">Agent</h2>
      <p class="cover-desc">把爆款经验变成可复用的品牌内容资产，验证AI能否帮助出海品牌提升海外社媒内容生产效率。</p>
      <div class="cover-tags">
        <span>需求分析</span><span>竞品研究</span><span>产品设计</span><span>AI应用</span><span>MVP验证</span>
      </div>
    </div>
    <div class="cover-right">
      <div class="cover-flow">
        <div>爆款内容拆解</div>
        <i>↓</i>
        <div>AI内容重写</div>
        <i>↓</i>
        <div>内容质量评估</div>
        <div class="cover-base">品牌知识库 · 全流程底座</div>
      </div>
    </div>
  </div>
</section>`;

const slides = [];

slides.push({
  html: cover,
  cls: 'cover',
});

slides.push({
  kicker: '01 · PROJECT OVERVIEW',
  title: '项目概览',
  subtitle: 'AI Native MVP：不追求商业级SaaS，只验证一个核心增长假设。',
  body: `
    <div class="hypothesis">核心假设：<span>AI能否帮助出海品牌提升海外社媒内容生产效率</span></div>
    <div class="grid3">
      <div class="card">
        <h3>背景问题</h3>
        <ul>
          <li>多语言内容产能不足，市场覆盖慢</li>
          <li>本地化停留在翻译，缺少文化语境</li>
          <li>爆款经验难沉淀，每次创作从零开始</li>
          <li>评审链路长，单条内容生产周期过长</li>
        </ul>
      </div>
      <div class="card tone-teal">
        <h3>MVP目标</h3>
        <ul>
          <li>用品牌知识库约束AI生成</li>
          <li>用爆款拆解沉淀可复用结构</li>
          <li>用内容重写完成文化适配</li>
          <li>用质量评估前置内容把关</li>
        </ul>
      </div>
      <div class="card tone-amber">
        <h3>验证方法</h3>
        <ul>
          <li>10名目标用户</li>
          <li>5个核心测试任务</li>
          <li>效率、质量、体验三类指标</li>
          <li>两周使用日志+访谈交叉验证</li>
        </ul>
      </div>
    </div>
    <div class="hint">项目范围：验证“效率提升+质量可用”，商业化与复杂协作能力不在MVP范围。</div>
  `,
});

slides.push({
  kicker: '02 · MARKET NEEDS',
  title: '出海品牌社媒营销的四大核心问题',
  subtitle: '从产品经理视角看：问题不是“不会做内容”，而是“内容生产系统效率低”。',
  body: `
    <div class="grid2">
      <div class="card tone-coral">
        <h3>多语言内容生产</h3>
        <p><b>现象：</b>多数团队只有1至2名母语创作者，外语文案依赖翻译或外包，非英语市场内容产量低。</p>
        <p><b>影响：</b>市场覆盖慢，追不上热点，海外存在感弱。</p>
      </div>
      <div class="card tone-coral">
        <h3>本地化表达</h3>
        <p><b>现象：</b>中文逻辑、广告语气、文化梗被直接搬入海外内容。</p>
        <p><b>影响：</b>点击率低、评论区负面反馈，甚至引发品牌风险。</p>
      </div>
      <div class="card tone-amber">
        <h3>爆款内容复用</h3>
        <p><b>现象：</b>爆款结构存在于个人经验里，团队换人即流失，换市场即失灵。</p>
        <p><b>影响：</b>每次创作从零开始，成功经验无法变成稳定杠杆。</p>
      </div>
      <div class="card tone-amber">
        <h3>内容生产效率</h3>
        <p><b>现象：</b>选题、写稿、翻译、评审、改稿串行，重复劳动多。</p>
        <p><b>影响：</b>单条内容耗时数小时到数天，A/B测试素材不足。</p>
      </div>
    </div>
    <div class="hint">产品切入点：AI把“翻译+改稿+评审”压缩为“生成+评分+人工确认”。</div>
  `,
});

slides.push({
  kicker: '03 · USER PERSONA A',
  title: '用户画像：品牌全球社媒负责人',
  subtitle: '负责策略与终审的人，最痛的不是写文案，而是全链路不可控。',
  body: `
    <div class="persona-grid">
      <div>
        <div class="card tone-ink">
          <h3>典型用户：品牌市场经理</h3>
          <p>跨境电商/DTC品牌，负责品牌全球社媒策略，管理多市场内容日历。</p>
          <ul>
            <li>工作职责：策略、排期、调性、外包管理</li>
            <li>当前流程：Brief → 翻译 → 区域改稿 → 终审 → 发布</li>
            <li>核心痛点：一致性难保证、链路长、产能不足</li>
          </ul>
        </div>
      </div>
      <div>
        <div class="card">
          <h3>当前工作流</h3>
          <div class="journey">
            <div class="j-step"><b>1 总部Brief</b><p>定卖点与目标</p></div>
            <div class="j-step"><b>2 翻译外包</b><p>语言转换</p></div>
            <div class="j-step"><b>3 区域改稿</b><p>补本地场景</p></div>
            <div class="j-step"><b>4 负责人终审</b><p>改调性返工</p></div>
            <div class="j-step"><b>5 排期发布</b><p>多平台适配</p></div>
          </div>
        </div>
        <div class="card tone-teal" style="margin-top:11px">
          <h3>使用AI后</h3>
          <p>输入Brief和品牌知识库，AI先产出多语言、多平台候选稿；负责人从“改每一稿”变成“选哪一稿”，策略判断前置，终审时间大幅缩短。</p>
        </div>
      </div>
    </div>
  `,
});

slides.push({
  kicker: '04 · USER PERSONA B/C',
  title: '用户画像：内容创作者与增长操盘手',
  subtitle: '高频执行者要“快和多”，增长操盘手要“版本多、测试快”。',
  body: `
    <div class="grid2">
      <div class="card">
        <h3>画像B：品牌内容创作者</h3>
        <ul>
          <li>角色：内容专员/独立创作者，负责日常内容生产</li>
          <li>流程：刷竞品 → 整理灵感 → 写初稿 → 平台适配</li>
          <li>痛点：灵感枯竭、格式适配耗时、爆款套路说不清</li>
          <li>AI价值：竞品爆款一键拆解，按品牌卖点生成多个变体</li>
        </ul>
        <div class="tag" style="margin-top:8px">核心诉求：找结构、出初稿、改得快</div>
      </div>
      <div class="card tone-amber">
        <h3>画像C：增长/投放操盘手</h3>
        <ul>
          <li>角色：增长负责人/广告优化师，负责素材与A/B测试</li>
          <li>流程：提素材需求 → 等待多版本 → 测试 → 反馈迭代</li>
          <li>痛点：素材版本不够、测试周期长、爆款钩子难复制</li>
          <li>AI价值：基于高表现内容快速生成钩子与卖点变体</li>
        </ul>
        <div class="tag amber" style="margin-top:8px">核心诉求：素材多、版本多、测试快</div>
      </div>
    </div>
    <div class="hint">共性需求：多版本、快产出、可复用。差异点：负责人要可控，创作者要灵感，操盘手要数量。</div>
  `,
});

slides.push({
  kicker: '05 · COMPETITIVE MAP',
  title: '竞品地图：四类AI内容工具',
  subtitle: '竞品分别解决视频生成、视频生产、短视频生成和内容复用，但都没有打通“品牌知识+爆款策略”。',
  body: `
    <div class="grid2">
      <div class="card tone-teal">
        <h3>HeyGen · 素材驱动/低门槛</h3>
        <p>AI数字人视频与多语言口播本地化。解决“视频产出和多语言配音效率”，但缺少品牌知识约束。</p>
      </div>
      <div class="card tone-teal">
        <h3>Runway · 创意驱动/专业</h3>
        <p>专业AI视频生成与编辑。解决“创意素材生成”，但学习门槛高，不适合日常社媒运营链路。</p>
      </div>
      <div class="card tone-amber">
        <h3>Opus Clip · 素材驱动/复用</h3>
        <p>长视频自动切片。解决“已有内容的复用”，但不能从0创作，本地化能力弱。</p>
      </div>
      <div class="card tone-amber">
        <h3>Pika · 创意驱动/低门槛</h3>
        <p>快速短视频生成。解决“快速试创意”，但可控性弱，缺少营销目标和品牌管理。</p>
      </div>
    </div>
    <div class="hint">机会坐标：竞品都在“内容生产工具”象限，缺少“内容策略+品牌资产+质量评估”的Agent工作流。</div>
  `,
});

slides.push({
  kicker: '06 · COMPETITIVE ANALYSIS',
  title: '竞品对比：核心能力与商业模式',
  subtitle: '从产品定位、用户、功能、模式、优势、不足六个维度横向比较。',
  body: `
    <table class="mini-table">
      <thead>
        <tr>
          <th style="width:72px">维度</th>
          <th>HeyGen</th>
          <th>Runway</th>
          <th>Pika</th>
          <th>Opus Clip</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>产品定位</td>
          <td>数字人视频与多语言本地化</td>
          <td>专业AI视频生成编辑</td>
          <td>低门槛短视频生成</td>
          <td>长视频自动切片复用</td>
        </tr>
        <tr>
          <td>用户群体</td>
          <td>营销团队、品牌方、跨境卖家</td>
          <td>创作者、广告与影视团队</td>
          <td>普通创作者、博主</td>
          <td>YouTuber、播客、营销团队</td>
        </tr>
        <tr>
          <td>核心功能</td>
          <td>Avatar、视频翻译、多语言配音</td>
          <td>文生视频、视频转视频、特效</td>
          <td>文生视频、图生视频、风格化</td>
          <td>高光切片、字幕、病毒率预测</td>
        </tr>
        <tr>
          <td>商业模式</td>
          <td>订阅制+点数制</td>
          <td>订阅制+点数制</td>
          <td>Freemium+订阅</td>
          <td>订阅制按量计费</td>
        </tr>
        <tr>
          <td>优势</td>
          <td>多语言视频产出快</td>
          <td>生成质量高、专业可控</td>
          <td>上手快、出片快</td>
          <td>复用效率高、有数据依据</td>
        </tr>
        <tr>
          <td>不足</td>
          <td>无品牌知识，内容策略弱</td>
          <td>门槛高，结果不确定</td>
          <td>可控性弱，无营销管理</td>
          <td>依赖源视频，不能原创</td>
        </tr>
        <tr>
          <td class="hl">空白</td>
          <td class="hl" colspan="4">品牌知识库 + 爆款结构复用 + 文化适配重写 + 发布前质量评估</td>
        </tr>
      </tbody>
    </table>
  `,
});

slides.push({
  kicker: '07 · COMPETITIVE INSIGHTS',
  title: '竞品启示：已解决与未解决',
  subtitle: 'AI生成能力已经被验证，缺的是“品牌上下文”和“内容策略闭环”。',
  body: `
    <div class="grid4">
      <div class="card">
        <h3>HeyGen</h3>
        <p><b>已解决：</b>视频本地化与多语言配音。</p>
        <p><b>未解决：</b>不知道品牌是谁，不判断内容好不好。</p>
      </div>
      <div class="card">
        <h3>Runway</h3>
        <p><b>已解决：</b>高质量创意素材生成。</p>
        <p><b>未解决：</b>不面向社媒运营流程，没有营销目标约束。</p>
      </div>
      <div class="card">
        <h3>Pika</h3>
        <p><b>已解决：</b>快速试创意、低门槛出片。</p>
        <p><b>未解决：</b>可控性和品牌一致性弱。</p>
      </div>
      <div class="card">
        <h3>Opus Clip</h3>
        <p><b>已解决：</b>长视频到短视频的高效复用。</p>
        <p><b>未解决：</b>不能从0创作，跨市场本地化弱。</p>
      </div>
    </div>
    <div class="hypothesis" style="padding:10px 14px;font-size:12px">市场空白：<span>品牌知识驱动的“爆款拆解 → 本地化重写 → 质量评估”内容生产闭环</span></div>
  `,
});

slides.push({
  kicker: '08 · OPPORTUNITY',
  title: '产品机会：从痛点推导机会',
  subtitle: '每个机会都由“用户痛点 → 原因分析 → 产品机会”三层推导得出。',
  body: `
    <div class="opp-row">
      <div class="cell"><b>痛点</b><p>品牌内容难保持一致</p></div>
      <div class="cell"><b>原因分析</b><p>通用AI缺少品牌定位、卖点、语气知识</p></div>
      <div class="cell opp"><b>机会</b><p>品牌知识库Agent + 品牌调性校验</p></div>
    </div>
    <div class="opp-row">
      <div class="cell"><b>痛点</b><p>爆款经验无法复制</p></div>
      <div class="cell"><b>原因分析</b><p>爆款只被浏览，未被结构化拆解</p></div>
      <div class="cell opp"><b>机会</b><p>爆款拆解Agent + 结构化爆款库</p></div>
    </div>
    <div class="opp-row">
      <div class="cell"><b>痛点</b><p>本地化停留在翻译</p></div>
      <div class="cell"><b>原因分析</b><p>缺少文化语境、用户场景、平台表达</p></div>
      <div class="cell opp"><b>机会</b><p>文化适配重写Agent + 本地化校验</p></div>
    </div>
    <div class="opp-row">
      <div class="cell"><b>痛点</b><p>内容生产链路过长</p></div>
      <div class="cell"><b>原因分析</b><p>调研、写作、翻译、评审串行重复</p></div>
      <div class="cell opp"><b>机会</b><p>生成-评分-修订闭环，一次产出多版本</p></div>
    </div>
    <div class="opp-row">
      <div class="cell"><b>痛点</b><p>内容质量靠个人感觉</p></div>
      <div class="cell"><b>原因分析</b><p>缺少可解释、可复用的质量标准</p></div>
      <div class="cell opp"><b>机会</b><p>内容质量评估Agent，多维评分</p></div>
    </div>
  `,
});

slides.push({
  kicker: '09 · PRODUCT DEFINITION',
  title: '产品定位与核心价值',
  subtitle: '产品回答一个明确业务问题：如何让AI成为出海品牌的“内容生产系统”。',
  body: `
    <div class="hypothesis" style="font-size:13px;line-height:1.5">一句话定位：<span>以品牌知识库为底座，把爆款经验拆解为可复用结构，再按市场、人群、平台生成多语言内容，并用质量评分驱动人工确认。</span></div>
    <div class="grid2">
      <div class="card">
        <h3>目标用户</h3>
        <ul>
          <li>跨境电商/DTC/SaaS出海品牌市场团队</li>
          <li>直接用户：社媒负责人、内容创作者、增长操盘手</li>
          <li>团队规模：1至50人，缺少多语言全职创作者</li>
        </ul>
        <div class="tag" style="margin-top:8px">MVP不做全公司协作，先服务“小团队+多市场”</div>
      </div>
      <div class="card tone-teal">
        <h3>核心价值</h3>
        <ul>
          <li>产能：一份Brief生成多市场多平台候选稿</li>
          <li>复用：爆款结构沉淀为可复用模板</li>
          <li>稳定：品牌知识约束AI，减少调性漂移</li>
          <li>前置：发布前用评分拦截低质量内容</li>
        </ul>
      </div>
    </div>
  `,
});

slides.push({
  kicker: '10 · MVP ARCHITECTURE',
  title: 'MVP功能架构',
  subtitle: '四个Agent功能形成“拆解-生成-评估”闭环，品牌知识库贯穿全流程。',
  body: `
    <div class="arch">
      <div class="card">
        <h3>爆款内容拆解Agent</h3>
        <p>输入竞品文案/视频脚本，输出用户画像、内容结构、情绪触发点、核心卖点、爆款原因，沉淀为可复用模板。</p>
      </div>
      <div class="card">
        <h3>AI内容重写Agent</h3>
        <p>保留核心卖点与营销目标，优化表达方式、用户场景、文化适配，生成多语言多版本内容。</p>
      </div>
      <div class="base">
        <b>品牌知识库</b>
        <p>品牌定位 · 产品卖点 · 目标市场 · 语气与禁忌</p>
      </div>
      <div class="card tone-amber" style="grid-column:1 / 3">
        <h3>内容质量评估Agent</h3>
        <p>从吸引力、转化潜力、平台适配度三维评分，附原因、引用与修改建议，输出“通过/需修改/不建议发布”结论。</p>
      </div>
    </div>
  `,
});

slides.push({
  kicker: '11 · FEATURE 1',
  title: '功能1：爆款内容拆解Agent',
  subtitle: '把“这条内容为什么火”变成可执行的结构模板。',
  body: `
    <div class="grid2">
      <div class="card tone-amber">
        <h3>输入</h3>
        <ul>
          <li>竞品文案 / 视频脚本 / 口播文字稿</li>
          <li>可选：平台、发布时间、账号类型</li>
        </ul>
        <div class="tag amber" style="margin-top:8px">不要求用户先懂方法论</div>
      </div>
      <div class="card tone-teal">
        <h3>输出</h3>
        <ul>
          <li>用户画像：写给谁、什么诉求</li>
          <li>内容结构：钩子、转折、卖点、行动号召</li>
          <li>情绪触发点：好奇、认同、惊喜、社交证明</li>
          <li>核心卖点：被强调的价值与证据</li>
          <li>爆款原因：内容事实与策略推断分离</li>
        </ul>
      </div>
    </div>
    <div class="shot-frame">
      <img src="../landing/images/agent-02-teardown.png" alt="爆款拆解Agent原型截图">
      <div class="shot-caption">真实原型截图：爆款拆解输出，包含用户画像、结构、情绪点、卖点与爆款原因</div>
    </div>
    <div class="hint">产品约束：结论必须引用原文，不编造数据；拆解结果可一键保存为内容模板。</div>
  `,
});

slides.push({
  kicker: '12 · FEATURE 2',
  title: '功能2：AI内容重写Agent',
  subtitle: '不是简单改写，而是“保留卖点，重写表达，适配文化”。',
  body: `
    <div class="grid3">
      <div class="card">
        <h3>必须保留</h3>
        <ul>
          <li>核心卖点</li>
          <li>营销目标：曝光/互动/转化</li>
          <li>品牌约束：语气、身份、禁忌</li>
        </ul>
      </div>
      <div class="card tone-amber">
        <h3>必须优化</h3>
        <ul>
          <li>表达方式：避免翻译腔</li>
          <li>用户场景：当地真实生活场景</li>
          <li>文化适配：节日、数字、货币、梗</li>
        </ul>
      </div>
      <div class="card tone-teal">
        <h3>MVP输出</h3>
        <ul>
          <li>支持多市场批量生成（默认美国/英国/日本）</li>
          <li>每个市场生成2至3个内容变体</li>
          <li>标注保留卖点、本地化改动、目标平台</li>
        </ul>
      </div>
    </div>
    <div class="shot-frame">
      <img src="../landing/images/agent-04-rewrite.png" alt="多市场内容重写原型截图">
      <div class="shot-caption">真实原型截图：一次选择多个市场，批量生成带市场标签的内容变体</div>
    </div>
    <div class="hint">示例判断：英文“Strong waterproof”在日本市场应转为“日常通勤不怕雨淋”的场景表达，而不是逐字翻译。</div>
  `,
});

slides.push({
  kicker: '13 · FEATURE 3',
  title: '功能3：品牌知识库',
  subtitle: '让AI生成“像这个品牌”的内容，而不是“通用好文案”。',
  body: `
    <div class="grid3">
      <div class="card">
        <h3>品牌定位</h3>
        <ul>
          <li>品牌一句话</li>
          <li>目标人群</li>
          <li>价值主张与品牌性格</li>
        </ul>
      </div>
      <div class="card tone-teal">
        <h3>产品卖点</h3>
        <ul>
          <li>核心功能与差异点</li>
          <li>证据与认证</li>
          <li>常见误解与澄清</li>
        </ul>
      </div>
      <div class="card tone-amber">
        <h3>目标市场</h3>
        <ul>
          <li>覆盖市场与语言偏好</li>
          <li>文化禁忌</li>
          <li>热门平台与内容偏好</li>
        </ul>
      </div>
    </div>
    <div class="shot-frame">
      <img src="../landing/images/agent-03-brand.png" alt="品牌知识库原型截图">
      <div class="shot-caption">真实原型截图：品牌知识库，包含定位、卖点、市场与禁忌</div>
    </div>
    <div class="hypothesis" style="padding:10px 14px;font-size:11.5px">使用方式：<span>生成前检索注入 → 生成中约束表达 → 生成后品牌调性校验</span></div>
  `,
});

slides.push({
  kicker: '14 · FEATURE 4',
  title: '功能4：内容质量评估',
  subtitle: '把“发布后才知道好坏”变成“发布前先打分、先说明理由”。',
  body: `
    <div class="check-row">
      <div class="check-card">
        <h3>吸引力</h3>
        <p>评估钩子强度、情绪价值、信息密度，判断用户是否愿意停留和互动。</p>
        <div class="score-track"><div class="score-fill" style="width:42%"></div></div>
      </div>
      <div class="check-card">
        <h3>转化潜力</h3>
        <p>评估卖点清晰度、证据强度、行动号召，判断内容是否推动点击或转化。</p>
        <div class="score-track"><div class="score-fill" style="width:38%"></div></div>
      </div>
      <div class="check-card">
        <h3>平台适配度</h3>
        <p>评估平台格式、语言风格、社区规则，判断内容是否原生和合规。</p>
        <div class="score-track"><div class="score-fill" style="width:46%"></div></div>
      </div>
    </div>
    <div class="grid3">
      <div class="card tone-coral">
        <h3>判断规则</h3>
        <p>总分低时给出具体修改建议，引导重新生成；风险项单列警告。</p>
      </div>
      <div class="card tone-teal">
        <h3>可解释</h3>
        <p>每个分数必须附原因和原文引用，不做无解释评分。</p>
      </div>
      <div class="card tone-amber">
        <h3>沉淀标准</h3>
        <p>人工评审记录回流，逐步形成品牌自己的质量标准。</p>
      </div>
    </div>
    <div class="shot-frame">
      <img src="../landing/images/agent-05-eval.png" alt="内容质量评估原型截图">
      <div class="shot-caption">真实原型截图：吸引力、转化潜力、平台适配度三维评分</div>
    </div>
  `,
});

slides.push({
  kicker: '15 · AI WORKFLOW',
  title: 'Agent工作流：从输入到输出',
  subtitle: '每一步都对应一个明确业务问题，核心是“生成与评估分离，人在环中”。',
  body: `
    <div class="flow-row">
      <div class="flow-step"><div class="num">STEP 01</div><div class="ft">输入</div><div class="fd">结构化任务、原始内容、多市场与平台目标</div></div>
      <div class="flow-arrow">→</div>
      <div class="flow-step"><div class="num">STEP 02</div><div class="ft">Prompt处理</div><div class="fd">动态组装角色、上下文、约束、输出格式</div></div>
      <div class="flow-arrow">→</div>
      <div class="flow-step"><div class="num">STEP 03</div><div class="ft">知识检索</div><div class="fd">品牌库、爆款库、平台规则、市场禁忌</div></div>
      <div class="flow-arrow">→</div>
      <div class="flow-step"><div class="num">STEP 04</div><div class="ft">LLM生成</div><div class="fd">多路生成候选，控制语言、长度与视角</div></div>
      <div class="flow-arrow">→</div>
      <div class="flow-step"><div class="num">STEP 05</div><div class="ft">质量检查</div><div class="fd">三维评分、事实一致性、品牌调性、文化风险</div></div>
      <div class="flow-arrow">→</div>
      <div class="flow-step"><div class="num">STEP 06</div><div class="ft">输出</div><div class="fd">结构化交付、修订建议、人工确认</div></div>
    </div>
    <div class="grid3">
      <div class="card"><h3>问题1：信息缺失</h3><p>输入解析避免任务目标不清导致生成跑偏。</p></div>
      <div class="card"><h3>问题2：幻觉</h3><p>知识检索给模型品牌和市场依据，减少编造。</p></div>
      <div class="card"><h3>问题3：盲区</h3><p>生成与评估分离，避免“自己写自己评分”。</p></div>
    </div>
    <div class="workflow-shots">
      <div class="shot-frame"><img src="../landing/images/agent-01-input.png" alt="输入步骤截图"><div class="shot-caption">输入</div></div>
      <div class="shot-frame"><img src="../landing/images/agent-02-teardown.png" alt="拆解步骤截图"><div class="shot-caption">拆解</div></div>
      <div class="shot-frame"><img src="../landing/images/agent-03-brand.png" alt="品牌检索步骤截图"><div class="shot-caption">品牌</div></div>
      <div class="shot-frame"><img src="../landing/images/agent-04-rewrite.png" alt="生成步骤截图"><div class="shot-caption">生成</div></div>
      <div class="shot-frame"><img src="../landing/images/agent-05-eval.png" alt="评估步骤截图"><div class="shot-caption">评估</div></div>
    </div>
  `,
});

slides.push({
  kicker: '16 · PROMPT ENGINEERING',
  title: 'Prompt工程设计',
  subtitle: '核心模板覆盖拆解、重写、评估三类任务，要求输出可解释、可验证。',
  body: `
    <div class="grid2">
      <div class="card">
        <h3>五条设计原则</h3>
        <ul>
          <li>角色明确：告诉模型“你是谁、为谁工作”</li>
          <li>上下文充分：品牌知识、原文、市场全部注入</li>
          <li>约束可验证：卖点保留、事实不新增、禁忌不触碰</li>
          <li>输出结构化：JSON元信息+可读文案</li>
          <li>可重试：评分结果驱动二次生成</li>
        </ul>
      </div>
      <div class="card tone-ink">
        <h3>模板结构</h3>
        <div class="prompt-box"><b>角色：</b>资深出海社媒内容策略分析师
<b>任务：</b>拆解竞品内容，输出爆款分析
<b>上下文：</b>行业、市场、原始内容、品牌知识
<b>限制条件：</b>引用原文、禁止编造、区分事实与推断
<b>输出格式：</b>用户画像、结构、情绪点、卖点、爆款原因</div>
      </div>
    </div>
    <div class="hint">三套模板：爆款拆解 / 内容重写 / 质量评估。每个模板都包含角色、任务、上下文、限制条件、输出格式。</div>
  `,
});

slides.push({
  kicker: '17 · MVP VALIDATION',
  title: 'MVP验证方案',
  subtitle: '用10名目标用户、5个任务、三类指标回答“是否值得继续投入”。',
  body: `
    <div class="grid3">
      <div class="card">
        <h3>测试用户</h3>
        <ul>
          <li>品牌社媒负责人：3人</li>
          <li>内容创作者：4人</li>
          <li>增长操盘手：2人</li>
          <li>本地化/翻译角色：1人</li>
        </ul>
      </div>
      <div class="card tone-amber">
        <h3>测试任务</h3>
        <ul>
          <li>1. 竞品脚本完成爆款拆解</li>
          <li>2. 生成英语/西语/日语市场变体</li>
          <li>3. 生成TikTok/Instagram内容变体</li>
          <li>4. 评分并修改到“通过”</li>
          <li>5. 满意度问卷与15分钟访谈</li>
        </ul>
      </div>
      <div class="card tone-teal">
        <h3>评价指标</h3>
        <ul>
          <li>效率：生产时间、修改次数</li>
          <li>质量：首版通过率、品牌调性一致率</li>
          <li>体验：满意度、持续使用意愿</li>
          <li>商业：素材产出量、使用意愿</li>
        </ul>
      </div>
    </div>
    <div class="hint">验证方法：可点击原型或Demo，两周使用日志，问卷与访谈交叉验证，避免单一主观指标。</div>
  `,
});

slides.push({
  kicker: '18 · SIMULATED RESULTS',
  title: '模拟验证指标与迭代方向',
  subtitle: '以下为MVP设计目标值，非真实商业数据。',
  body: `
    <div class="grid2">
      <div class="card">
        <h3>效率对比（模拟目标）</h3>
        <div class="bar-row"><span class="label">单条生产时间</span><div class="bar-track"><div class="bar-fill" style="width:72%"></div></div><span class="bar-val">90-120min</span></div>
        <div class="bar-row" style="margin-top:6px"><span class="label">Agent目标</span><div class="bar-track"><div class="bar-fill amber" style="width:30%"></div></div><span class="bar-val">30-45min</span></div>
        <div class="bar-row" style="margin-top:12px"><span class="label">人工修改</span><div class="bar-track"><div class="bar-fill" style="width:70%"></div></div><span class="bar-val">3-4轮</span></div>
        <div class="bar-row" style="margin-top:6px"><span class="label">Agent目标</span><div class="bar-track"><div class="bar-fill amber" style="width:36%"></div></div><span class="bar-val">≤2轮</span></div>
        <div class="bar-row" style="margin-top:12px"><span class="label">首版通过</span><div class="bar-track"><div class="bar-fill" style="width:40%"></div></div><span class="bar-val">约40%</span></div>
        <div class="bar-row" style="margin-top:6px"><span class="label">Agent目标</span><div class="bar-track"><div class="bar-fill amber" style="width:75%"></div></div><span class="bar-val">≥75%</span></div>
      </div>
      <div class="card tone-amber">
        <h3>下一轮迭代方向</h3>
        <ul>
          <li>V0.2：高表现内容自动回流爆款库</li>
          <li>V0.3：品牌调性评分与人工评审记录</li>
          <li>V0.4：接入发布后数据，形成增长飞轮</li>
        </ul>
        <div class="tag amber" style="margin-top:8px">关键决策：先验证效率，再验证内容效果</div>
      </div>
    </div>
  `,
});

slides.push({
  kicker: '19 · REFLECTION',
  title: '项目复盘：AI产品经理能力体现',
  subtitle: '完整走通“需求-竞品-定义-设计-AI方案-验证”的产品闭环。',
  body: `
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span class="tag">需求分析</span><span class="tag amber">竞品研究</span><span class="tag">产品定义</span><span class="tag coral">AI应用</span><span class="tag amber">MVP验证</span>
    </div>
    <div class="grid3" style="margin-top:4px">
      <div class="card tone-teal">
        <h3>做得好的</h3>
        <ul>
          <li>把模糊痛点拆成可验证的假设</li>
          <li>从竞品空白推导产品机会</li>
          <li>用Prompt模板体现AI产品能力</li>
          <li>指标全部标注模拟，不虚构数据</li>
        </ul>
      </div>
      <div class="card tone-amber">
        <h3>待改进</h3>
        <ul>
          <li>缺少真实用户访谈样本</li>
          <li>文化适配仍依赖人工判断</li>
          <li>质量评估标准需要更大样本校准</li>
        </ul>
      </div>
      <div class="card tone-coral">
        <h3>下一步</h3>
        <ul>
          <li>完成可点击原型与Agent Demo</li>
          <li>招募10名目标用户跑验证任务</li>
          <li>用真实内容数据替换模拟指标</li>
        </ul>
      </div>
    </div>
  `,
});

function buildHtml() {
  const body = slides
    .map((s, i) => {
      if (s.cls === 'cover') return s.html;
      return slide({ ...s, page: i + 1 });
    })
    .join('\n');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>AI出海内容增长助手 Agent</title>
<style>${CSS}</style>
</head>
<body>${body}</body>
</html>`;
}

(async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const html = buildHtml();
  writeFileSync(SOURCE_FILE, html, 'utf8');

  const browser = await playwright.chromium.launch({
    executablePath: SYSTEM_CHROME || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(SOURCE_FILE).href, { waitUntil: 'load' });
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolveImage) => {
              img.addEventListener('load', resolveImage, { once: true });
              img.addEventListener('error', resolveImage, { once: true });
            })
      )
    )
  );

  const imageState = await page.evaluate(() =>
    Array.from(document.images).map((img) => ({
      src: img.getAttribute('src'),
      ok: img.complete && img.naturalWidth > 0,
    }))
  );
  const brokenImages = imageState.filter((img) => !img.ok);
  if (brokenImages.length) {
    throw new Error(`BROKEN_IMAGES ${JSON.stringify(brokenImages)}`);
  }
  console.log(`IMAGES_OK ${imageState.length}`);

  const overflow = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.slide')).map((el, i) => {
      const diff = el.scrollHeight - el.clientHeight;
      return { page: i + 1, diff };
    })
  );
  const bad = overflow.filter((o) => o.diff > 1);
  if (bad.length) {
    console.warn('OVERFLOW_WARNING', JSON.stringify(bad));
  } else {
    console.log('OVERFLOW_CHECK_OK');
  }

  await page.pdf({
    path: PDF_FILE,
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();

  console.log('PDF_WRITTEN', PDF_FILE);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
