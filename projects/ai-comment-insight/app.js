(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const PIPELINE_STAGES = ['Agent1 数据理解', 'Agent2 情感分析', 'Agent2 主题聚类', 'Agent3 产品策略', 'Agent4 增长内容', '报告输出'];

  const THEME_RULES = [
    {
      key: 'battery',
      label: '续航与充电',
      keywords: ['battery', 'dies', 'charge', 'charging', 'lasts', 'cable'],
      quoteKeyword: ['battery', 'charge'],
      opportunity: '推出续航增强版或充电配件套装，降低差旅场景顾虑',
    },
    {
      key: 'size',
      label: '容量与杯体',
      keywords: ['small', 'size', 'cup', 'bigger', 'tiny', 'capacity'],
      quoteKeyword: ['cup', 'small', 'bigger'],
      opportunity: '增加大容量杯体选项，覆盖办公室与户外双场景',
    },
    {
      key: 'speed',
      label: '加热速度',
      keywords: ['slow', 'wait', 'minutes', 'takes', 'heat', 'temperature', 'longer'],
      quoteKeyword: ['slow', 'takes', 'longer', 'heat'],
      opportunity: '优化加热效率，并补充20秒实测数据增强信任',
    },
    {
      key: 'seal',
      label: '密封防漏',
      keywords: ['leak', 'seal', 'spills', 'bag', 'shake'],
      quoteKeyword: ['leak', 'spills', 'shake'],
      opportunity: '改进密封结构，推出防漏测试与通勤场景内容',
    },
    {
      key: 'clean',
      label: '清洁维护',
      keywords: ['clean', 'brush', 'maintenance', 'wash'],
      quoteKeyword: ['clean', 'brush'],
      opportunity: '增加清洁刷配件与一键清洗引导',
    },
    {
      key: 'ease',
      label: '使用门槛',
      keywords: ['easy', 'confusing', 'app', 'instructions', 'setup', 'hard'],
      quoteKeyword: ['confusing', 'instructions', 'hard'],
      opportunity: '简化说明书与App引导，降低新手使用门槛',
    },
  ];

  const POSITIVE_WORDS = ['love', 'great', 'perfect', 'easy', 'nice', 'awesome', 'recommend', 'fast', 'compact'];
  const NEGATIVE_WORDS = ['bad', 'slow', 'leak', 'dies', 'confusing', 'small', 'poor', 'broke', 'returns', 'hard', 'spills'];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    stageEl.textContent = `${taskLabel} · 数据解析`;
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

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function classifySentiment(text) {
    const lower = text.toLowerCase();
    const positive = POSITIVE_WORDS.some((word) => lower.includes(word));
    const negative = NEGATIVE_WORDS.some((word) => lower.includes(word));
    if (positive && negative) return 'neutral';
    if (positive) return 'positive';
    if (negative) return 'negative';
    return 'neutral';
  }

  function findQuote(text, keywords) {
    const lower = text.toLowerCase();
    return keywords.some((word) => lower.includes(word)) ? text : null;
  }

  function analyzeReviews(input) {
    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    const themes = THEME_RULES.map((rule) => ({
      ...rule,
      count: 0,
      quotes: [],
      negativeCount: 0,
    }));

    lines.forEach((line) => {
      const sentiment = classifySentiment(line);
      sentiments[sentiment] += 1;
      const lower = line.toLowerCase();
      themes.forEach((theme) => {
        if (theme.keywords.some((word) => lower.includes(word))) {
          theme.count += 1;
          const quote = findQuote(line, theme.quoteKeyword);
          if (quote && theme.quotes.length < 2) theme.quotes.push(quote);
          if (sentiment === 'negative') theme.negativeCount += 1;
        }
      });
    });

    const pains = themes
      .filter((theme) => theme.count > 0)
      .map((theme) => ({
        label: theme.label,
        count: theme.count,
        negativeCount: theme.negativeCount,
        quote: theme.quotes[0] || '暂无典型引用',
        score: theme.count + theme.negativeCount * 2,
        opportunity: theme.opportunity,
      }))
      .sort((a, b) => b.score - a.score);

    const topPains = pains.slice(0, 4);
    const opportunities = topPains.map((pain, index) => ({
      title: pain.opportunity,
      priority: index === 0 ? 'P0' : index === 1 ? 'P1' : 'P2',
      reason: `基于“${pain.label}”相关反馈，影响${pain.count}条评论`,
    }));

    const topics = [
      '实测：露营一天不充电',
      '20秒出杯 vs 保温杯实测',
      '通勤包里会漏吗',
      '大容量杯体用户投票',
      '新手5分钟上手指南',
    ];

    const sourceType = $('sourceSelect').value;
    const timeRange = $('rangeSelect').value;
    const topPain = pains[0] || { label: '暂无' };
    const topOpportunity = opportunities[0] || { title: '持续观察用户反馈' };
    const negativePercent = lines.length ? Math.round((sentiments.negative / lines.length) * 100) : 0;
    const summary = `在${timeRange}的${sourceType}中，共分析${lines.length}条评论，负面占比${negativePercent}%。最高频痛点为“${topPain.label}”，建议优先关注“${topOpportunity.title}”。`;

    return {
      market: $('marketSelect').value,
      product: $('productInput').value.trim() || '未命名产品',
      sourceType,
      timeRange,
      total: lines.length,
      sentiments,
      pains,
      opportunities,
      topics,
      summary,
      details: lines.map((line) => ({
        text: line,
        sentiment: classifySentiment(line),
      })),
      analyzedAt: new Date().toISOString(),
    };
  }

  function renderReport(result) {
    $('productName').textContent = result.product;
    $('reportTitle').textContent = `${result.product} · 评论洞察`;
    $('statTotal').textContent = result.total;
    const negativePercent = result.total ? Math.round((result.sentiments.negative / result.total) * 100) : 0;
    $('statNegative').textContent = `${negativePercent}%`;
    $('statPain').textContent = result.pains.length;
    $('statOpportunity').textContent = result.opportunities.length;
    $('reportSummary').textContent = result.summary;

    const sentimentConfig = [
      { key: 'positive', label: '正面', color: 'var(--mint)' },
      { key: 'neutral', label: '中性', color: 'var(--cyan)' },
      { key: 'negative', label: '负面', color: 'var(--pink)' },
    ];
    $('sentimentList').innerHTML = sentimentConfig
      .map((item) => {
        const value = result.sentiments[item.key];
        const percent = result.total ? Math.round((value / result.total) * 100) : 0;
        return `
          <div class="sentiment-row">
            <div class="s-label">${item.label}</div>
            <div class="s-value">${value}条 · ${percent}%</div>
            <div class="s-track"><span style="width:${percent}%;background:${item.color}"></span></div>
          </div>
        `;
      })
      .join('');

    $('painGrid').innerHTML = result.pains
      .slice(0, 4)
      .map(
        (pain) => `
        <div class="pain-card">
          <div class="pain-head">
            <b>${escapeHtml(pain.label)}</b>
            <span class="pain-count">${pain.count}条反馈</span>
          </div>
          <p>${escapeHtml(pain.quote)}</p>
        </div>
      `
      )
      .join('');

    $('opportunityGrid').innerHTML = result.opportunities
      .map(
        (item) => `
        <div class="opportunity-card">
          <b>${escapeHtml(item.title)}</b>
          <p>${escapeHtml(item.reason)}</p>
          <span class="priority">${item.priority}</span>
        </div>
      `
      )
      .join('');

    $('topicList').innerHTML = result.topics
      .map((topic) => `<span class="topic-chip">${escapeHtml(topic)}</span>`)
      .join('');

    const sentimentLabel = { positive: '正面', neutral: '中性', negative: '负面' };
    $('detailList').innerHTML = result.details
      .map(
        (item) => `
        <div class="detail-item">
          <span class="detail-sentiment ${item.sentiment}">${sentimentLabel[item.sentiment]}</span>
          <p>${escapeHtml(item.text)}</p>
        </div>
      `
      )
      .join('');

    $('emptyState').classList.add('hidden');
    $('report').classList.remove('hidden');
  }

  function buildMarkdownReport() {
    const result = window.__lastReport;
    if (!result) return '';
    const lines = [];
    lines.push(`# InsightPulse 用户声音洞察报告`);
    lines.push('');
    lines.push('## 1. 产品与数据背景');
    lines.push(`- 产品：${result.product}`);
    lines.push(`- 数据源：${result.sourceType}`);
    lines.push(`- 时间范围：${result.timeRange}`);
    lines.push(`- 评论总数：${result.total}`);
    lines.push('');
    lines.push('## 2. 洞察总结');
    lines.push(result.summary);
    lines.push('');
    lines.push('## 3. 情感分布');
    lines.push(`- 正面：${result.sentiments.positive}`);
    lines.push(`- 中性：${result.sentiments.neutral}`);
    lines.push(`- 负面：${result.sentiments.negative}`);
    lines.push('');
    lines.push('## 4. 痛点聚类');
    result.pains.slice(0, 4).forEach((pain) => {
      lines.push(`- ${pain.label}：${pain.count}条反馈`);
    });
    lines.push('');
    lines.push('## 5. 产品机会');
    result.opportunities.forEach((item) => {
      lines.push(`- [${item.priority}] ${item.title}`);
    });
    lines.push('');
    lines.push('## 6. 内容增长建议');
    result.topics.forEach((topic) => {
      lines.push(`- ${topic}`);
    });
    return lines.join('\n');
  }

  function exportJson() {
    const report = $('report');
    if (report.classList.contains('hidden')) {
      toast('请先完成分析');
      return;
    }
    const payload = {
      product: $('productInput').value.trim(),
      market: $('marketSelect').value,
      sourceType: $('sourceSelect').value,
      timeRange: $('rangeSelect').value,
      source: $('reviewInput').value,
      report: window.__lastReport || null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comment-insight-report.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('JSON已导出');
  }

  function exportMarkdown() {
    if (!window.__lastReport) {
      toast('请先完成分析');
      return;
    }
    const blob = new Blob([buildMarkdownReport()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${window.__lastReport.product}-洞察报告.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('PRD报告已导出');
  }

  function exportPdf() {
    const report = $('report');
    if (report.classList.contains('hidden')) {
      toast('请先完成分析');
      return;
    }
    window.print();
  }

  $('analyzeBtn').addEventListener('click', async () => {
    const input = $('reviewInput').value.trim();
    if (!input) {
      toast('请输入评论数据');
      return;
    }
    $('analyzeBtn').disabled = true;
    await runAgent('评论洞察', () => {
      const result = analyzeReviews(input);
      window.__lastReport = result;
      renderReport(result);
      toast('洞察分析完成');
      $('analyzeBtn').disabled = false;
    });
  });

  $('csvInput').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const rows = text
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter(Boolean);
      if (rows.length > 1 && rows[0].toLowerCase().includes('review')) {
        rows.shift();
      }
      $('reviewInput').value = rows.join('\n');
      toast('CSV评论已导入');
    };
    reader.readAsText(file);
  });

  $('exportBtn').addEventListener('click', exportJson);
  $('exportMdBtn').addEventListener('click', exportMarkdown);
  $('exportPdfBtn').addEventListener('click', exportPdf);

  if (window.lucide) window.lucide.createIcons();
})();
