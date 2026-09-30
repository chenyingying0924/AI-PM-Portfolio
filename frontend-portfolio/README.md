# 陈莹莹 · 作品演示集

个人作品集，**纯静态、零依赖、无构建步骤**，可直接部署到 GitHub Pages。

## 文件结构

```
作品演示集/
├── index.html            作品集首页（旗舰项目 + 其他项目 + 技能 + 联系）
├── vision-qc-case.html   视觉质检 Agent 完整案例页（真实截图 + 6 张样例真实验证结果）
├── assets/
│   ├── vision-qc-ui.png      视觉质检 Agent 真实运行截图（1600×2550）
│   └── 01~06-*.png           6 张样例图（真实调用模型评测过）
└── README.md
```

## 本地查看

双击 `index.html` 即可。或用本地服务器：

```bash
cd "作品演示集"
python3 -m http.server 8080
# 访问 http://127.0.0.1:8080
```

---

## 【重要】关于「视觉质检 Agent 为什么不能直接打开」

**原因有三条，都是设计使然：**

1. **它是 Node.js 服务，不是静态页面。** 项目跑起来是 `src/server.mjs` 启动一个 HTTP 服务，页面由这个服务实时产出；GitHub Pages 只能托管静态文件，跑不了常驻进程。
2. **它只监听 `127.0.0.1`。** 源码里写死 `server.listen(config.port, "127.0.0.1", ...)`，这是**本机回环地址**，外网访问不到，属于刻意的安全选择（项目定位是本地演示，没做鉴权）。
3. **需要一条启动命令。** `npm start` 之后才能真正访问，直接双击 HTML 是打不开的。

**所以本作品集采用了「静态案例页」方案：**

把项目**真实的运行截图**和**真实的评测结果**导出成 `vision-qc-case.html`，这样它在 GitHub Pages 上就能被任何人直接打开。旗舰项目卡片上的「查看完整案例」按钮指向的就是这一页。

### 如果你想让它是真正可在线交互的，有三个选项

| 方案 | 做法 | 成本 |
| --- | --- | --- |
| **A. 本地演示（推荐）** | 面试时 `npm start` 现场操作，或录一段 60 秒演示视频嵌进作品集 | 0 |
| **B. 部署到云主机** | 改两处代码：`listen(config.port, "127.0.0.1")` → `listen(config.port, "0.0.0.0")`，端口读 `process.env.PORT`；再部署到 Render / Railway / Fly.io，用 `QC_MOCK=1` 启动（兜底模式不需要 API Key，也不会泄露凭据） | 约 15 分钟 |
| **C. 录屏 / GIF** | 把操作过程录成视频放进 `assets/`，首页嵌一个 `<video>` | 10 分钟 |

> B 方案要注意：公开部署后**不要配 API Key**，否则会被人刷额度；用 `QC_MOCK=1` 走本地兜底即可，报告里会如实标注为兜底估计。

---

## 当前收录的项目

| # | 项目 | 分类 | 说明 |
| --- | --- | --- | --- |
| 01 | 视觉质检 Agent | 旗舰 · 前端工程 | 有独立案例页，含真实截图与验证数据 |
| 02 | AI 出海内容增长助手 Agent（BrandPilot AI） | 前端工程 | React + Webpack + GSAP 官网 · 原生 JS 原型 · Python 后端 |
| 03 | AI 海外用户声音洞察 Agent | AI 产品 | 四 Agent 协作架构 |
| 04 | PRD Copilot · AI 产品经理 Agent | AI 产品 | 五 Agent 协作架构 |

> 已按你的要求移除：TalentCopilot AI 招聘助手、MoodAI 情绪陪伴小程序、学生在线考试管理系统。

---

## 怎么改内容

所有数据都在 HTML 底部 `<script>` 里的数组中，改完保存刷新即可：

| 位置 | 数组 | 用途 |
| --- | --- | --- |
| `index.html` | `PROJECTS` | 其他项目卡片（`icon` 对应 `ICON` 里的图标名，`hue` 是主色） |
| `index.html` | `SKILLS` | 技能面板，每项格式 `["技能名", 百分比]` |
| `index.html` | `HERO_STATS`（写在 HTML 里） | 首屏四个数字，改 `data-count` 与 `data-suffix` |
| `vision-qc-case.html` | `SAMPLES` | 6 张样例图的分数、结论与说明 |

**加回被移除的项目**：从旧版本复制对应的对象贴进 `PROJECTS` 数组即可。

---

## 交互与设计

- **浅色 / 深色 / 跟随系统**三态主题切换（两个页面共享选择，存 `localStorage`）
- 顶部**滚动进度条**、导航栏滚动吸附加描边
- 首屏数字**滚动计数**、区块**入场动画**（交错延迟）
- 旗舰项目的大图**3D 倾斜 + 悬停回正**
- 卡片**指针跟随光晕**、按钮**磁吸位移**
- 已适配 `prefers-reduced-motion`；并提供 `<noscript>` 兜底，禁用 JS 也不会白屏

---

## 部署到 GitHub Pages

```bash
cd "作品演示集"
git init
git add .
git commit -m "feat: portfolio"
git branch -M main
git remote add origin https://github.com/<你的用户名>/portfolio.git
git push -u origin main
```

仓库 **Settings → Pages** → Source 选 `Deploy from a branch` → Branch 选 `main`、目录 `/ (root)` → 保存。
1-2 分钟后访问 `https://<你的用户名>.github.io/portfolio/`。

两个链接一起放进简历：

- AI 产品作品集：`https://chenyingying0924.github.io/AI-PM-Portfolio/`
- 本作品集：`https://<你的用户名>.github.io/portfolio/`

---

## 数据诚实性说明

- 页面上的数字都是**可在项目里复现的事实**：45 条规则、4 套清单、51 项用例、平均 77 分、缓存命中 91%、文件数量等。
- 视觉质检的 `$0.0024/张` 属于成本估算口径，**未写进页面**（面试口述时说明即可）。
- `vision-qc-case.html` 里的 6 张样例结果是**真实调用 `deepseek-v4-flash-vision-exp` 的批次记录**（`reports/2026-09-17T06-39-24/batch.json`），非示意数据。
- 样例图为**自造矢量渲染图，不是真实商家数据**；项目**目前没有真实使用方** —— 案例页的「已知边界」一节已如实写明。
