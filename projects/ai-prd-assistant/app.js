(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const PIPELINE_STAGES = ['Agent1 Research', 'Agent2 Requirement', 'Agent3 Product Design', 'Agent4 PRD Writer', 'Agent5 Review'];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function appendLog(message, tone = 'run') {
    const log = $('agentLog');
    if (!log) return;
    const empty = log.querySelector('.log-empty');
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = `log-row log-${tone}`;
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    row.innerHTML = `<span class="log-time">${time}</span><span class="log-text">${escapeHtml(message)}</span>`;
    log.appendChild(row);
    while (log.children.length > 14) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }

  async function runAgent(taskLabel, onDone) {
    const stageEl = $('pipelineStage');
    const barEl = $('pipelineBar');
    stageEl.textContent = `${taskLabel} · Agent1 Research`;
    barEl.style.width = '10%';
    appendLog(`${taskLabel} 开始`, 'start');
    for (let i = 0; i < PIPELINE_STAGES.length; i += 1) {
      stageEl.textContent = `${taskLabel} · ${PIPELINE_STAGES[i]}`;
      barEl.style.width = `${Math.round(((i + 1) / PIPELINE_STAGES.length) * 100)}%`;
      appendLog(`${taskLabel} · ${PIPELINE_STAGES[i]}`);
      await sleep(250);
    }
    stageEl.textContent = `${taskLabel} · 完成`;
    barEl.style.width = '100%';
    appendLog(`${taskLabel} 完成`, 'done');
    await sleep(140);
    onDone();
    stageEl.textContent = '待命';
    barEl.style.width = '0%';
  }

  function buildPrd(product, users, notes) {
    const text = notes.toLowerCase();
    const has = (...keys) => keys.some((key) => text.includes(key));

    const userList = users
      .split(/[、，,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    const personas = [];
    if (userList.some((user) => user.includes('运营')) || has('运营', '数据', '状态')) {
      personas.push({
        name: '运营负责人',
        desc: '需要统一查看内容状态与渠道数据，判断哪些内容值得继续投入。',
      });
    }
    if (userList.some((user) => user.includes('创作')) || has('草稿', '素材', '版本', '发布')) {
      personas.push({
        name: '内容创作者',
        desc: '需要草稿、多版本与素材管理，减少重复整理工作。',
      });
    }
    if (userList.some((user) => user.includes('审核')) || has('审核', '驳回', '通过')) {
      personas.push({
        name: '审核人员',
        desc: '需要清晰的审核流、状态流转和修改意见记录。',
      });
    }
    if (!personas.length) {
      personas.push({
        name: '运营负责人',
        desc: '需要统一的内容管理入口与清晰的状态视图。',
      });
      personas.push({
        name: '内容创作者',
        desc: '需要高效的内容创建、整理与复用能力。',
      });
    }

    const insights = [
      { title: '用户问题', desc: '内容分散在不同表格中，查找和汇总效率低。' },
      { title: '使用场景', desc: '运营需要统一查看内容状态，创作者需要高效整理素材。' },
      { title: '需求机会', desc: '建立统一内容管理后台，覆盖创建、审核、数据与通知。' },
    ];

    const requirements = [
      {
        priority: 'P0',
        title: '用户角色与权限管理',
        story: '作为管理员，我希望为运营、创作者、审核配置不同权限，以便各角色只能看到和操作自己的内容。',
        userValue: '角色职责清晰，减少越权操作',
        businessValue: '降低内容管理风险，保障流程规范',
      },
      {
        priority: 'P0',
        title: '内容草稿与多版本管理',
        story: '作为内容创作者，我希望保存草稿和历史版本，以便随时回退和复用。',
        userValue: '减少重复整理，创作效率提升',
        businessValue: '提高内容产量，降低素材流失',
      },
      {
        priority: 'P1',
        title: '审核流与状态流转',
        story: '作为审核人员，我希望内容按“待审核、通过、驳回”流转，以便发布前完成质量把关。',
        userValue: '审核过程清晰，修改意见可追踪',
        businessValue: '降低错误发布风险，提升内容质量',
      },
      {
        priority: 'P1',
        title: '标签与筛选',
        story: '作为运营人员，我希望通过标签和筛选快速查找内容，以便不再依赖分散表格。',
        userValue: '查找效率提升，信息可复用',
        businessValue: '减少人工检索时间，提升运营效率',
      },
      {
        priority: 'P1',
        title: '渠道数据看板',
        story: '作为运营负责人，我希望查看各渠道内容表现，以便判断内容策略是否有效。',
        userValue: '快速了解内容效果，决策有依据',
        businessValue: '优化内容投入，提升增长效率',
      },
      {
        priority: 'P2',
        title: '通知与提醒',
        story: '作为审核人员，我希望收到待审核提醒，以便及时处理内容发布。',
        userValue: '减少漏审，响应更及时',
        businessValue: '提升发布时效，减少流程阻塞',
      },
    ];

    const modules = [
      { name: '用户中心', desc: '角色、权限与组织成员管理', flow: '管理员创建成员 → 分配角色 → 成员登录查看权限', rules: '管理员可管理角色；普通成员不可修改权限' },
      { name: '内容中心', desc: '草稿、多版本、标签与筛选', flow: '创作者创建草稿 → 保存版本 → 打标签 → 提交审核', rules: '草稿仅创建人可见；提交后不可直接修改' },
      { name: '审核中心', desc: '审核流、状态流转与修改意见', flow: '内容提交 → 待审核 → 通过或驳回 → 通知创建人', rules: '驳回必须填写修改意见；通过后进入发布流程' },
      { name: '数据中心', desc: '渠道表现、内容效果与趋势', flow: '发布内容 → 数据采集 → 看板展示 → 导出报告', rules: '数据按渠道和日期聚合；导出包含时间范围' },
      { name: '通知中心', desc: '待办提醒与状态通知', flow: '状态变化 → 生成通知 → 推送相关角色 → 标记已读', rules: '审核与驳回必须通知；通知可批量已读' },
    ].filter((module) => {
      if (module.name === '用户中心') return has('权限', '角色') || true;
      if (module.name === '内容中心') return true;
      if (module.name === '审核中心') return has('审核', '驳回', '通过') || true;
      if (module.name === '数据中心') return has('数据', '表现', '统计', '效果') || true;
      return has('通知', '提醒', '待审核') || true;
    });

    const outline = [
      '背景与问题',
      '产品目标',
      '目标用户',
      '产品范围',
      '功能需求',
      '交互与页面说明',
      '验收标准',
      '指标与风险',
    ];

    const acceptance = [
      'GIVEN 用户拥有内容创作者权限 WHEN 创建一篇草稿并保存 THEN 草稿进入内容列表且可继续编辑',
      'GIVEN 内容处于待审核状态 WHEN 审核人员选择通过或驳回 THEN 内容状态更新并通知创建人',
    ];

    const risks = [
      { title: '真实LLM输出质量不稳定', desc: '生成内容可能偏离品牌或需求，需要人工复核兜底。' },
      { title: '需求来源信息不足', desc: '访谈记录过短时，画像与需求清单的完整度会下降。' },
      { title: '评审标准主观性强', desc: '不同团队对PRD详略要求不同，需要支持模板自定义。' },
    ];

    const review = {
      score: 86,
      summary: 'PRD结构完整，需求优先级清晰；建议补充异常流程和权限边界说明。',
      issues: [
        '通知中心缺少“免打扰”设置',
        '审核驳回后未明确是否支持重新提交',
        '数据看板缺少权限控制说明',
      ],
      suggestions: [
        '增加通知偏好设置',
        '补充驳回后重新提交流程',
        '补充数据看板角色权限',
      ],
    };

    return {
      product,
      users: userList,
      sourceType: $('sourceSelect').value,
      insights,
      personas,
      requirements,
      modules,
      outline,
      acceptance,
      risks,
      review,
      stats: {
        p0: requirements.filter((item) => item.priority === 'P0').length,
        p1: requirements.filter((item) => item.priority === 'P1').length,
        p2: requirements.filter((item) => item.priority === 'P2').length,
        modules: modules.length,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  function renderPrd(prd) {
    $('docName').textContent = prd.product;
    $('docTitle').textContent = `${prd.product} · 产品需求文档`;
    $('prdStats').innerHTML = `
      <div class="prd-stat"><span>P0需求</span><b>${prd.stats.p0}</b></div>
      <div class="prd-stat"><span>P1需求</span><b>${prd.stats.p1}</b></div>
      <div class="prd-stat"><span>P2需求</span><b>${prd.stats.p2}</b></div>
      <div class="prd-stat"><span>功能模块</span><b>${prd.stats.modules}</b></div>
    `;

    $('insightGrid').innerHTML = prd.insights
      .map(
        (item) => `
        <div class="insight-card">
          <b>${escapeHtml(item.title)}</b>
          <p>${escapeHtml(item.desc)}</p>
        </div>
      `
      )
      .join('');

    $('personaGrid').innerHTML = prd.personas
      .map(
        (persona) => `
        <div class="persona-card">
          <b>${escapeHtml(persona.name)}</b>
          <p>${escapeHtml(persona.desc)}</p>
        </div>
      `
      )
      .join('');

    $('reqBody').innerHTML = prd.requirements
      .map(
        (req) => `
        <tr>
          <td><span class="priority-chip priority-${req.priority.toLowerCase()}">${req.priority}</span></td>
          <td><b>${escapeHtml(req.title)}</b></td>
          <td>${escapeHtml(req.story)}</td>
          <td>${escapeHtml(req.userValue)}</td>
          <td>${escapeHtml(req.businessValue)}</td>
        </tr>
      `
      )
      .join('');

    $('moduleGrid').innerHTML = prd.modules
      .map(
        (module) => `
        <div class="module-card">
          <b>${escapeHtml(module.name)}</b>
          <p>${escapeHtml(module.desc)}</p>
          <p class="module-flow">流程：${escapeHtml(module.flow)}</p>
          <p class="module-rule">规则：${escapeHtml(module.rules)}</p>
        </div>
      `
      )
      .join('');

    $('outlineList').innerHTML = prd.outline.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    $('acceptList').innerHTML = prd.acceptance.map((item) => `<div class="accept-card">${escapeHtml(item)}</div>`).join('');
    $('riskList').innerHTML = prd.risks
      .map(
        (risk) => `
        <div class="risk-card">
          <b>${escapeHtml(risk.title)}</b>
          <p>${escapeHtml(risk.desc)}</p>
        </div>
      `
      )
      .join('');

    $('reviewScore').textContent = `${prd.review.score}分`;
    $('reviewSummary').textContent = prd.review.summary;
    $('reviewIssues').innerHTML = prd.review.issues.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    $('reviewSuggestions').innerHTML = prd.review.suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

    $('emptyState').classList.add('hidden');
    $('prdDoc').classList.remove('hidden');
    window.__lastPrd = prd;
  }

  function buildMarkdown(prd) {
    const lines = [];
    lines.push(`# ${prd.product} · 产品需求文档`);
    lines.push('');
    lines.push('## 0. Research Agent · 需求洞察');
    prd.insights.forEach((item) => {
      lines.push(`- ${item.title}：${item.desc}`);
    });
    lines.push('');
    lines.push('## 1. 用户画像');
    prd.personas.forEach((persona) => {
      lines.push(`- ${persona.name}：${persona.desc}`);
    });
    lines.push('');
    lines.push('## 2. 需求清单');
    prd.requirements.forEach((req) => {
      lines.push(`- [${req.priority}] ${req.title}：${req.story}`);
      lines.push(`  - 用户价值：${req.userValue}`);
      lines.push(`  - 业务价值：${req.businessValue}`);
    });
    lines.push('');
    lines.push('## 3. 功能模块');
    prd.modules.forEach((module) => {
      lines.push(`- ${module.name}：${module.desc}`);
      lines.push(`  - 流程：${module.flow}`);
      lines.push(`  - 规则：${module.rules}`);
    });
    lines.push('');
    lines.push('## 4. PRD大纲');
    prd.outline.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });
    lines.push('');
    lines.push('## 5. 验收标准示例');
    prd.acceptance.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push('');
    lines.push('## 6. 风险与依赖');
    prd.risks.forEach((risk) => {
      lines.push(`- ${risk.title}：${risk.desc}`);
    });
    lines.push('');
    lines.push('## 7. Review Agent · AI PRD Review');
    lines.push(`- 质量评分：${prd.review.score}分`);
    lines.push(`- 评审结论：${prd.review.summary}`);
    prd.review.issues.forEach((item) => {
      lines.push(`- 问题：${item}`);
    });
    prd.review.suggestions.forEach((item) => {
      lines.push(`- 建议：${item}`);
    });
    return lines.join('\n');
  }

  function exportMarkdown() {
    if (!window.__lastPrd) {
      toast('请先生成PRD');
      return;
    }
    const content = buildMarkdown(window.__lastPrd);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${window.__lastPrd.product}-PRD.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('PRD已导出');
  }

  $('generateBtn').addEventListener('click', async () => {
    const product = $('productInput').value.trim();
    const users = $('userInput').value.trim();
    const notes = $('noteInput').value.trim();
    if (!product || !users || !notes) {
      toast('请填写产品名称、目标用户和需求素材');
      return;
    }
    $('generateBtn').disabled = true;
    await runAgent('PRD生成', () => {
      const prd = buildPrd(product, users, notes);
      renderPrd(prd);
      toast('PRD生成完成');
      $('generateBtn').disabled = false;
    });
  });

  $('copyBtn').addEventListener('click', async () => {
    if (!window.__lastPrd) {
      toast('请先生成PRD');
      return;
    }
    try {
      await navigator.clipboard.writeText(buildMarkdown(window.__lastPrd));
      toast('PRD已复制');
    } catch (err) {
      toast('复制失败');
    }
  });

  $('exportBtn').addEventListener('click', exportMarkdown);

  if (window.lucide) window.lucide.createIcons();
})();
