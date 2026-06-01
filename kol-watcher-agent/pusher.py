import requests
from config import PUSHPLUS_TOKEN, PUSHPLUS_URL, REQUEST_TIMEOUT


def push_to_wechat(title: str, content: str) -> dict:
    if not PUSHPLUS_TOKEN:
        print("[push] PUSHPLUS_TOKEN not configured, skip push")
        return {"code": -1, "msg": "PUSHPLUS_TOKEN not configured"}

    payload = {
        "token": PUSHPLUS_TOKEN,
        "title": title,
        "content": content,
        "template": "markdown",
        "channel": "wechat",
    }

    try:
        resp = requests.post(PUSHPLUS_URL, json=payload, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        result = resp.json()
        print(f"[push] sent successfully, code={result.get('code')}")
        return result
    except requests.RequestException as e:
        print(f"[push] failed: {e}")
        return {"code": -1, "msg": str(e)}
