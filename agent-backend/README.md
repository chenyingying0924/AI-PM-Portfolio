# AI出海内容增长助手 Agent 后端

## 功能

为Agent原型提供真实LLM推理能力：

- 优先使用LangChain调用OpenAI兼容模型。
- 未安装LangChain时，自动回退到OpenAI兼容HTTP接口。
- 未配置API Key时，自动回退到本地模拟引擎。

## 启动

```bash
cd agent-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="sk-xxx"
python app.py
```

默认服务地址：`http://127.0.0.1:8787`

## 接口

### GET /health

返回当前引擎状态。

### POST /api/agent/run

```json
{
  "task": "teardown | rewrite | evaluate",
  "input": "原始内容",
  "platform": "TikTok",
  "markets": ["US", "UK", "JP"],
  "count": 2,
  "brand": {
    "name": "Aurora",
    "sellingPoints": ["20秒快速萃取"]
  }
}
```

返回：

```json
{
  "ok": true,
  "engine": "langchain | openai | mock",
  "data": {}
}
```

## 前端接入

前端默认使用本地模拟引擎，不会产生连接报错。

接入真实LLM后端两种方式：

1. 在原型顶部点击“配置引擎”，输入 `http://127.0.0.1:8787`。
2. 或在浏览器控制台执行：

```js
localStorage.setItem('agentApiUrl', 'http://127.0.0.1:8787');
location.reload();
```

配置成功后，顶部状态显示“真实LLM引擎”。后端不可用或未配置API Key时自动回退本地模拟引擎。
