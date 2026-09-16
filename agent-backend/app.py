import json
import os
import re
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.getenv("AGENT_PORT", "8787"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")


def detect_engine():
    if OPENAI_API_KEY:
        try:
            import langchain_core  # noqa: F401
            import langchain_openai  # noqa: F401
            return "langchain"
        except Exception:
            return "openai"
    return "mock"


def call_langchain(prompt):
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        model=OPENAI_MODEL,
        temperature=0.2,
        api_key=OPENAI_API_KEY,
        base_url=OPENAI_BASE_URL,
    )
    chain = ChatPromptTemplate.from_template("{prompt}") | llm
    return chain.invoke({"prompt": prompt}).content


def call_openai(prompt):
    url = OPENAI_BASE_URL.rstrip("/") + "/chat/completions"
    payload = {
        "model": OPENAI_MODEL,
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0.2,
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        data = json.loads(response.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def call_llm(prompt):
    if detect_engine() == "langchain":
        return call_langchain(prompt)
    return call_openai(prompt)


def extract_json(text):
    text = re.sub(r"```(?:json)?", "", text).strip()
    for open_char, close_char in (("{", "}"), ("[", "]")):
        start = text.find(open_char)
        end = text.rfind(close_char)
        if start != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                continue
    return None


def build_prompt(task, payload):
    if task == "teardown":
        return f"""
你是一名资深出海社媒内容策略分析师。
请拆解以下竞品内容，输出JSON，包含：
userProfile, contentStructure, emotionTriggers, coreSellingPoints, viralityReasons。

平台：{payload.get("platform", "TikTok")}
账号类型：{payload.get("account", "")}
原始内容：
{payload.get("input", "")}

要求：结论引用原文，不编造数据。
"""
    if task == "rewrite":
        brand = payload.get("brand", {})
        return f"""
你是一名出海品牌内容策划。
请基于爆款拆解结果，为以下市场生成内容变体，输出JSON数组。

市场：{payload.get("markets", [])}
平台：{payload.get("platform", "TikTok")}
数量：{payload.get("count", 2)}
品牌：{json.dumps(brand, ensure_ascii=False)}
爆款拆解：{json.dumps(payload.get("teardown", {}), ensure_ascii=False)}

每个变体包含：
title, market, marketLabel, platform, body, keptSellingPoints, changedAspects。
要求：保留卖点，做文化适配，避免翻译腔。
"""
    if task == "evaluate":
        return f"""
你是一名出海品牌内容质量评审。
请对以下内容进行三维评分，输出JSON，包含：
scores(attractiveness, conversion, platformFit), total, verdict, reasons, suggestions。

平台：{payload.get("platform", "TikTok")}
市场：{payload.get("marketLabel", "")}
内容：
{payload.get("body", "")}

要求：分数0至100，每个分数附原因。
"""
    raise ValueError(f"unknown task: {task}")


def mock_teardown(payload):
    text = (payload.get("input") or "").lower()
    selling = ["20秒快速萃取"]
    if "battery" in text or "charge" in text:
        selling.append("USB-C充电")
    if "leak" in text or "spills" in text:
        selling.append("密封防漏")
    return {
        "title": "便携咖啡机 · 效率型爆款结构",
        "sourcePlatform": payload.get("platform", "TikTok"),
        "accountType": payload.get("account", ""),
        "userProfile": ["25至35岁通勤白领", "追求效率", "通勤与露营场景"],
        "contentStructure": ["痛点开场", "20秒出杯展示", "便携卖点", "行动号召"],
        "emotionTriggers": ["时间焦虑", "效率认同", "场景代入"],
        "coreSellingPoints": selling,
        "viralityReasons": ["具体数字", "场景覆盖广", "行动号召清晰"],
    }


def mock_rewrite(payload):
    markets = payload.get("markets", ["US"])
    count = payload.get("count", 2)
    platform = payload.get("platform", "TikTok")
    brand = payload.get("brand", {})
    variants = []
    for market in markets:
        for i in range(count):
            variants.append(
                {
                    "title": f"{market} · {platform} · 变体 {i + 1}",
                    "market": market,
                    "marketLabel": market,
                    "platform": platform,
                    "body": f"{brand.get('name', 'Aurora')} 本地化内容变体 {i + 1}",
                    "keptSellingPoints": brand.get("sellingPoints", []),
                    "changedAspects": ["表达方式", "用户场景", "文化适配"],
                }
            )
    return variants


def mock_evaluate(payload):
    body = payload.get("body", "")
    score = 82 if len(body) > 40 else 74
    return {
        "scores": {
            "attractiveness": min(95, score + 2),
            "conversion": min(95, score),
            "platformFit": min(95, score + 1),
        },
        "total": score,
        "verdict": "通过" if score >= 80 else "需修改",
        "reasons": ["钩子清晰", "卖点保留", "平台适配良好"],
        "suggestions": ["缩短第一句", "补充行动号召"],
    }


def mock_task(task, payload):
    if task == "teardown":
        return mock_teardown(payload)
    if task == "rewrite":
        return mock_rewrite(payload)
    if task == "evaluate":
        return mock_evaluate(payload)
    raise ValueError(f"unknown task: {task}")


def handle_run(payload):
    task = payload.get("task", "")
    prompt = build_prompt(task, payload)
    engine = detect_engine()
    if engine in ("langchain", "openai"):
        text = call_llm(prompt)
        parsed = extract_json(text)
        if parsed is not None:
            return {"ok": True, "engine": engine, "data": parsed}
        return {"ok": False, "engine": engine, "error": "LLM output not valid JSON", "raw": text[:500]}
    return {"ok": True, "engine": "mock", "data": mock_task(task, payload)}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(200, {})

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"status": "ok", "engine": detect_engine()})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/api/agent/run":
            self._send(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw)
        except Exception:
            self._send(400, {"error": "invalid json"})
            return
        try:
            result = handle_run(payload)
            self._send(200, result)
        except Exception as exc:
            self._send(500, {"error": str(exc)})

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Agent backend listening on http://127.0.0.1:{PORT} engine={detect_engine()}")
    server.serve_forever()
