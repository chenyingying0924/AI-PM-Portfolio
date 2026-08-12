const { writeFileSync, mkdirSync, existsSync } = require('node:fs');
const { join, resolve } = require('node:path');
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

const SYSTEM_CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].find(existsSync);

const root = resolve(__dirname, '..');

const A_SECTIONS = [
  {
    kicker: '01 · PROJECT OVERVIEW',
    title: '项目概览',
    subtitle: 'AI用户洞察与增长决策Agent：把用户声音转化为业务决策。',
    body: `
      <div class="hypothesis">核心假设：<span>AI能否帮助出海品牌快速完成用户洞察，并辅助业务决策</span></div>
      <div class="grid3">
        <div class="card"><h3>产品定位</h3><ul><li>面向出海品牌团队</li><li>AI用户洞察与增长决策Agent</li><li>保留InsightPulse核心方向</li></ul></div>
        <div class="card tone"><h3>核心价值</h3><ul><li>用户痛点洞察</li><li>产品优化建议</li><li>市场机会发现</li><li>内容增长方向</li></ul></div>
        <div class="card tone2"><h3>决策原则</h3><ul><li>AI不仅分析数据</li><li>而是辅助业务决策</li><li>输出优先级建议</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '02 · MARKET NEEDS',
    title: '海外品牌用户声音分析的问题',
    subtitle: '问题不是没有反馈，而是反馈没有被转化为决策。',
    body: `
      <div class="grid2">
        <div class="card"><h3>反馈分散</h3><p>Amazon、TikTok、Reddit、客服反馈分散在不同平台，团队难以统一分析。</p></div>
        <div class="card"><h3>人工整理慢</h3><p>人工收集、Excel整理、人工分类，5000条评论需要数天。</p></div>
        <div class="card tone"><h3>判断主观</h3><p>不同人判断标准不一致，容易忽略低词频但高价值的需求。</p></div>
        <div class="card tone2"><h3>隐藏需求难发现</h3><p>只看高频表达，看不到用户没说出口的潜在需求。</p></div>
      </div>
    `,
  },
  {
    kicker: '03 · USER PERSONAS',
    title: '目标用户画像',
    subtitle: '三类用户共同需要“从反馈到决策”的能力。',
    body: `
      <div class="grid3">
        <div class="card"><h3>品牌市场负责人</h3><p>新品进入美国市场，需要分析5000条Amazon评论，判断市场机会。</p></div>
        <div class="card tone"><h3>产品经理</h3><p>需要判断“电池不耐用”是个别抱怨还是核心问题，并确定迭代优先级。</p></div>
        <div class="card tone2"><h3>内容运营</h3><p>需要基于真实用户声音生成TikTok选题、广告方向和营销角度。</p></div>
      </div>
    `,
  },
  {
    kicker: '04 · USER JOURNEY',
    title: '用户使用流程',
    subtitle: '从数据上传到内容选题的完整决策链路。',
    body: `
      <div class="flow">
        <div class="flow-step"><b>上传</b><span>评论数据</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>理解</b><span>AI理解内容</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>情感</b><span>分析情绪</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>聚类</b><span>主题识别</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>痛点</b><span>问题定位</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>排序</b><span>机会优先级</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>建议</b><span>产品建议</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>选题</b><span>内容方向</span></div>
      </div>
      <div class="hint">每个阶段都有明确输出，用户可以看到AI的推理过程，而不是黑盒结论。</div>
    `,
  },
  {
    kicker: '05 · AGENT ARCHITECTURE',
    title: 'AI Agent架构总览',
    subtitle: '四个Agent协作完成“用户声音到业务决策”的链路。',
    body: `
      <div class="grid4">
        <div class="card"><h3>Agent 1</h3><p>Data Understanding Agent</p><p>数据清洗、语言识别、评论理解</p></div>
        <div class="card tone"><h3>Agent 2</h3><p>Insight Analysis Agent</p><p>情感分析、痛点聚类、需求提取</p></div>
        <div class="card tone2"><h3>Agent 3</h3><p>Product Strategy Agent</p><p>产品建议、优先级排序</p></div>
        <div class="card"><h3>Agent 4</h3><p>Growth Content Agent</p><p>内容方向、营销角度</p></div>
      </div>
    `,
  },
  {
    kicker: '06 · AGENT 1',
    title: 'Agent 1：Data Understanding Agent',
    subtitle: '让AI先理解数据，再谈洞察。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><ul><li>Amazon Review</li><li>TikTok评论</li><li>Reddit反馈</li><li>CSV文件</li></ul></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>数据清洗</li><li>语言识别</li><li>评论理解</li><li>无效数据过滤</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>结构化评论</li><li>渠道与语言标签</li><li>可分析数量</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '07 · AGENT 2',
    title: 'Agent 2：Insight Analysis Agent',
    subtitle: '从评论中提取情感、主题与用户需求。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>结构化评论数据</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>情感分析</li><li>痛点聚类</li><li>用户需求提取</li><li>代表评论选择</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>情感分布</li><li>主题聚类</li><li>影响人数</li><li>典型案例</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '08 · AGENT 3',
    title: 'Agent 3：Product Strategy Agent',
    subtitle: '评估影响、情绪与商业价值，输出优先级。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>用户痛点与需求</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>影响人数评估</li><li>情绪强度评估</li><li>商业价值评估</li><li>P0/P1/P2排序</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>用户问题</li><li>原因分析</li><li>产品机会</li><li>建议方案</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '09 · AGENT 4',
    title: 'Agent 4：Growth Content Agent',
    subtitle: '把洞察转化为内容增长方向。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>优先级建议与目标平台</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>用户痛点驱动选题</li><li>平台特征适配</li><li>营销角度生成</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>TikTok选题</li><li>广告方向</li><li>营销角度</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '10 · FEATURES',
    title: '功能模块设计',
    subtitle: 'F1至F7覆盖从数据输入到决策报告的全流程。',
    body: `
      <table class="table">
        <thead><tr><th>功能</th><th>用户价值</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>F1 多渠道数据输入</td><td>Amazon、TikTok、Reddit、CSV</td><td>已实现</td></tr>
          <tr><td>F2 AI用户情感分析</td><td>情绪比例、趋势、代表评论</td><td>已实现</td></tr>
          <tr><td>F3 用户痛点聚类</td><td>主题、影响人数、典型案例</td><td>已实现</td></tr>
          <tr><td>F4 需求优先级排序</td><td>P0/P1/P2机制</td><td>已实现</td></tr>
          <tr><td>F5 AI产品机会生成</td><td>问题、原因、机会、方案</td><td>已实现</td></tr>
          <tr><td>F6 AI内容增长建议</td><td>TikTok选题、广告方向</td><td>已实现</td></tr>
          <tr><td>F7 洞察报告生成</td><td>JSON、PRD、PDF</td><td>已实现</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    kicker: '11 · COMPETITIVE ANALYSIS',
    title: '竞品分析',
    subtitle: 'InsightPulse的机会不是做通用AI，而是做垂直决策闭环。',
    body: `
      <table class="table">
        <thead><tr><th>产品</th><th>定位</th><th>优势</th><th>不足</th><th>InsightPulse机会</th></tr></thead>
        <tbody>
          <tr><td>ChatGPT</td><td>通用AI助手</td><td>理解能力强</td><td>无结构化决策链路</td><td>Agent化工作流</td></tr>
          <tr><td>MonkeyLearn</td><td>文本分类工具</td><td>分类模型成熟</td><td>不输出业务建议</td><td>痛点到机会的转化</td></tr>
          <tr><td>Glean</td><td>企业知识搜索</td><td>企业知识整合强</td><td>不分析外部用户声音</td><td>垂直出海场景</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    kicker: '12 · MVP DESIGN',
    title: 'MVP设计',
    subtitle: '验证AI能否帮助品牌快速完成用户洞察。',
    body: `
      <div class="grid2">
        <div class="card"><h3>MVP必须包含</h3><ul><li>CSV评论上传</li><li>AI分析</li><li>痛点聚类</li><li>机会生成</li><li>报告导出</li></ul></div>
        <div class="card tone"><h3>暂不包含</h3><ul><li>实时API接入</li><li>复杂数据采集</li><li>多账号权限体系</li><li>跨市场实时看板</li></ul></div>
      </div>
      <div class="hint">成功标准：分析完成率不低于90%，报告导出率不低于60%，人工分析时间减少50%以上。</div>
    `,
  },
  {
    kicker: '13 · AI WORKFLOW',
    title: 'Agent工作流',
    subtitle: '从原始反馈到可执行洞察，全程可解释。',
    shot: true,
    body: `
      <div class="flow">
        <div class="flow-step"><b>Agent1</b><span>数据理解</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent2</b><span>情感与聚类</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent3</b><span>产品策略</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent4</b><span>增长内容</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>排序</b><span>P0/P1/P2</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>输出</b><span>报告导出</span></div>
      </div>
    `,
  },
  {
    kicker: '14 · METRICS',
    title: '数据指标体系',
    subtitle: '从用户、效率、质量、商业四个维度衡量产品价值。',
    body: `
      <table class="table">
        <thead><tr><th>类型</th><th>指标</th><th>目标</th></tr></thead>
        <tbody>
          <tr><td>用户</td><td>分析完成率</td><td>不低于90%</td></tr>
          <tr><td>用户</td><td>报告导出率</td><td>不低于60%</td></tr>
          <tr><td>效率</td><td>人工分析时间减少</td><td>50%以上</td></tr>
          <tr><td>质量</td><td>AI洞察准确性</td><td>4分以上（5分制）</td></tr>
          <tr><td>商业</td><td>有效市场机会数量</td><td>每周不少于2个</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    kicker: '15 · RESULTS & ROADMAP',
    title: '模拟结果与迭代方向',
    subtitle: '模拟目标值，非真实商业数据。',
    body: `
      <table class="table">
        <thead><tr><th>指标</th><th>目标</th></tr></thead>
        <tbody>
          <tr><td>洞察报告生成时间</td><td>30秒内</td></tr>
          <tr><td>痛点识别准确率</td><td>不低于80%</td></tr>
          <tr><td>内容选题采用率</td><td>不低于60%</td></tr>
          <tr><td>产品改进采纳率</td><td>不低于40%</td></tr>
        </tbody>
      </table>
      <div class="hint">迭代：V0.2趋势对比 → V0.3跨市场看板 → V0.4真实LLM接入</div>
    `,
  },
  {
    kicker: '16 · PORTFOLIO VALUE',
    title: '作品集展示价值',
    subtitle: '从问题发现到AI Agent设计，再到指标体系验证。',
    body: `
      <div class="grid3">
        <div class="card tone"><h3>产品故事线</h3><p>出海品牌面对大量用户声音，但不知道用户真正在意什么，AI辅助决策形成闭环。</p></div>
        <div class="card"><h3>页面结构</h3><p>官网、原型、17页PDF、PRD V2.0、完整方案。</p></div>
        <div class="card tone2"><h3>面试逻辑</h3><p>发现问题 → 定义机会 → 设计Agent → 功能设计 → 指标体系 → 结果反思。</p></div>
      </div>
    `,
  },
];

const C_SECTIONS = [
  {
    kicker: '01 · PROJECT OVERVIEW',
    title: '项目概览',
    subtitle: 'AI Product Manager Agent：从需求发现到PRD评审的完整工作流。',
    body: `
      <div class="hypothesis">核心假设：<span>AI能否降低产品经理需求分析和PRD撰写成本</span></div>
      <div class="grid3">
        <div class="card"><h3>产品定位</h3><ul><li>面向产品团队</li><li>AI需求分析与产品设计Agent</li><li>产品经理的智能协作伙伴</li></ul></div>
        <div class="card tone"><h3>核心价值</h3><ul><li>需求洞察</li><li>需求分析</li><li>产品设计</li><li>PRD生成与评审</li></ul></div>
        <div class="card tone2"><h3>设计原则</h3><ul><li>AI不是替代人写文档</li><li>人工在环</li><li>结果可解释</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '02 · MARKET NEEDS',
    title: '产品经理工作流的核心问题',
    subtitle: '大量时间消耗在整理，而不是判断。',
    body: `
      <div class="grid2">
        <div class="card"><h3>信息碎片化</h3><p>访谈、会议、竞品资料分散，需求容易遗漏。</p></div>
        <div class="card"><h3>重复整理成本高</h3><p>同一份信息被反复整理、排版、改写。</p></div>
        <div class="card tone"><h3>新人经验不足</h3><p>缺少标准流程和模板，产出质量不稳定。</p></div>
        <div class="card tone2"><h3>PRD质量依赖个人能力</h3><p>需求完整性、边界情况和验收标准因人而异。</p></div>
      </div>
    `,
  },
  {
    kicker: '03 · USER PERSONA 1',
    title: '用户1：产品经理',
    subtitle: '负责新产品需求分析，需要从访谈和反馈中提炼需求。',
    body: `
      <div class="grid2">
        <div class="card"><h3>工作场景</h3><p>负责新产品需求分析，面对大量访谈和反馈。</p></div>
        <div class="card tone"><h3>当前任务</h3><p>整理需求素材、分析用户问题、设计功能、撰写PRD。</p></div>
        <div class="card tone2"><h3>痛点</h3><p>信息整理耗时，需求容易遗漏，PRD修改频繁。</p></div>
        <div class="card"><h3>业务案例</h3><p>收到50份用户访谈记录，需要整理成需求池并产出PRD。</p></div>
      </div>
    `,
  },
  {
    kicker: '04 · USER PERSONA 2',
    title: '用户2：产品负责人',
    subtitle: '需要快速评审多个需求方案。',
    body: `
      <div class="grid2">
        <div class="card"><h3>工作场景</h3><p>需要在一周内评审多个需求方案。</p></div>
        <div class="card tone"><h3>当前任务</h3><p>判断需求是否清晰、功能是否合理、范围是否可控。</p></div>
        <div class="card tone2"><h3>痛点</h3><p>PRD结构不一致，评审效率低，边界情况常被遗漏。</p></div>
        <div class="card"><h3>业务案例</h3><p>通过AI Review提前获得质量评分和问题列表，聚焦高风险需求。</p></div>
      </div>
    `,
  },
  {
    kicker: '05 · USER PERSONA 3',
    title: '用户3：产品新人/实习生',
    subtitle: '学习产品设计流程，完成第一份PRD。',
    body: `
      <div class="grid2">
        <div class="card"><h3>工作场景</h3><p>在真实产品团队中学习需求分析和PRD撰写。</p></div>
        <div class="card tone"><h3>当前任务</h3><p>模仿模板撰写PRD，理解需求分析和功能设计。</p></div>
        <div class="card tone2"><h3>痛点</h3><p>缺少标准流程，不知道PRD应该包含什么。</p></div>
        <div class="card"><h3>业务案例</h3><p>通过PRD Copilot获得标准结构和验收标准示例，基于初稿学习修改。</p></div>
      </div>
    `,
  },
  {
    kicker: '06 · USER JOURNEY',
    title: '用户使用流程',
    subtitle: '六步完成从输入素材到PRD评审。',
    body: `
      <div class="flow">
        <div class="flow-step"><b>输入</b><span>需求素材</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Research</b><span>用户洞察</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Requirement</b><span>需求列表</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Designer</b><span>功能方案</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Writer</b><span>PRD初稿</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Review</b><span>质量评审</span></div>
      </div>
      <div class="hint">每个阶段都有明确输出，用户可以看到AI的推理过程。</div>
    `,
  },
  {
    kicker: '07 · AGENT ARCHITECTURE',
    title: 'AI Agent架构总览',
    subtitle: '五个Agent协作完成产品经理工作流。',
    body: `
      <div class="grid4">
        <div class="card"><h3>Agent 1</h3><p>Research Agent</p><p>理解资料，输出用户洞察</p></div>
        <div class="card tone"><h3>Agent 2</h3><p>Requirement Analyst</p><p>用户故事与优先级</p></div>
        <div class="card tone2"><h3>Agent 3</h3><p>Product Designer</p><p>功能、流程、页面</p></div>
        <div class="card"><h3>Agent 4</h3><p>PRD Writer</p><p>标准PRD生成</p></div>
        <div class="card"><h3>Agent 5</h3><p>Review Agent</p><p>质量评分与建议</p></div>
      </div>
    `,
  },
  {
    kicker: '08 · AGENT 1',
    title: 'Agent 1：Research Agent',
    subtitle: '理解输入资料，提炼用户洞察。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><ul><li>用户访谈</li><li>会议纪要</li><li>竞品资料</li><li>用户反馈</li></ul></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>识别用户问题</li><li>提取使用场景</li><li>发现需求机会</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>用户问题</li><li>需求机会</li><li>关键洞察</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '09 · AGENT 2',
    title: 'Agent 2：Requirement Analyst Agent',
    subtitle: '将洞察转化为用户故事和需求列表。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>Research Agent的用户洞察</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>用户故事转化</li><li>用户价值评估</li><li>业务价值评估</li><li>优先级输出</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>用户故事</li><li>需求列表</li><li>P0/P1/P2</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '10 · AGENT 3',
    title: 'Agent 3：Product Designer Agent',
    subtitle: '辅助产品方案设计。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>需求清单与用户故事</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>功能模块拆解</li><li>用户流程设计</li><li>页面结构建议</li><li>业务规则定义</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>功能模块</li><li>用户流程</li><li>页面结构</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '11 · AGENT 4',
    title: 'Agent 4：PRD Writer Agent',
    subtitle: '生成标准PRD。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>用户画像、需求清单、功能方案</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>组织PRD结构</li><li>补充功能说明</li><li>生成验收标准</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>背景</li><li>目标</li><li>用户</li><li>功能</li><li>流程</li><li>验收标准</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '12 · AGENT 5',
    title: 'Agent 5：Review Agent',
    subtitle: '模拟产品负责人评审。',
    body: `
      <div class="grid3">
        <div class="card"><h3>输入</h3><p>PRD Writer生成的PRD</p></div>
        <div class="card tone"><h3>处理逻辑</h3><ul><li>需求是否明确</li><li>功能是否合理</li><li>是否缺少边界情况</li><li>质量评分</li></ul></div>
        <div class="card tone2"><h3>输出</h3><ul><li>PRD质量评分</li><li>问题列表</li><li>修改建议</li></ul></div>
      </div>
    `,
  },
  {
    kicker: '13 · FEATURES',
    title: '功能模块设计',
    subtitle: 'F1至F7覆盖产品经理完整工作流。',
    body: `
      <table class="table">
        <thead><tr><th>功能</th><th>用户价值</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>F1 多源需求输入</td><td>减少人工整理</td><td>已实现</td></tr>
          <tr><td>F2 AI需求洞察</td><td>快速获得用户问题与机会</td><td>已实现</td></tr>
          <tr><td>F3 用户画像生成</td><td>统一用户理解</td><td>已实现</td></tr>
          <tr><td>F4 AI需求池管理</td><td>可维护的需求池</td><td>已实现</td></tr>
          <tr><td>F5 功能方案设计</td><td>快速评估产品方案</td><td>已实现</td></tr>
          <tr><td>F6 PRD自动生成</td><td>减少重复撰写</td><td>已实现</td></tr>
          <tr><td>F7 AI PRD Review</td><td>提前发现问题</td><td>已实现</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    kicker: '14 · COMPETITIVE ANALYSIS',
    title: '竞品分析',
    subtitle: 'PRD Copilot的机会是垂直产品经理工作流Agent。',
    body: `
      <table class="table">
        <thead><tr><th>产品</th><th>优势</th><th>不足</th><th>PRD Copilot机会</th></tr></thead>
        <tbody>
          <tr><td>ChatGPT</td><td>通用能力强</td><td>缺少产品工作流</td><td>垂直Agent工作流</td></tr>
          <tr><td>Notion AI</td><td>文档能力强</td><td>缺少需求理解</td><td>需求到PRD的转化</td></tr>
          <tr><td>Jira AI</td><td>研发协作强</td><td>产品设计能力有限</td><td>产品设计到评审闭环</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    kicker: '15 · MVP DESIGN',
    title: 'MVP设计',
    subtitle: '验证AI能否降低需求分析和PRD撰写成本。',
    body: `
      <div class="grid2">
        <div class="card"><h3>MVP必须包含</h3><ul><li>需求素材输入</li><li>用户画像生成</li><li>需求拆解</li><li>功能设计</li><li>PRD生成</li><li>AI Review</li></ul></div>
        <div class="card tone"><h3>暂不包含</h3><ul><li>实时协作</li><li>企业知识库</li><li>复杂权限系统</li></ul></div>
      </div>
      <div class="hint">成功标准：PRD初稿生成时间30秒内，需求完整率不低于85%。</div>
    `,
  },
  {
    kicker: '16 · AI WORKFLOW',
    title: 'Agent工作流',
    subtitle: '五个Agent协作，人工在环。',
    shot: true,
    body: `
      <div class="flow">
        <div class="flow-step"><b>Agent1</b><span>Research</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent2</b><span>Requirement</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent3</b><span>Designer</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent4</b><span>Writer</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Agent5</b><span>Review</span></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><b>Human</b><span>确认</span></div>
      </div>
    `,
  },
  {
    kicker: '17 · PROMPT ENGINEERING',
    title: 'Prompt工程设计',
    subtitle: '五个Agent分别使用结构化Prompt模板。',
    body: `
      <div class="prompt-box"><b>Research：</b>理解访谈与资料，输出用户问题、场景、机会
<b>Requirement：</b>将洞察转化为用户故事与P0/P1/P2
<b>Designer：</b>生成功能模块、用户流程、业务规则
<b>Writer：</b>按标准结构生成PRD
<b>Review：</b>模拟负责人评审，输出评分与建议</div>
    `,
  },
  {
    kicker: '18 · METRICS',
    title: '产品指标体系',
    subtitle: 'North Star Metric：有效PRD产出效率。',
    body: `
      <table class="table">
        <thead><tr><th>类型</th><th>指标</th><th>目标</th></tr></thead>
        <tbody>
          <tr><td>效率</td><td>PRD初稿生成时间</td><td>30秒内</td></tr>
          <tr><td>质量</td><td>PRD完整度评分</td><td>不低于85分</td></tr>
          <tr><td>体验</td><td>用户满意度</td><td>4分以上（5分制）</td></tr>
          <tr><td>业务</td><td>需求评审通过率</td><td>提升30%</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    kicker: '19 · PORTFOLIO VALUE',
    title: '作品集展示价值',
    subtitle: '从产品背景到Agent设计，再到指标体系验证。',
    body: `
      <div class="grid3">
        <div class="card tone"><h3>产品故事线</h3><p>产品经理大量时间被整理占用，AI Agent辅助完成需求发现、分析、设计和评审。</p></div>
        <div class="card"><h3>页面结构</h3><p>官网、原型、20页PDF、PRD V2.0、完整方案。</p></div>
        <div class="card tone2"><h3>面试逻辑</h3><p>背景 → 痛点 → AI机会 → Agent设计 → 产品方案 → MVP验证 → 未来规划。</p></div>
      </div>
    `,
  },
];

const PROJECTS = [
  {
    name: 'ai-comment-insight',
    title: 'AI海外用户声音洞察 Agent',
    product: 'InsightPulse',
    asset: 'dashboard.png',
    sections: A_SECTIONS,
    palette: {
      bg: '#f4ecdf',
      surface: '#fdf9f1',
      ink: '#3b3329',
      muted: '#77695a',
      sky: '#7ba8cc',
      warm: '#b97946',
      border: 'rgba(59,51,41,.14)',
    },
  },
  {
    name: 'ai-prd-assistant',
    title: 'AI产品需求文档助手',
    product: 'PRD Copilot',
    asset: 'studio.png',
    sections: C_SECTIONS,
    palette: {
      bg: '#eaf6fc',
      surface: '#ffffff',
      ink: '#26333d',
      muted: '#64747f',
      sky: '#b0d2de',
      warm: '#f3a479',
      border: 'rgba(38,51,61,.12)',
    },
  },
];

function slideHtml(project, index) {
  const p = project.palette;
  const s = project.sections[index];
  const shot = s.shot ? `<div class="shot"><img src="../assets/${project.asset}" alt="原型截图"></div>` : '';
  return `
    <section class="slide">
      <div class="top"><span>${project.product}</span><span>${String(index + 2).padStart(2, '0')} / ${project.sections.length + 1}</span></div>
      <div class="kicker">${s.kicker}</div>
      <h1>${s.title}</h1>
      <p class="subtitle">${s.subtitle}</p>
      <div class="content">${s.body}</div>
      ${shot}
    </section>
  `;
}

function buildHtml(project) {
  const p = project.palette;
  const slides = [coverHtml(project), ...project.sections.map((_, i) => slideHtml(project, i))].join('');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  :root { --bg: ${p.bg}; --surface: ${p.surface}; --ink: ${p.ink}; --muted: ${p.muted}; --sky: ${p.sky}; --warm: ${p.warm}; --border: ${p.border}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Avenir Next", "SF Pro Display", "Helvetica Neue", sans-serif; background: var(--bg); }
  .slide { width: 1280px; height: 720px; padding: 44px 56px; background: var(--bg); color: var(--ink); display: flex; flex-direction: column; page-break-after: always; overflow: hidden; }
  .cover { width: 1280px; height: 720px; background: var(--bg); color: var(--ink); padding: 70px 80px; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
  .cover .product { font-size: 14px; letter-spacing: .18em; color: var(--sky); font-weight: 800; text-transform: uppercase; }
  .cover h1 { font-size: 58px; line-height: 1.08; letter-spacing: -.03em; margin-top: 18px; }
  .cover p { color: var(--muted); font-size: 17px; line-height: 1.6; margin-top: 22px; max-width: 820px; }
  .cover .tags { margin-top: 28px; display: flex; gap: 8px; flex-wrap: wrap; }
  .cover .tags span { border: 1px solid var(--border); border-radius: 999px; padding: 6px 13px; font-size: 11px; color: var(--muted); }
  .top { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 24px; }
  .kicker { font-size: 11px; font-weight: 800; letter-spacing: .16em; color: var(--sky); text-transform: uppercase; }
  h1 { font-size: 34px; line-height: 1.15; letter-spacing: -.02em; margin-top: 10px; }
  .subtitle { color: var(--muted); font-size: 12.5px; margin-top: 8px; }
  .content { flex: 1; display: flex; flex-direction: column; gap: 10px; margin-top: 18px; min-height: 0; }
  .hypothesis { background: var(--ink); color: var(--bg); border-radius: 10px; padding: 14px 18px; font-size: 14px; font-weight: 800; }
  .hypothesis span { color: var(--sky); }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 13px 15px; }
  .card.tone { border-color: var(--sky); }
  .card.tone2 { border-color: var(--warm); }
  .card h3 { font-size: 13px; margin-bottom: 6px; }
  .card p, .card li { font-size: 11px; line-height: 1.45; color: var(--muted); }
  .card ul { list-style: none; }
  .card li { padding: 3px 0 3px 12px; position: relative; }
  .card li::before { content: ""; position: absolute; left: 0; top: 9px; width: 5px; height: 5px; border-radius: 50%; background: var(--sky); }
  .table { width: 100%; border-collapse: collapse; font-size: 10.5px; line-height: 1.4; }
  .table th, .table td { border: 1px solid var(--border); padding: 7px 9px; text-align: left; vertical-align: top; }
  .table th { background: var(--surface); font-weight: 800; }
  .opp-row { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 8px; }
  .opp-row .cell { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
  .opp-row .cell b { display: block; font-size: 9px; color: var(--muted); margin-bottom: 2px; }
  .opp-row .cell p { font-size: 10.5px; line-height: 1.4; color: var(--ink); }
  .opp-row .cell.opp { border-color: var(--sky); }
  .flow { display: flex; gap: 6px; align-items: stretch; }
  .flow-step { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
  .flow-step b { display: block; font-size: 12px; }
  .flow-step span { display: block; font-size: 9px; color: var(--muted); margin-top: 3px; }
  .flow-arrow { align-self: center; color: var(--sky); font-weight: 900; font-size: 16px; }
  .prompt-box { background: var(--ink); color: var(--surface); border-radius: 10px; padding: 14px 16px; font-size: 10px; line-height: 1.6; white-space: pre-wrap; }
  .prompt-box b { color: var(--sky); }
  .hint { background: var(--surface); border: 1px dashed var(--border); border-radius: 8px; padding: 8px 11px; font-size: 10px; color: var(--muted); }
  .shot { margin-top: 12px; }
  .shot img { width: 100%; max-height: 230px; object-fit: cover; object-position: top; border-radius: 10px; border: 1px solid var(--border); }
</style>
</head>
<body>${slides}</body>
</html>`;
}

function coverHtml(project) {
  const tags = ['需求分析', '产品设计', 'Agent工作流', 'MVP验证'];
  return `
    <section class="cover">
      <div class="product">${project.product}</div>
      <h1>${project.title}</h1>
      <p>${project.sections[0].subtitle}</p>
      <div class="tags">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
    </section>
  `;
}

(async () => {
  const browser = await playwright.chromium.launch({ executablePath: SYSTEM_CHROME || undefined });
  for (const project of PROJECTS) {
    const projectDir = join(root, 'projects', project.name);
    const outDir = join(projectDir, 'portfolio');
    mkdirSync(outDir, { recursive: true });
    const sourceFile = join(outDir, 'source.html');
    const pdfFile = join(outDir, `${project.name}.pdf`);
    writeFileSync(sourceFile, buildHtml(project), 'utf8');
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(pathToFileURL(sourceFile).href, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }))));
    const overflow = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.slide, .cover')).map((el, i) => ({
        page: i + 1,
        diff: el.scrollHeight - el.clientHeight,
      }))
    );
    const bad = overflow.filter((o) => o.diff > 1);
    if (bad.length) {
      throw new Error(`OVERFLOW ${JSON.stringify(bad)}`);
    }
    await page.pdf({
      path: pdfFile,
      width: '1280px',
      height: '720px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await page.close();
    console.log('PROJECT_PDF_WRITTEN', pdfFile);
  }
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
