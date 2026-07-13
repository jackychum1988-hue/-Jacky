import os
import json
import requests
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

# === Request Settings ===
REQUEST_TIMEOUT = 15
MAX_COMPETITOR_ITEMS = 10


def deepseek_chat(prompt: str, max_tokens: int = 1000, temperature: float = 0.8) -> str:
    """调用 DeepSeek API（OpenAI 兼容接口），返回文本响应。"""
    if not DEEPSEEK_API_KEY:
        raise RuntimeError("DEEPSEEK_API_KEY not configured")

    resp = requests.post(
        f"{DEEPSEEK_BASE_URL}/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        },
        timeout=REQUEST_TIMEOUT + 30,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


# === Shop Info ===
SHOP_NAME = "三姐老火靓汤"
SHOP_SLOGAN = "真材实料老火汤，健康实惠每一天"
SHOP_LOCATION = "中山东凤镇"
SHOP_PERSONA = "三姐——深耕煲汤十几年的汤店老板娘，懂食材、懂火候、懂养生。用普通话跟全国观众分享煲汤干货：什么时节喝什么汤、食材怎么挑才不踩坑、在家怎么煲出店里的味道。每条视频都要让观众学到东西、产生食欲、想来店里喝一碗。"

# === Full Menu ===
SOUP_MENU = [
    {"name": "菜干猪肺汤", "effect": "清热祛湿", "price": 13},
    {"name": "莲藕排骨汤", "effect": "藕香粉糯", "price": 13},
    {"name": "海带排骨汤", "effect": "清热祛湿", "price": 13},
    {"name": "玉米排骨汤", "effect": "滋润降火", "price": 13},
    {"name": "鸡骨草排骨", "effect": "清热润肺", "price": 13},
    {"name": "猪脚花生汤", "effect": "胶原满满", "price": 13},
    {"name": "滋补牛鞭汤", "effect": "浓郁滋补", "price": 20},
    {"name": "当归羊肉汤", "effect": "温补暖身", "price": 18},
    {"name": "胡椒猪肚鸡汤", "effect": "暖身暖胃", "price": 18},
    {"name": "花旗参乌鸡汤", "effect": "参香浓郁", "price": 16},
    {"name": "水甲鱼煲老鸡", "effect": "汤浓味鲜", "price": 16},
    {"name": "板栗煲老鸡汤", "effect": "板栗香甜", "price": 16},
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

# === Soup Hook Map (每款汤的视频钩子方向 — 普通话) ===
SOUP_HOOK_MAP = {
    "菜干猪肺汤": {
        "hook_angle": "猪肺清洗秘诀",
        "visual": "猪肺灌水冲洗+焯水过程特写",
        "sample_hook": "猪肺洗不干净等于喝脏水！三姐教你正确洗法",
        "selling_point": "菜干清香+新鲜猪肺，13元一碗真材实料，汤浓味正",
        "experience_tip": "猪肺一定要灌水冲到水清，很多人省这一步结果汤又腥又浑",
    },
    "莲藕排骨汤": {
        "hook_angle": "莲藕选品秘诀+拉丝效果",
        "visual": "莲藕切开拉丝特写+七孔vs九孔对比",
        "sample_hook": "莲藕买错了，炖再久也不粉！教你一眼分辨",
        "selling_point": "洪湖粉藕+鲜排骨，藕香粉糯，13元一碗清甜好喝",
        "experience_tip": "煲汤用七孔藕才粉糯，九孔藕是炒菜用的，买错等于白煲",
    },
    "海带排骨汤": {
        "hook_angle": "海带泡发误区",
        "visual": "干海带泡发前后对比+黏液特写",
        "sample_hook": "海带泡完直接煮？大错特错！少这一步味道差十倍",
        "selling_point": "深海厚海带+鲜排骨，清热祛湿，13元一碗",
        "experience_tip": "海带泡发后一定要焯水30秒去掉黏液，不然汤会有腥味",
    },
    "玉米排骨汤": {
        "hook_angle": "玉米须妙用",
        "visual": "玉米须被丢弃vs保留入锅对比",
        "sample_hook": "玉米须你每次都扔？其实它才是宝贝！",
        "selling_point": "甜玉米+鲜排骨，滋润降火，13元一碗清甜回甘",
        "experience_tip": "玉米须洗干净一起煲，天然的清甜味道，汤会更鲜，扔了太可惜",
    },
    "鸡骨草排骨": {
        "hook_angle": "鸡骨草认知+功效科普",
        "visual": "鸡骨草特写+入锅慢动作",
        "sample_hook": "这根草你认识吗？广东人叫它祛湿神草！",
        "selling_point": "野生鸡骨草+鲜排骨，清热润肺祛湿，13元一碗",
        "experience_tip": "鸡骨草要提前泡半小时，去豆荚只留茎叶，不然汤会苦",
    },
    "猪脚花生汤": {
        "hook_angle": "猪脚焯水秘诀+胶质展示",
        "visual": "猪脚焯水去浮沫过程特写+汤面胶质光泽",
        "sample_hook": "猪脚直接下锅炖？腥到没法喝！多这一步，汤白肉烂",
        "selling_point": "新鲜猪脚+红皮花生，胶原满满，13元一碗汤白肉烂",
        "experience_tip": "猪脚先焯水再炒一下，炖出来的汤又白又浓，胶质全出来",
    },
    "滋补牛鞭汤": {
        "hook_angle": "牛鞭处理+功效讲解",
        "visual": "牛鞭处理过程+瓦罐慢炖特写+药材展示",
        "sample_hook": "男人过了40岁，这碗汤你一定要知道！",
        "selling_point": "真牛鞭+滋补药材，真材实料，20元一碗慢炖几小时",
        "experience_tip": "牛鞭处理要刮干净筋膜，加姜片料酒焯三次水才能彻底去腥",
    },
    "当归羊肉汤": {
        "hook_angle": "羊肉去膻秘诀+当归功效",
        "visual": "羊肉焯水+当归入锅特写+汤色展示",
        "sample_hook": "羊肉膻到你受不了？因为少了这样东西！",
        "selling_point": "草原羊肉+岷县当归，汤浓肉香，18元一碗暖全身",
        "experience_tip": "去膻三件套：焯水去浮沫+白芷+甘蔗，少一样都不行",
    },
    "胡椒猪肚鸡汤": {
        "hook_angle": "猪肚清洗+胡椒处理秘诀",
        "visual": "猪肚翻面清洗+胡椒粒拍碎特写+成品汤色",
        "sample_hook": "猪肚不这样洗，炖出来又腥又苦！白胡椒才是灵魂",
        "selling_point": "新鲜猪肚+走地鸡+海南白胡椒，暖身暖胃，18元一碗",
        "experience_tip": "猪肚用面粉+盐+白醋反复搓洗三遍，胡椒粒要现拍碎才够味",
    },
    "花旗参乌鸡汤": {
        "hook_angle": "真假花旗参辨别+补血功效",
        "visual": "花旗参切片特写vs普通参对比+乌鸡入锅",
        "sample_hook": "市面上七成花旗参是假的！三招教你一眼分辨",
        "selling_point": "进口花旗参+散养乌鸡，参味浓郁，16元一碗汤色金黄",
        "experience_tip": "花旗参要买断面有菊花纹的，切片后放舌下能回甘的才是真的",
    },
    "水甲鱼煲老鸡": {
        "hook_angle": "甲鱼去腥处理+滋阴功效",
        "visual": "甲鱼宰杀去腥步骤+沸水烫皮+成品展示",
        "sample_hook": "水鱼这样处理，一点腥味都没有！滋阴补肾就靠它",
        "selling_point": "野生水甲鱼+散养老鸡，汤浓肉烂，16元一碗真材实料",
        "experience_tip": "甲鱼要用80度热水烫一下刮掉表面那层白膜，那是腥味的主要来源",
    },
    "板栗煲老鸡汤": {
        "hook_angle": "板栗去壳秘诀+老鸡挑选",
        "visual": "板栗剥壳技巧+老鸡特写+汤色金黄展示",
        "sample_hook": "板栗去壳弄到手疼？三姐教你10秒一个！",
        "selling_point": "迁西板栗+散养老母鸡，板栗香甜，16元一碗金黄浓郁",
        "experience_tip": "板栗先剪十字口再用开水烫30秒，壳一剥就掉，完整不碎",
    },
}

# === Topic Categories ===
TOPIC_TYPES = [
    "单品深挖：聚焦一款汤品，讲食材怎么挑、功效好在哪、火候怎么控——卖点+经验双输出",
    "制作揭秘：展示瓦罐慢炖全过程，对比外卖汤/工业汤的差距——用真实过程建立信任",
    "养生科普：结合时令天气讲该喝什么汤、为什么——每个知识点都是卖点",
    "套餐推荐：汤+小吃+饮品高性价比搭配，突出「花小钱喝好汤」",
    "时令应季：应季食材是最佳卖点，告诉观众「现在不吃就亏了」",
    "经验分享：三姐煲汤十几年踩过的坑、学到的技巧——干货感最强的内容类型",
    "顾客见证：真实食客喝汤反应+评价，用第三方口碑做最强卖点",
]

# === Platform Config ===
PLATFORMS = {
    "抖音": {
        "hashtags": ["#东凤美食", "#老火靓汤", "#中山探店", "#打工人食堂", "#广东煲汤", "#三姐煲汤", "#煲汤教程", "#养生汤", "#真材实料"],
        "best_times": ["11:30-12:30", "17:30-18:30"],
    },
}

# === Competitor Search Queries（百度搜索用） ===
COMPETITOR_QUERIES = [
    "东凤 老火汤 抖音",
    "中山 炖汤店 探店 视频",
    "广东 老火靓汤 抖音 爆款",
    "汤店 抖音 文案 怎么写",
    "煲汤 养生 抖音 热门",
    "中山 东凤 美食 汤店",
    "老火汤 店 抖音 运营",
    "炖汤 药膳 抖音 探店 中山",
]

# === Output Paths ===
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")
