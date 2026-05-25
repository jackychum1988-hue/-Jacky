import os
from dotenv import load_dotenv

load_dotenv()

# === API Keys ===
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")
JIMENG_API_KEY = os.getenv("JIMENG_API_KEY", "")
VOLCANO_TTS_KEY = os.getenv("VOLCANO_TTS_KEY", "")

# === PushPlus ===
PUSHPLUS_URL = "https://www.pushplus.plus/send"

# === Shop Info ===
SHOP_NAME = "三姐老火靓汤"
SHOP_SLOGAN = "来喝汤！饮食即养生，汤中有乾坤"
SHOP_LOCATION = "中山东凤镇"
SHOP_PERSONA = "三姐——会煲汤、懂养生、接地气的广东阿姐，用最地道的方式跟街坊分享煲汤心得"

# === Full Menu ===
SOUP_MENU = [
    {"name": "菜干猪肺汤", "effect": "清热祛湿", "price": 13},
    {"name": "莲藕排骨汤", "effect": "清心补钙", "price": 13},
    {"name": "海带排骨汤", "effect": "清热祛湿", "price": 13},
    {"name": "玉米排骨汤", "effect": "滋润降火", "price": 13},
    {"name": "鸡骨草排骨", "effect": "清热润肺", "price": 13},
    {"name": "猪脚花生汤", "effect": "强壮筋骨", "price": 13},
    {"name": "滋补牛鞭汤", "effect": "强身健体", "price": 20},
    {"name": "当归羊肉汤", "effect": "壮腰补肾", "price": 18},
    {"name": "胡椒猪肚鸡汤", "effect": "驱寒暖胃", "price": 18},
    {"name": "花旗参乌鸡汤", "effect": "补血养颜", "price": 16},
    {"name": "水甲鱼煲老鸡", "effect": "滋阴补肾", "price": 16},
    {"name": "板栗煲老鸡汤", "effect": "滋补养颜", "price": 16},
]

SNACK_MENU = [
    {"name": "杭州小笼包", "price": 6},
    {"name": "干蒸烧麦", "price": 10},
    {"name": "豉汁蒸排骨", "price": 13},
    {"name": "辣汁蒸凤爪", "price": 13},
    {"name": "港式糯米鸡", "price": 6},
    {"name": "大肉蒸饺子", "price": 6},
    {"name": "特色叉烧包", "price": 6},
    {"name": "猪脚姜醋", "price": 26},
]

DRINK_MENU = [
    {"name": "劲酒", "price": 18},
    {"name": "可乐", "price": 4},
    {"name": "啤酒", "price": 6},
    {"name": "雪碧", "price": 4},
    {"name": "红牛", "price": 6},
    {"name": "豆奶", "price": 3},
    {"name": "清火白粥", "price": 4},
    {"name": "大米饭", "price": 4},
]

# === Soup Hook Map (每款汤的视频钩子方向) ===
SOUP_HOOK_MAP = {
    "菜干猪肺汤": {
        "hook_angle": "猪肺清洗",
        "visual": "猪肺灌水冲洗+焯水过程特写",
        "sample_hook": "猪肺唔咁样洗，等于饮污糟水！",
    },
    "莲藕排骨汤": {
        "hook_angle": "莲藕选品/拉丝",
        "visual": "莲藕切开拉丝特写+七孔vs九孔对比",
        "sample_hook": "莲藕买错品种，煲出嚟一啲都唔粉！",
    },
    "海带排骨汤": {
        "hook_angle": "海带泡发误区",
        "visual": "干海带泡发前后对比+黏液特写",
        "sample_hook": "海带泡完直接煮？大错特错！",
    },
    "玉米排骨汤": {
        "hook_angle": "玉米须妙用",
        "visual": "玉米须被丢弃vs保留入锅对比",
        "sample_hook": "玉米须你系咪每次都丢？其实佢先系宝！",
    },
    "鸡骨草排骨": {
        "hook_angle": "鸡骨草认知",
        "visual": "鸡骨草特写+入锅慢动作",
        "sample_hook": "呢条草你识唔识？广东阿妈叫佢祛湿神草！",
    },
    "猪脚花生汤": {
        "hook_angle": "猪脚焯水秘诀",
        "visual": "猪脚焯水去浮沫过程特写",
        "sample_hook": "猪脚直接落锅煲？腥到冇朋友！多咗呢一步，汤白肉嫩！",
    },
    "滋补牛鞭汤": {
        "hook_angle": "牛鞭处理/功效",
        "visual": "牛鞭处理过程+瓦罐慢炖特写",
        "sample_hook": "男人过咗40岁，呢碗汤你一定要识饮！",
    },
    "当归羊肉汤": {
        "hook_angle": "羊肉去膻秘诀",
        "visual": "羊肉焯水+当归入锅特写",
        "sample_hook": "羊肉膻到你顶唔顺？因为少咗呢样嘢！",
    },
    "胡椒猪肚鸡汤": {
        "hook_angle": "猪肚清洗+胡椒处理",
        "visual": "猪肚翻面清洗+胡椒粒拍碎特写",
        "sample_hook": "猪肚唔咁样洗，煲出嚟又腥又苦！",
    },
    "花旗参乌鸡汤": {
        "hook_angle": "真假花旗参辨识",
        "visual": "花旗参切片特写vs普通参对比",
        "sample_hook": "市面上七成花旗参都系假嘅！教你一眼分辨！",
    },
    "水甲鱼煲老鸡": {
        "hook_angle": "甲鱼去腥处理",
        "visual": "甲鱼宰杀去腥步骤+沸水烫皮",
        "sample_hook": "水鱼咁样处理，一啲腥味都冇！",
    },
    "板栗煲老鸡汤": {
        "hook_angle": "板栗去壳+老鸡挑选",
        "visual": "板栗剥壳技巧+老鸡特写",
        "sample_hook": "板栗去壳去到手指痛？三姐教你10秒一粒！",
    },
}

# === Topic Categories ===
TOPIC_TYPES = [
    "单品深挖：聚焦一款汤品，讲功效、讲用料、讲火候",
    "制作揭秘：展示瓦罐煲汤过程，对比工业汤的差别",
    "养生科普：结合时令/天气，告诉街坊该喝什么汤",
    "套餐推荐：汤+小吃+饮品搭配，主打性价比",
    "时令应季：应季食材煲汤，抓住当季话题",
    "互动话题：抛问题引发评论，增加互动率",
]

# === Platform Config ===
PLATFORMS = {
    "抖音": {
        "hashtags": ["#东凤美食", "#老火靓汤", "#中山探店", "#打工人食堂", "#广东煲汤", "#三姐煲汤"],
        "best_times": ["11:30-12:30", "17:30-18:30"],
    },
}

# === Competitor Search Queries ===
COMPETITOR_QUERIES = [
    "东凤 老火汤",
    "中山 药膳汤",
    "东凤 炖汤",
    "中山北部 煲汤",
    "东凤 瓦罐汤",
    "广东 老火靓汤 探店",
]

# === Request Settings ===
REQUEST_TIMEOUT = 15
MAX_COMPETITOR_ITEMS = 10

# === Output Paths ===
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")
