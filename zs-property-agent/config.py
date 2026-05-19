import os
from dotenv import load_dotenv

load_dotenv()

PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

PUSHPLUS_URL = "https://www.pushplus.plus/send"

YOUTUBE_SEARCH_QUERIES = [
    "中山 买房",
    "中山 楼盘",
    "中山 房产",
    "深中通道 中山 楼市",
]

DOUYIN_BLOGGERS = [
    {"name": "罗宾Sir", "query": "罗宾Sir 中山 房产"},
    {"name": "中山小强总", "query": "中山小强总 房产"},
    {"name": "安个家中山东哥找房", "query": "东哥找房 中山"},
    {"name": "中山房探冉Sir", "query": "中山房探冉Sir"},
]

REQUEST_TIMEOUT = 15
MAX_ITEMS_PER_SOURCE = 5
