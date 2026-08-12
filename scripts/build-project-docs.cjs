const fs = require('node:fs');
const path = require('node:path');

let marked;
try {
  ({ marked } = require('marked'));
} catch (err) {
  ({ marked } = require('/Users/chenyingying/node_modules/marked'));
}

const rootDir = path.resolve(__dirname, '..');

const DOCS = [
  {
    src: 'projects/ai-content-growth/docs/PRD-AI出海内容增长助手-Agent.md',
    out: 'projects/ai-content-growth/docs/PRD-AI出海内容增长助手-Agent.html',
    title: 'PRD：AI出海内容增长助手 Agent',
    tag: '产品需求文档',
  },
  {
    src: 'projects/ai-content-growth/docs/full-solution.md',
    out: 'projects/ai-content-growth/docs/full-solution.html',
    title: '完整方案：AI出海内容增长助手 Agent',
    tag: '产品方案',
  },
  {
    src: 'projects/ai-comment-insight/docs/PRD-V2.0.md',
    out: 'projects/ai-comment-insight/docs/PRD-V2.0.html',
    title: 'InsightPulse AI 海外用户声音洞察 Agent PRD V2.0',
    tag: '产品需求文档',
  },
  {
    src: 'projects/ai-comment-insight/docs/solution.md',
    out: 'projects/ai-comment-insight/docs/solution.html',
    title: '完整方案：AI海外用户声音洞察 Agent',
    tag: '产品方案',
  },
  {
    src: 'projects/ai-prd-assistant/docs/PRD-V2.0.md',
    out: 'projects/ai-prd-assistant/docs/PRD-V2.0.html',
    title: 'PRD Copilot V2.0：AI Product Manager Agent 产品需求文档',
    tag: '产品需求文档',
  },
  {
    src: 'projects/ai-prd-assistant/docs/solution.md',
    out: 'projects/ai-prd-assistant/docs/solution.html',
    title: '完整方案：AI产品需求文档助手',
    tag: '产品方案',
  },
];

const CSS = `
:root {
  --bg: #f2f5f8;
  --surface: #ffffff;
  --ink: #17212b;
  --muted: #5c6b7a;
  --dim: #8a97a6;
  --border: rgba(23, 33, 43, .1);
  --border-strong: rgba(23, 33, 43, .16);
  --accent: #4f5fd8;
  --accent-2: #4450c9;
  --accent-soft: rgba(79, 95, 216, .08);
  --code-bg: #0f1722;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "Avenir Next", "SF Pro Display", "Helvetica Neue", "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

.doc-shell {
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  min-height: 100vh;
}

.toc {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  padding: 30px 22px;
  background: #eef2f6;
  border-right: 1px solid var(--border);
}

.doc-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-2);
  text-decoration: none;
  margin-bottom: 24px;
}

.doc-home:hover {
  color: var(--accent);
}

.toc-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 12px;
}

.toc nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.toc a {
  color: var(--muted);
  text-decoration: none;
  font-size: 12px;
  line-height: 1.45;
  padding: 5px 8px;
  border-radius: 6px;
}

.toc a:hover {
  background: rgba(79, 95, 216, .08);
  color: var(--accent-2);
}

.toc a.toc-h3 {
  padding-left: 20px;
  font-size: 11px;
  color: var(--dim);
}

.doc-main {
  min-width: 0;
  padding: 52px 56px 72px;
}

.doc-head {
  margin-bottom: 28px;
}

.doc-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: var(--accent-2);
  background: var(--accent-soft);
  border: 1px solid rgba(79, 95, 216, .18);
  border-radius: 999px;
  padding: 4px 11px;
  margin-bottom: 14px;
}

.doc-head h1 {
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.doc-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 42px 48px;
  max-width: 920px;
}

.doc-content h1 {
  font-size: 26px;
  margin: 34px 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  line-height: 1.3;
  letter-spacing: -.02em;
}

.doc-content h2 {
  font-size: 21px;
  margin: 34px 0 12px;
  line-height: 1.35;
  letter-spacing: -.01em;
}

.doc-content h3 {
  font-size: 16px;
  margin: 26px 0 10px;
  line-height: 1.4;
}

.doc-content h4 {
  font-size: 14px;
  margin: 20px 0 8px;
}

.doc-content p {
  margin: 10px 0;
  color: #33434f;
  font-size: 14px;
}

.doc-content strong {
  color: var(--ink);
}

.doc-content ul,
.doc-content ol {
  margin: 10px 0 10px 22px;
  color: #33434f;
  font-size: 14px;
}

.doc-content li {
  margin: 5px 0;
}

.doc-content blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
  border-radius: 0 8px 8px 0;
  color: #33434f;
  font-size: 14px;
}

.doc-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
  line-height: 1.55;
}

.doc-content th,
.doc-content td {
  border: 1px solid var(--border);
  padding: 9px 11px;
  text-align: left;
  vertical-align: top;
}

.doc-content th {
  background: #eef2f6;
  font-weight: 700;
  color: var(--ink);
}

.doc-content code {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
  background: #edf1f5;
  color: #37475a;
  border-radius: 5px;
  padding: 2px 5px;
}

.doc-content pre {
  margin: 16px 0;
  padding: 16px 18px;
  background: var(--code-bg);
  border-radius: 8px;
  overflow: auto;
}

.doc-content pre code {
  background: transparent;
  color: #dbe4ef;
  padding: 0;
  font-size: 12.5px;
  line-height: 1.6;
}

.doc-footer {
  margin-top: 18px;
  color: var(--dim);
  font-size: 11px;
  text-align: right;
}

@media (max-width: 900px) {
  .doc-shell {
    grid-template-columns: 1fr;
  }

  .toc {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    padding: 18px;
  }

  .toc nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .doc-main {
    padding: 28px 18px 48px;
  }

  .doc-content {
    padding: 24px 20px;
    border-radius: 8px;
  }

  .doc-head h1 {
    font-size: 26px;
  }
}
`;

function extractToc(html) {
  const items = [];
  const pattern = /<h([23]) id="([^"]+)">(.*?)<\/h\1>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    items.push({
      level: Number(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ''),
    });
  }
  return items;
}

function buildHtml(title, tag, toc, content) {
  const tocLinks = toc
    .map(
      (item) =>
        `<a class="${item.level === 3 ? 'toc-h3' : ''}" href="#${item.id}">${item.text}</a>`
    )
    .join('\n');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
<div class="doc-shell">
  <aside class="toc">
    <a class="doc-home" href="../../index.html">← 返回作品集</a>
    <div class="toc-title">目录</div>
    <nav>${tocLinks || '<a href="#">文档内容</a>'}</nav>
  </aside>
  <main class="doc-main">
    <div class="doc-head">
      <span class="doc-tag">${tag}</span>
      <h1>${title}</h1>
    </div>
    <article class="doc-content">${content}</article>
    <div class="doc-footer">陈莹莹 · AI产品经理作品集</div>
  </main>
</div>
</body>
</html>`;
}

for (const doc of DOCS) {
  const sourcePath = path.join(rootDir, doc.src);
  const outPath = path.join(rootDir, doc.out);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const rendered = marked.parse(source, { gfm: true });
  const toc = extractToc(rendered);
  const html = buildHtml(doc.title, doc.tag, toc, rendered);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('DOC_HTML_WRITTEN', doc.out, `toc=${toc.length}`);
}
