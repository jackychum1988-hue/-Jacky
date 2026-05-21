import os
from dotenv import load_dotenv

load_dotenv()

# PushPlus
PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")
PUSHPLUS_URL = "https://www.pushplus.plus/send"

# YouTube API
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# AI Analysis (OpenAI-compatible: DeepSeek default)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

YOUTUBE_SEARCH_QUERIES = [
    "中山 买房",
    "中山 楼盘",
    "中山 房产",
    "深中通道 中山 楼市",
]

DOUYIN_BLOGGERS = [
    # Existing
    {"name": "罗宾Sir", "query": "罗宾Sir 中山 房产"},
    {"name": "中山小强总", "query": "中山小强总 房产"},
    {"name": "安个家中山东哥找房", "query": "东哥找房 中山"},
    {"name": "中山房探冉Sir", "query": "中山房探冉Sir"},
    # New
    {"name": "阿阳教买房", "query": "阿阳教买房 中山 房产"},
    {"name": "胡须哥说房", "query": "胡须哥说房 中山 三乡"},
    {"name": "中山亚文说房", "query": "中山亚文说房"},
    {"name": "中山房产李先生jason", "query": "中山房产李先生jason"},
    {"name": "双双看房", "query": "双双看房 中山"},
    {"name": "中山一姐房产", "query": "中山一姐房产"},
    {"name": "山姆说房咨询", "query": "山姆说房咨询 中山"},
    {"name": "中山八登找房", "query": "中山八登找房"},
    {"name": "中山房产吴同学", "query": "中山房产吴同学"},
    {"name": "点点看房vlog", "query": "点点看房vlog 中山"},
]

XIAOHONGSHU_BLOGGERS = [
    {"name": "罗宾Sir", "query": "罗宾Sir 中山 房产"},
    {"name": "壹方置业", "query": "壹方置业 中山 房产"},
]

BILIBILI_BLOGGERS = [
    {"name": "中山文英说房", "query": "中山文英说房"},
]

REQUEST_TIMEOUT = 15
MAX_ITEMS_PER_SOURCE = 5
