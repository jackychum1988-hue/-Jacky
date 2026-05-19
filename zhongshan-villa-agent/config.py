import os
from dotenv import load_dotenv

load_dotenv()

# API keys
PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"

# PushPlus
PUSHPLUS_URL = "https://www.pushplus.plus/send"

# 目标豪宅楼盘
TARGET_COMMUNITIES = [
    {
        "name": "凯茵新城别墅",
        "district": "火炬开发区/东区交界",
        "keywords": ["凯茵新城", "凯茵", "凯茵豪园"],
    },
    {
        "name": "秀丽湖山庄",
        "district": "五桂山",
        "keywords": ["秀丽湖", "秀丽湖山庄"],
    },
    {
        "name": "华发生态庄园",
        "district": "沙溪",
        "keywords": ["华发生态庄园", "华发生态"],
    },
    {
        "name": "远洋城别墅",
        "district": "东区",
        "keywords": ["远洋城别墅", "远洋城"],
    },
    {
        "name": "奕翠园别墅",
        "district": "东区",
        "keywords": ["奕翠园", "奕翠园别墅"],
    },
]

# 四大内容支柱
CONTENT_PILLARS = {
    1: {
        "name": "别墅深探",
        "description": "深度拆解一个在售别墅单位：好在哪、不好在哪、值不值、适合谁",
        "target_length": 2000,
        "frequency": "每月2-3篇",
    },
    2: {
        "name": "圈层生活方式",
        "description": "庭院打理、私宴布置、酒窖收藏、家庭影院、书房设计等",
        "target_length": 1500,
        "frequency": "每月1-2篇",
    },
    3: {
        "name": "市场内参",
        "description": "中山二手豪宅市场趋势、成交分析、价格异动",
        "target_length": 1800,
        "frequency": "每月1篇",
    },
    4: {
        "name": "个人IP故事",
        "description": "Jacky探访手记、业主对话、看房发现与思考",
        "target_length": 1500,
        "frequency": "每月1篇",
    },
}

# 豪宅写作禁词（这些词出现会降低调性）
FORBIDDEN_WORDS = [
    "笋盘", "抵买", "手快有手慢无", "最后机会", "疯抢",
    "白菜价", "抄底", "捡漏", "错过不再", "火爆",
    "上车", "刚需", "性价比之王",
]

# 豪宅写作推荐关键词
PREMIUM_KEYWORDS = [
    "私密性", "圈层", "格局", "品味", "藏品",
    "天地", "气度", "匠心", "隐逸", "传承",
    "尺度", "境界", "质感", "稀缺", "生活美学",
]

# 爬虫配置
REQUEST_TIMEOUT = 15
MAX_LISTINGS_PER_COMMUNITY = 3
SEARCH_KEYWORDS = [
    "中山 别墅 二手",
    "中山 豪宅 挂牌",
    "中山 别墅 成交",
]

# DeepSeek 模型配置
DEEPSEEK_MODEL = "deepseek-chat"
TEMPERATURE_WORKSHOP = 0.7
TEMPERATURE_SCOUT = 0.3
MAX_TOKENS = 4096
