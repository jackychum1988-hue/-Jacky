import os
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

# PushPlus
PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")
PUSHPLUS_URL = "https://www.pushplus.plus/send"

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# DeepSeek AI
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

REQUEST_TIMEOUT = 30
MAX_ITEMS_PER_SOURCE = 10

SEEN_URLS_FILE = ".seen_urls.json"
HISTORY_FILE = "history.json"
OUTPUT_DIR = "output"
CACHE_TTL_DAYS = 7


class Platform(str, Enum):
    YOUTUBE = "youtube"
    XIAOHONGSHU = "xiaohongshu"
    FACEBOOK = "facebook"
    SHIPINHAO = "shipinhao"


@dataclass
class KOLItem:
    title: str
    url: str
    description: str = ""
    published_at: str = ""
    platform: str = ""
    author: str = ""
    engagement: dict = field(default_factory=dict)


# === YouTube KOLs (monitored by channel name search) ===
YOUTUBE_KOLS = [
    {"name": "CKBRO 置家兄弟", "query": "CKBRO 置家兄弟 大湾区 中山"},
    {"name": "容易置業/容易工作室", "query": "容易置業 容易工作室 中山 買樓"},
    {"name": "Winson講樓", "query": "Winson講樓 灣區置業"},
    {"name": "Heartbeat Home 心動家", "query": "Heartbeat Home 心動家 中山"},
    {"name": "Nana珠海中山置業頻道", "query": "Nana珠海中山置業頻道"},
    {"name": "灣區順易置業", "query": "灣區順易置業 中山"},
    {"name": "灣區博士沈永年", "query": "灣區博士沈永年 大灣區"},
]

# === YouTube discovery queries (find NEW Zhongshan property creators) ===
YOUTUBE_DISCOVERY_QUERIES = [
    "中山 買樓 香港人 介紹",
    "中山 睇樓 香港 2025",
    "大灣區 中山 房產 香港",
    "中山 新樓 港人 置業",
    "深中通道 中山 樓盤 介紹",
]

# === 小红书 KOLs ===
XIAOHONGSHU_KOLS = [
    {"name": "罗宾Sir/湾区王", "query": "罗宾Sir 中山 买房 湾区王"},
    {"name": "汤姆港房 Tom", "query": "汤姆港房 中山 大湾区 买房"},
    {"name": "Mango", "query": "Mango 中山 睇楼 买房"},
    {"name": "阿阁", "query": "阿阁 中山 三乡 买房"},
    {"name": "孙慧雪", "query": "孙慧雪 中山 买房 置业"},
    {"name": "王俊棠在湾区", "query": "王俊棠在湾区 中山 三乡"},
]

# === Facebook search queries ===
FACEBOOK_QUERIES = [
    "大灣區置業 中山 香港人",
    "中山買樓 港人",
    "珠海睇樓團 香港",
    "大灣區房產 港澳 中山",
    "中山珠海 港人置業交流",
    "大灣區退休買樓 中山",
]

# === 视频号 KOLs (中山聚焦) ===
SHIPINHAO_KOLS = [
    {"name": "汤姆港房 Tom", "query": "汤姆港房 视频号 中山 买房"},
    {"name": "罗宾Sir", "query": "罗宾Sir 视频号 中山 置业"},
    {"name": "Mango", "query": "Mango 中山 视频号 睇楼"},
    {"name": "阿阁", "query": "阿阁 视频号 中山 买房"},
]


def filter_recent(items: list, date_key: str = "published_at", days: int = 3) -> list:
    cutoff = datetime.now() - timedelta(days=days)
    result = []
    for item in items:
        raw = getattr(item, date_key, "") if isinstance(item, KOLItem) else item.get(date_key, "")
        if not raw:
            result.append(item)
            continue
        try:
            raw_clean = raw.strip().replace("年", "-").replace("月", "-").replace("日", "").replace("/", "-")
            d = datetime.strptime(raw_clean[:10], "%Y-%m-%d")
            if d >= cutoff:
                result.append(item)
        except ValueError:
            result.append(item)
    return result
