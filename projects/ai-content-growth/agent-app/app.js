(function () {
  'use strict';

  const STORAGE_KEY = 'agent-growth-state-v1';
  let AGENT_API_URL = window.AGENT_API_URL || localStorage.getItem('agentApiUrl') || '';

  let backendEngine = null;

  const DEFAULT_STATE = {
    brand: {
      name: 'Aurora',
      positioning: '为都市通勤族设计的便携随行咖啡机',
      audience: '25至35岁通勤白领、露营与旅行爱好者',
      tone: '简洁、真实、带一点幽默；不夸大功效，不用绝对化表达。',
      sellingPoints: ['20秒快速萃取', '0.3kg轻便随行', '兼容咖啡粉与胶囊', 'USB-C充电'],
      markets: ['US', 'UK', 'JP', 'SG'],
      taboos: ['不夸大功效', '不用绝对化表达', '不调侃通勤事故'],
    },
    teardown: null,
    variants: [],
    vault: [],
    records: [],
    activeStep: 1,
    selectedVariantIndex: 0,
    selectedMarkets: ['US', 'UK', 'JP'],
  };

  const state = loadState();

  const $ = (id) => document.getElementById(id);

  async function checkBackend() {
    const chip = document.getElementById('engineChip');
    if (!AGENT_API_URL) {
      backendEngine = 'mock';
      if (chip) chip.textContent = '本地模拟引擎';
      return;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${AGENT_API_URL}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        backendEngine = data.engine || 'mock';
        if (chip) chip.textContent = backendEngine === 'mock' ? '本地模拟引擎' : '真实LLM引擎';
        return;
      }
    } catch (err) {
      // backend offline
    }
    backendEngine = 'mock';
    if (chip) chip.textContent = '本地模拟引擎';
  }

  async function callBackend(task, payload) {
    if (backendEngine === 'mock') return null;
    try {
      const res = await fetch(`${AGENT_API_URL}/api/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, ...payload }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.ok ? data.data : null;
    } catch (err) {
      return null;
    }
  }

  const MARKET_LOCALIZATION = {
    US: {
      label: '美国',
      scene: 'morning commute, campsite, office',
      cta: 'Grab yours before the next meeting.',
      toneNote: '口语化、直接，突出效率与自由',
      flavors: [
        'Skip the line. Your espresso is already waiting.',
        'Your commute just got a caffeine upgrade.',
        'A 20-second espresso shot, anywhere you land.',
      ],
    },
    UK: {
      label: '英国',
      scene: 'the morning train, the campsite, the desk',
      cta: 'Make it part of your routine.',
      toneNote: '英式幽默，使用queue与flat white等本地表达',
      flavors: [
        'No more queuing for coffee.',
        'Your flat white, 20 seconds from nowhere.',
        'Small enough for your bag, strong enough for your day.',
      ],
    },
    JP: {
      label: '日本',
      scene: '朝の通勤、キャンプ、オフィス',
      cta: '次の予定の前に、20秒で。',
      toneNote: '简洁礼貌，突出“不排队”与“随身”',
      flavors: [
        '並ばずに、20秒で。',
        'カバンに入る、朝の味方。',
        'オフィスでもキャンプでも、一杯のエスプレッソを。',
      ],
    },
    SG: {
      label: '新加坡',
      scene: 'MRT ride, hot afternoons, campsite',
      cta: 'Your next kopi, made in 20 seconds.',
      toneNote: '使用kopi、MRT等本地语境，突出热带天气场景',
      flavors: [
        'No queue. No heat. Just coffee.',
        'Your 20-second kopi break.',
        'From the MRT to the campsite, coffee follows you.',
      ],
    },
  };

  const PLATFORM_RULES = {
    TikTok: {
      label: 'TikTok',
      format: '短视频口播',
      hook: '第1秒抛痛点',
      hashtags: ['#coffee', '#morningroutine'],
    },
    Instagram: {
      label: 'Instagram',
      format: '图文与Reels',
      hook: '场景带入',
      hashtags: ['#coffeetime', '#lifestyle'],
    },
    'YouTube Shorts': {
      label: 'YouTube Shorts',
      format: '竖屏短视频',
      hook: '问题开场',
      hashtags: ['#shorts', '#coffee'],
    },
  };

  const PIPELINE_STAGES = ['输入解析', 'Prompt处理', '知识检索', 'LLM生成', '质量检查', '输出'];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      return {
        ...JSON.parse(JSON.stringify(DEFAULT_STATE)),
        ...parsed,
        brand: { ...DEFAULT_STATE.brand, ...(parsed.brand || {}) },
      };
    } catch (err) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async function runAgent(taskLabel, onDone) {
    const stageEl = $('pipelineStage');
    const barEl = $('pipelineBar');
    stageEl.textContent = `${taskLabel} · 输入解析`;
    barEl.style.width = '10%';
    appendLog(`${taskLabel} 开始`, 'start');
    for (let i = 0; i < PIPELINE_STAGES.length; i += 1) {
      stageEl.textContent = `${taskLabel} · ${PIPELINE_STAGES[i]}`;
      barEl.style.width = `${Math.round(((i + 1) / PIPELINE_STAGES.length) * 100)}%`;
      appendLog(`${taskLabel} · ${PIPELINE_STAGES[i]}`);
      await sleep(260);
    }
    stageEl.textContent = `${taskLabel} · 完成`;
    barEl.style.width = '100%';
    appendLog(`${taskLabel} 完成`, 'done');
    await sleep(160);
    await onDone();
    stageEl.textContent = '待命';
    barEl.style.width = '0%';
  }

  function hasKeyword(text, keys) {
    return keys.some((key) => text.includes(key));
  }

  function buildTeardown(input, platform, account) {
    const text = input.toLowerCase();
    const sellingPoints = [];
    if (hasKeyword(text, ['20 seconds', '20秒'])) sellingPoints.push('20秒快速萃取');
    if (hasKeyword(text, ['pocket', 'backpack', 'portable', '0.3kg', '0.3公斤', '随身'])) {
      sellingPoints.push('便携随行');
    }
    if (hasKeyword(text, ['anywhere', 'work', 'cafe', '露营', '办公室', '通勤'])) {
      sellingPoints.push('全场景使用');
    }
    if (hasKeyword(text, ['usb', 'charge', '充电'])) sellingPoints.push('USB-C充电');
    if (sellingPoints.length === 0) sellingPoints.push('便携咖啡体验');

    const platformRule = PLATFORM_RULES[platform] || PLATFORM_RULES.TikTok;

    return {
      id: Date.now(),
      title: '便携咖啡机 · 效率型爆款结构',
      sourcePlatform: platform,
      accountType: account,
      createdAt: new Date().toISOString(),
      userProfile: [
        '25至35岁通勤白领与户外爱好者',
        '核心诉求：节省排队时间、随时喝到咖啡',
        '消费场景：通勤、办公室、露营、旅行',
        '内容证据：从“等待咖啡”这一日常痛点切入',
      ],
      contentStructure: [
        `钩子（${platformRule.hook}）：用“等15分钟”制造时间焦虑`,
        '转折：展示20秒出杯，打破排队认知',
        '卖点呈现：便携、轻量、全场景使用',
        '行动号召：强化“不再为咖啡排队”的情绪结果',
      ],
      emotionTriggers: [
        '时间焦虑：不想再为咖啡浪费时间',
        '效率认同：20秒出杯符合快节奏生活',
        '场景代入：通勤与户外场景可被想象',
        '社交认同：晒出“随身咖啡”形成生活方式标签',
      ],
      coreSellingPoints: sellingPoints,
      viralityReasons: [
        '痛点开场足够具体，第一句就给出冲突',
        '“20秒”“0.3kg”等数字让卖点可验证',
        '场景覆盖面广，能触发通勤和户外两类人群',
        '结尾行动号召简短，容易引导互动与转发',
      ],
    };
  }

  function buildVariants(teardown, markets, platform, count, brand) {
    const rule = PLATFORM_RULES[platform] || PLATFORM_RULES.TikTok;
    const sellingText = brand.sellingPoints.slice(0, 2).join('; ');
    const variants = [];
    markets.forEach((market, marketIndex) => {
      const loc = MARKET_LOCALIZATION[market] || MARKET_LOCALIZATION.US;
      for (let i = 0; i < count; i += 1) {
        const flavor = loc.flavors[i % loc.flavors.length];
        const body = [
          flavor,
          `${brand.name}: ${sellingText}.`,
          `${loc.scene}. ${loc.cta}`,
          rule.hashtags.join(' '),
        ].join('\n');
        variants.push({
          id: Date.now() + marketIndex * 100 + i,
          title: `${market} · ${platform} · 变体 ${i + 1}`,
          market,
          marketLabel: loc.label,
          platform,
          body,
          keptSellingPoints: teardown.coreSellingPoints.slice(),
          changedAspects: [
            `表达方式：${loc.toneNote}`,
            `用户场景：${loc.scene}`,
            `平台格式：${rule.format}`,
          ],
          score: null,
        });
      }
    });
    return variants;
  }

  function evaluateVariant(variant, platform) {
    const body = variant.body || '';
    const rule = PLATFORM_RULES[platform] || PLATFORM_RULES.TikTok;
    let attractiveness = 72;
    let conversion = 70;
    let platformFit = 74;

    if (body.length >= 80 && body.length <= 220) attractiveness += 12;
    if (/20 second|20秒|\d+/.test(body)) attractiveness += 6;
    if (/no more|no queue|並ばず|skip|grab|next|routine/.test(body)) attractiveness += 5;
    if (variant.keptSellingPoints && variant.keptSellingPoints.length >= 2) conversion += 10;
    if (/Grab|Make it|次の予定|kopi/.test(body)) conversion += 8;
    if (variant.changedAspects && variant.changedAspects.length >= 3) platformFit += 8;
    if (rule.hashtags.every((tag) => body.includes(tag))) platformFit += 7;

    attractiveness = Math.min(96, attractiveness);
    conversion = Math.min(96, conversion);
    platformFit = Math.min(96, platformFit);

    const total = Math.round((attractiveness + conversion + platformFit) / 3);
    const verdict = total >= 80 ? '通过' : total >= 70 ? '需修改' : '不建议发布';

    return {
      scores: {
        attractiveness: Math.min(95, attractiveness + 3),
        conversion: Math.min(95, conversion + 2),
        platformFit: Math.min(95, platformFit + 2),
      },
      total,
      verdict,
      reasons: [
        `钩子强度：${attractiveness >= 82 ? '开场冲突明确' : '开场冲突可加强'}`,
        `卖点保留：核心卖点已保留，转化路径完整`,
        `本地化：表达方式与用户场景已按${variant.marketLabel || variant.market}调整`,
        `平台格式：${rule.format}适配${platformFit >= 82 ? '良好' : '需补充标签'}`,
      ],
      suggestions: [
        '缩短第一句，把数字或冲突提前到前8个字',
        '在结尾增加一次明确的行动指令',
        '补充一条本地用户熟悉的场景细节',
      ],
    };
  }

  function renderTeardown() {
    const t = state.teardown;
    if (!t) return;
    $('teardownTitle').textContent = t.title;
    fillList('outProfile', t.userProfile);
    fillList('outStructure', t.contentStructure);
    fillList('outEmotion', t.emotionTriggers);
    fillList('outSelling', t.coreSellingPoints);
    fillList('outReason', t.viralityReasons);
    $('teardownEmpty').classList.add('hidden');
    $('teardownOutput').classList.remove('hidden');
    $('rewriteBtn').disabled = false;
  }

  function fillList(id, items) {
    const el = $(id);
    el.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderVariantList() {
    const list = $('variantList');
    const empty = $('rewriteEmpty');
    if (!state.variants.length) {
      list.classList.add('hidden');
      empty.classList.remove('hidden');
      $('evalBtn').disabled = true;
      return;
    }
    empty.classList.add('hidden');
    list.classList.remove('hidden');
    const summary = $('variantSummary');
    summary.classList.remove('hidden');
    const marketCount = new Set(state.variants.map((v) => v.market)).size;
    summary.innerHTML = `
      <span class="result-summary-label">生成结果</span>
      <span>${state.variants.length}个变体 · ${marketCount}个市场</span>
    `;
    list.innerHTML = state.variants
      .map(
        (v, index) => `
        <article class="variant-card">
          <div class="variant-top">
            <span class="variant-title">${escapeHtml(v.title)}</span>
            <span class="variant-top-right">
              <span class="status-chip status-ok">已生成</span>
              <span class="variant-market">${escapeHtml(v.marketLabel)} · ${escapeHtml(v.platform)}</span>
            </span>
          </div>
          <div class="variant-body">${escapeHtml(v.body)}</div>
          <div class="variant-notes">
            ${v.keptSellingPoints.map((p) => `<span class="note-chip keep">保留：${escapeHtml(p)}</span>`).join('')}
            ${v.changedAspects.map((p) => `<span class="note-chip change">${escapeHtml(p)}</span>`).join('')}
          </div>
        </article>
      `
      )
      .join('');
    renderEvalOptions();
    $('evalBtn').disabled = false;
    refreshIcons();
  }

  function renderEvalOptions() {
    const select = $('evalVariant');
    if (!state.variants.length) {
      select.innerHTML = '<option value="-1">暂无内容</option>';
      return;
    }
    select.innerHTML = state.variants
      .map(
        (v, index) =>
          `<option value="${index}">${escapeHtml(v.title)}</option>`
      )
      .join('');
    select.value = String(Math.min(state.selectedVariantIndex, state.variants.length - 1));
  }

  function renderEval() {
    const index = Number($('evalVariant').value || 0);
    const variant = state.variants[index];
    if (!variant) return;
    const platform = $('evalPlatform').value;
    const result = variant.score || evaluateVariant(variant, platform);
    variant.score = result;
    $('evalEmpty').classList.add('hidden');
    $('evalOutput').classList.remove('hidden');
    const s = result.scores;
    const scoreHtml = [
      { key: '吸引力', value: s.attractiveness, note: '钩子强度与情绪价值' },
      { key: '转化潜力', value: s.conversion, note: '卖点清晰度与行动号召' },
      { key: '平台适配度', value: s.platformFit, note: '格式、语言与社区规则' },
    ]
      .map(
        (item) => `
        <div class="score-box">
          <div class="score-label">${item.key}</div>
          <div class="score-value">${item.value}</div>
          <div class="score-track"><span style="width:${item.value}%"></span></div>
          <p>${item.note}</p>
        </div>
      `
      )
      .join('');
    $('scoreGrid').innerHTML = scoreHtml;
    $('evalDetail').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3>评估结论</h3>
        <span class="verdict">${result.verdict} · ${result.total}分</span>
      </div>
      <ul>${result.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      <h3 style="margin-top:10px">修改建议</h3>
      <ul>${result.suggestions.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
    `;
    state.selectedVariantIndex = index;
    renderHandoff(variant, result);
    saveState();
    refreshIcons();
  }

  function renderHandoff(variant, result) {
    if (!variant) {
      $('handoffTitle').textContent = '暂无内容';
      $('handoffBody').textContent = '完成评估后生成交付摘要';
      $('handoffBrand').textContent = state.brand.name;
      $('handoffMarket').textContent = '-';
      $('handoffPlatform').textContent = '-';
      $('handoffScore').textContent = '-';
      $('approveBtn').disabled = true;
      $('copyBtn').disabled = true;
      return;
    }
    const score = result || (variant.score ? variant.score : evaluateVariant(variant, variant.platform || 'TikTok'));
    $('handoffTitle').textContent = variant.title;
    $('handoffBody').textContent = variant.body;
    $('handoffBrand').textContent = state.brand.name;
    $('handoffMarket').textContent = variant.marketLabel || variant.market;
    $('handoffPlatform').textContent = variant.platform;
    $('handoffScore').textContent = `${score.total}分 · ${score.verdict}`;
    $('approveBtn').disabled = false;
    $('copyBtn').disabled = false;
  }

  function renderBrand() {
    $('brandName').value = state.brand.name;
    $('brandPositioning').value = state.brand.positioning;
    $('brandAudience').value = state.brand.audience;
    $('brandTone').value = state.brand.tone;
    $('miniBrandName').textContent = state.brand.name;
    renderChips('sellingList', state.brand.sellingPoints, 'selling');
    renderChips('marketList', state.brand.markets, 'market');
    renderChips('tabooList', state.brand.taboos, 'taboo');
  }

  function renderRewriteMarkets() {
    const wrap = $('rewriteMarkets');
    if (!wrap) return;
    wrap.innerHTML = state.brand.markets
      .map((market) => {
        const selected = state.selectedMarkets.includes(market);
        const label = MARKET_LOCALIZATION[market] ? MARKET_LOCALIZATION[market].label : market;
        return `<button type="button" class="chip market ${selected ? 'selected' : ''}" data-market="${market}">${escapeHtml(label)}</button>`;
      })
      .join('');
  }

  function renderChips(listId, items, type) {
    const list = $(listId);
    list.innerHTML = items
      .map((item, index) => {
        if (type === 'market') {
          return `
            <span class="chip market">
              ${escapeHtml(item)}
              <button data-remove="market" data-index="${index}" title="移除"><i data-lucide="x"></i></button>
            </span>
          `;
        }
        return `
          <span class="chip">
            ${escapeHtml(item)}
            <button data-remove="${type}" data-index="${index}" title="移除"><i data-lucide="x"></i></button>
          </span>
        `;
      })
      .join('');
    refreshIcons();
  }

  function renderVault() {
    const list = $('vaultList');
    $('vaultCount').textContent = `${state.vault.length}个模板`;
    if (!state.vault.length) {
      list.innerHTML = `<div class="empty-state"><i data-lucide="flame"></i><p>暂无爆款模板</p></div>`;
      refreshIcons();
      return;
    }
    list.innerHTML = state.vault
      .map(
        (t, index) => `
        <article class="vault-card">
          <h3>${escapeHtml(t.title)}</h3>
          <p>${escapeHtml(t.sourcePlatform)} · ${escapeHtml(t.accountType)} · ${t.coreSellingPoints.slice(0, 2).join(' / ')}</p>
          <div class="vault-actions">
            <button class="btn sm" data-use-vault="${index}"><i data-lucide="wand"></i><span>使用模板</span></button>
            <button class="btn ghost sm" data-remove-vault="${index}"><i data-lucide="trash-2"></i><span>删除</span></button>
          </div>
        </article>
      `
      )
      .join('');
    refreshIcons();
  }

  function renderRecords() {
    const list = $('recordList');
    $('recordCount').textContent = `${state.records.length}条内容`;
    if (!state.records.length) {
      list.innerHTML = `<div class="empty-state"><i data-lucide="file-text"></i><p>暂无内容记录</p></div>`;
      refreshIcons();
      return;
    }
    list.innerHTML = state.records
      .map(
        (r, index) => `
        <article class="record-row">
          <div>
            <div class="record-title">${escapeHtml(r.title)}</div>
            <div class="record-sub">${escapeHtml(r.marketLabel || r.market)} · ${escapeHtml(r.platform)} · ${new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="record-cell">${r.score ? `${r.score.total}分` : '未评分'}</div>
          <div class="record-cell">${escapeHtml(r.body.slice(0, 26))}...</div>
          <span class="record-status">${escapeHtml(r.status)}</span>
          <div style="display:flex;gap:6px">
            <button class="btn sm" data-view-record="${index}"><i data-lucide="eye"></i><span>查看</span></button>
            <button class="btn ghost sm" data-remove-record="${index}"><i data-lucide="trash-2"></i><span>删除</span></button>
          </div>
        </article>
      `
      )
      .join('');
    refreshIcons();
  }

  function renderWorkbench() {
    document.querySelectorAll('.step').forEach((el) => {
      const step = Number(el.dataset.step);
      el.classList.toggle('active', step === state.activeStep);
    });
    for (let i = 1; i <= 4; i += 1) {
      $(`panel-${i}`).classList.toggle('active', i === state.activeStep);
    }
    if (state.teardown) {
      renderTeardown();
    } else {
      $('teardownEmpty').classList.remove('hidden');
      $('teardownOutput').classList.add('hidden');
      $('rewriteBtn').disabled = true;
    }
    if (state.variants.length) {
      renderVariantList();
      renderHandoff(state.variants[state.selectedVariantIndex] || null, null);
    } else {
      $('rewriteEmpty').classList.remove('hidden');
      $('variantList').classList.add('hidden');
      $('variantSummary').classList.add('hidden');
      $('evalEmpty').classList.remove('hidden');
      $('evalOutput').classList.add('hidden');
      $('evalBtn').disabled = true;
      renderHandoff(null, null);
    }
  }

  function renderAll() {
    renderBrand();
    renderRewriteMarkets();
    renderWorkbench();
    renderVault();
    renderRecords();
    refreshIcons();
  }

  function goStep(step) {
    if (step > 2 && !state.teardown) {
      toast('请先完成爆款拆解');
      return;
    }
    if (step > 3 && !state.variants.length) {
      toast('请先生成内容变体');
      return;
    }
    state.activeStep = step;
    renderWorkbench();
    saveState();
  }

  function showView(name) {
    document.querySelectorAll('.nav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === name);
    });
    document.querySelectorAll('.view').forEach((el) => {
      el.classList.toggle('active', el.id === `view-${name}`);
    });
    const titles = {
      workbench: 'Agent工作台',
      brand: '品牌知识库',
      vault: '爆款库',
      records: '内容记录',
    };
    $('viewTitle').firstChild.textContent = titles[name] || 'Agent工作台';
    renderAll();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-growth-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('已导出JSON');
  }

  function newTask() {
    if (!window.confirm('清空当前任务？品牌知识库会保留。')) return;
    state.teardown = null;
    state.variants = [];
    state.activeStep = 1;
    state.selectedVariantIndex = 0;
    state.selectedMarkets = ['US', 'UK', 'JP'];
    saveState();
    renderAll();
    toast('已新建任务');
  }

  function bindEvents() {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => showView(btn.dataset.view));
    });

    document.querySelectorAll('.step').forEach((btn) => {
      btn.addEventListener('click', () => goStep(Number(btn.dataset.step)));
    });

    $('teardownBtn').addEventListener('click', async () => {
      const input = $('sourceInput').value.trim();
      if (!input) {
        toast('请输入竞品内容');
        return;
      }
      $('teardownBtn').disabled = true;
      await runAgent('爆款拆解', async () => {
        const remote = await callBackend('teardown', {
          input,
          platform: $('sourcePlatform').value,
          account: $('sourceAccount').value,
        });
        if (remote) {
          state.teardown = { ...remote, id: Date.now(), createdAt: new Date().toISOString() };
        } else {
          state.teardown = buildTeardown(input, $('sourcePlatform').value, $('sourceAccount').value);
        }
        state.variants = [];
        saveState();
        renderTeardown();
        renderVault();
        renderRecords();
        refreshIcons();
        toast('爆款拆解完成');
        $('teardownBtn').disabled = false;
      });
    });

    $('saveTeardownBtn').addEventListener('click', () => {
      if (!state.teardown) return;
      const exists = state.vault.some((t) => t.id === state.teardown.id);
      if (!exists) state.vault.push({ ...state.teardown });
      saveState();
      renderVault();
      toast('已存入爆款库');
    });

    $('rewriteBtn').addEventListener('click', async () => {
      if (!state.teardown) return;
      const markets = state.selectedMarkets.filter((market) => state.brand.markets.includes(market));
      if (!markets.length) {
        toast('请至少选择一个市场');
        return;
      }
      $('rewriteBtn').disabled = true;
      const count = Number(document.querySelector('#variantCount .seg.active').dataset.value);
      await runAgent('内容重写', async () => {
        const remote = await callBackend('rewrite', {
          teardown: state.teardown,
          markets,
          platform: $('rewritePlatform').value,
          count,
          brand: state.brand,
        });
        state.variants = remote && Array.isArray(remote)
          ? remote.map((v, i) => ({ ...v, id: Date.now() + i }))
          : buildVariants(state.teardown, markets, $('rewritePlatform').value, count, state.brand);
        state.selectedVariantIndex = 0;
        saveState();
        renderVariantList();
        refreshIcons();
        toast(`已生成 ${markets.length * count} 个内容变体`);
        $('rewriteBtn').disabled = false;
      });
    });

    $('evalBtn').addEventListener('click', async () => {
      $('evalBtn').disabled = true;
      await runAgent('质量评估', async () => {
        const index = Number($('evalVariant').value || 0);
        const variant = state.variants[index];
        if (variant) {
          const remote = await callBackend('evaluate', {
            body: variant.body,
            platform: $('evalPlatform').value,
            marketLabel: variant.marketLabel,
            keptSellingPoints: variant.keptSellingPoints,
            changedAspects: variant.changedAspects,
          });
          if (remote) variant.score = remote;
        }
        renderEval();
        refreshIcons();
        toast('评估完成');
        $('evalBtn').disabled = false;
      });
    });

    $('evalVariant').addEventListener('change', () => {
      renderHandoff(state.variants[Number($('evalVariant').value)] || null, null);
    });

    $('approveBtn').addEventListener('click', () => {
      const variant = state.variants[state.selectedVariantIndex];
      if (!variant) return;
      state.records.push({
        id: Date.now(),
        title: variant.title,
        market: variant.market,
        marketLabel: variant.marketLabel,
        platform: variant.platform,
        body: variant.body,
        score: variant.score,
        status: '已交付',
        createdAt: new Date().toISOString(),
      });
      saveState();
      renderRecords();
      toast('已确认交付并写入内容记录');
    });

    $('copyBtn').addEventListener('click', async () => {
      const variant = state.variants[state.selectedVariantIndex];
      if (!variant) return;
      try {
        await navigator.clipboard.writeText(variant.body);
        toast('已复制内容');
      } catch (err) {
        toast('复制失败');
      }
    });

    $('exportBtn').addEventListener('click', exportJson);
    $('newTaskBtn').addEventListener('click', newTask);

    $('engineConfigBtn').addEventListener('click', () => {
      const current = AGENT_API_URL || 'http://127.0.0.1:8787';
      const value = window.prompt('请输入Agent后端地址（留空则使用本地模拟引擎）', current);
      if (value === null) return;
      const trimmed = value.trim();
      if (trimmed) {
        localStorage.setItem('agentApiUrl', trimmed);
        AGENT_API_URL = trimmed;
      } else {
        localStorage.removeItem('agentApiUrl');
        AGENT_API_URL = '';
      }
      checkBackend();
      toast('引擎配置已更新');
    });

    $('saveBrandBtn').addEventListener('click', () => {
      state.brand.name = $('brandName').value.trim() || 'Aurora';
      state.brand.positioning = $('brandPositioning').value.trim();
      state.brand.audience = $('brandAudience').value.trim();
      state.brand.tone = $('brandTone').value.trim();
      saveState();
      renderBrand();
      toast('品牌知识已保存');
    });

    $('addSellingBtn').addEventListener('click', () => addChip('sellingList', 'selling'));
    $('addTabooBtn').addEventListener('click', () => addChip('tabooList', 'taboo'));

    document.querySelectorAll('.chip-list').forEach((list) => {
      list.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('[data-remove]');
        if (removeBtn) {
          const type = removeBtn.dataset.remove;
          const index = Number(removeBtn.dataset.index);
          if (type === 'selling') state.brand.sellingPoints.splice(index, 1);
          if (type === 'market') {
            const removed = state.brand.markets[index];
            state.brand.markets.splice(index, 1);
            state.selectedMarkets = state.selectedMarkets.filter((item) => item !== removed);
          }
          if (type === 'taboo') state.brand.taboos.splice(index, 1);
          saveState();
          renderBrand();
          return;
        }
      });
    });

    $('vaultList').addEventListener('click', (event) => {
      const useBtn = event.target.closest('[data-use-vault]');
      const removeBtn = event.target.closest('[data-remove-vault]');
      if (useBtn) {
        const index = Number(useBtn.dataset.useVault);
        state.teardown = { ...state.vault[index] };
        state.variants = [];
        saveState();
        showView('workbench');
        renderTeardown();
        goStep(2);
        toast('已加载爆款模板');
      }
      if (removeBtn) {
        state.vault.splice(Number(removeBtn.dataset.removeVault), 1);
        saveState();
        renderVault();
      }
    });

    $('recordList').addEventListener('click', (event) => {
      const viewBtn = event.target.closest('[data-view-record]');
      const removeBtn = event.target.closest('[data-remove-record]');
      if (viewBtn) {
        const record = state.records[Number(viewBtn.dataset.viewRecord)];
        if (record) {
          showView('workbench');
          state.activeStep = 4;
          renderHandoff(record, record.score);
          renderWorkbench();
        }
      }
      if (removeBtn) {
        state.records.splice(Number(removeBtn.dataset.removeRecord), 1);
        saveState();
        renderRecords();
      }
    });

    document.querySelectorAll('#variantCount .seg').forEach((seg) => {
      seg.addEventListener('click', () => {
        document.querySelectorAll('#variantCount .seg').forEach((s) => s.classList.remove('active'));
        seg.classList.add('active');
      });
    });

    $('rewriteMarkets').addEventListener('click', (event) => {
      const chip = event.target.closest('[data-market]');
      if (!chip) return;
      const market = chip.dataset.market;
      if (state.selectedMarkets.includes(market)) {
        state.selectedMarkets = state.selectedMarkets.filter((item) => item !== market);
      } else {
        state.selectedMarkets.push(market);
      }
      saveState();
      renderRewriteMarkets();
    });
  }

  function addChip(listId, type) {
    const list = $(listId);
    if (list.querySelector('.chip-add')) return;
    const input = document.createElement('input');
    input.className = 'chip-add';
    input.placeholder = type === 'selling' ? '新增卖点' : '新增禁忌';
    list.appendChild(input);
    input.focus();
    const commit = () => {
      const value = input.value.trim();
      if (value) {
        if (type === 'selling') state.brand.sellingPoints.push(value);
        if (type === 'taboo') state.brand.taboos.push(value);
        saveState();
      }
      input.remove();
      renderBrand();
    };
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') commit();
      if (event.key === 'Escape') input.remove();
    });
    input.addEventListener('blur', commit);
  }

  function init() {
    checkBackend();
    bindEvents();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
