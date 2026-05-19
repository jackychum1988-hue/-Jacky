import requests
from config import PUSHPLUS_TOKEN, PUSHPLUS_URL, REQUEST_TIMEOUT


def push_to_wechat(title: str, content: str, template: str = "markdown") -> dict:
    """推送消息到微信（通过PushPlus）"""
    if not PUSHPLUS_TOKEN:
        print("[pusher] PUSHPLUS_TOKEN not configured, skip push")
        return {"code": -1, "msg": "PUSHPLUS_TOKEN not configured"}

    payload = {
        "token": PUSHPLUS_TOKEN,
        "title": title,
        "content": content,
        "template": template,
        "channel": "wechat",
    }

    try:
        resp = requests.post(PUSHPLUS_URL, json=payload, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[pusher] push failed: {e}")
        return {"code": -1, "msg": str(e)}
