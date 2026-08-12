# AI出海内容增长助手 Agent

AI产品经理实习作品集项目。目标不是做商业级SaaS，而是用AI Native MVP验证一个核心假设：

> AI是否可以帮助出海品牌提升海外社媒内容生产效率。

## 交付物

| 文件 | 说明 |
| --- | --- |
| `docs/full-solution.md` | 十部分完整方案：市场分析、竞品、机会、产品定义、功能、AI方案、Prompt、MVP验证、作品集结构、简历描述 |
| `docs/portfolio-pages.md` | 20页PDF逐页脚本，包含标题、内容、展示形式 |
| `docs/PRD-AI出海内容增长助手-Agent.md` | 专业MVP版产品需求文档（PRD） |
| `docs/full-solution.html` | 完整方案的美化HTML版 |
| `docs/PRD-AI出海内容增长助手-Agent.html` | PRD的美化HTML版 |
| `portfolio/ai-overseas-content-agent.pdf` | 可直接展示/打印的20页PDF作品集 |
| `scripts/build-portfolio-pdf.cjs` | 生成PDF的构建脚本（基于Playwright） |
| `agent-app/index.html` | 可交互Agent产品原型：爆款拆解、内容重写、品牌知识库、质量评估 |
| `landing/index.html` | BrandPilot AI产品官网首页（React构建，需先运行 `landing/dist/bundle.js`） |

## 使用建议

1. 用PDF作品集作为投递附件或面试展示材料。
2. 页面中标注“建议替换为原型截图”的位置，可在面试前补上自己的Figma原型、Agent运行录屏、用户访谈记录。
3. 所有量化结果均明确标注为“模拟验证指标”，不是真实商业数据。
4. Agent产品原型使用本地模拟引擎，无需API Key即可演示完整流程。
5. 官网首页打开方式：直接打开 `landing/index.html`；React bundle已构建在 `landing/dist/bundle.js`。

## GitHub与在线访问

1. 仓库根目录的 `index.html` 是个人作品集导航页，可同时展示官网、原型、PDF与PRD。
2. 上传到GitHub并开启GitHub Pages后，可通过以下路径在线访问：

```text
https://用户名.github.io/仓库名/
https://用户名.github.io/仓库名/landing/
https://用户名.github.io/仓库名/agent-app/
```

3. 上传前请确认 `landing/dist/` 已提交，否则官网会白屏。
4. 个人作品集建议同时保留：产品官网、可交互Agent原型、20页PDF作品集、PRD、完整方案文档。
