"""zs-ranking-agent config — 38 Zhongshan project name map + matching."""

# Canonical 38-project list (synced with remotion-realestate projectData.ts)
PROJECTS: list[dict] = [
    {"id": 1, "name": "江山和鸣", "district": "石岐", "aliases": ["江山和鸣"]},
    {"id": 2, "name": "保利琅悦", "district": "東區", "aliases": ["保利琅悦", "保利瑯悦"]},
    {"id": 3, "name": "囍滙·Central Peak", "district": "東區", "aliases": ["囍滙", "Central Peak", "囍汇"]},
    {"id": 4, "name": "御宸", "district": "石岐", "aliases": ["御宸"]},
    {"id": 5, "name": "建华龙湖·香山颂", "district": "石岐", "aliases": ["建华龙湖", "香山颂", "建华龙湖香山颂"]},
    {"id": 6, "name": "遠洋天著", "district": "南區", "aliases": ["远洋天著", "遠洋天著"]},
    {"id": 7, "name": "中山108天寓", "district": "東區", "aliases": ["中山108", "108天寓", "中山108天寓"]},
    {"id": 8, "name": "華潤仁恒公園四季2期", "district": "西區", "aliases": ["华润仁恒", "公园四季", "仁恒公园四季", "華潤仁恒公園四季"]},
    {"id": 9, "name": "幸福匯", "district": "西區", "aliases": ["幸福汇", "幸福匯"]},
    {"id": 10, "name": "展睿·江樾灣", "district": "石岐", "aliases": ["展睿", "江樾湾", "江樾灣", "展睿江樾湾"]},
    {"id": 11, "name": "錦繡海灣城", "district": "翠亨", "aliases": ["锦绣海湾城", "錦繡海灣城", "锦绣海湾城九期", "锦绣海湾城七期"]},
    {"id": 12, "name": "華發觀山水", "district": "三鄉", "aliases": ["华发观山水", "華發觀山水"]},
    {"id": 13, "name": "佳境康城", "district": "坦洲", "aliases": ["佳境康城"]},
    {"id": 14, "name": "錦繡國際花城", "district": "坦洲", "aliases": ["锦绣国际花城", "錦繡國際花城"]},
    {"id": 15, "name": "雅居樂·萬象郡", "district": "三鄉", "aliases": ["雅居乐万象郡", "雅居樂萬象郡", "万象郡"]},
    {"id": 16, "name": "中澳春城", "district": "坦洲", "aliases": ["中澳春城"]},
    {"id": 17, "name": "港航匯", "district": "市區", "aliases": ["港航汇", "港航匯"]},
    {"id": 18, "name": "海雅繽紛城", "district": "南頭", "aliases": ["海雅缤纷城", "海雅繽紛城", "海雅缤纷城商业类"]},
    {"id": 19, "name": "保利香山瑧悦府", "district": "東區", "aliases": ["保利香山瑧悦府", "保利香山臻悦府"]},
    {"id": 20, "name": "朗詩金鐘湖壹號", "district": "東區", "aliases": ["朗诗金钟湖壹号", "朗詩金鐘湖壹號", "金钟湖壹号"]},
    {"id": 21, "name": "華發學府壹號", "district": "石岐", "aliases": ["华发学府壹号", "華發學府壹號"]},
    {"id": 22, "name": "金鷹半山花園", "district": "石岐", "aliases": ["金鹰半山花园", "金鷹半山花園"]},
    {"id": 23, "name": "華立富華薈", "district": "西區", "aliases": ["华立富华荟", "華立富華薈"]},
    {"id": 24, "name": "懿臻山", "district": "南區", "aliases": ["懿臻山"]},
    {"id": 25, "name": "碧桂園·鳳凰城", "district": "南區", "aliases": ["碧桂园凤凰城", "碧桂園鳳凰城", "凤凰城"]},
    {"id": 26, "name": "招商臻灣府", "district": "翠亨", "aliases": ["招商臻湾府", "招商臻灣府"]},
    {"id": 27, "name": "中山粵海城", "district": "翠亨", "aliases": ["中山粤海城", "中山粵海城", "粤海城"]},
    {"id": 28, "name": "中興智慧城·懿禧府", "district": "翠亨", "aliases": ["中兴智慧城", "懿禧府", "中興智慧城懿禧府"]},
    {"id": 29, "name": "保利天匯·熙岸", "district": "翠亨", "aliases": ["保利天汇熙岸", "保利天匯·熙岸"]},
    {"id": 30, "name": "雅居樂灣際壹號", "district": "翠亨", "aliases": ["雅居乐湾际壹号", "雅居樂灣際壹號", "湾际壹号"]},
    {"id": 31, "name": "御峰香林", "district": "火炬", "aliases": ["御峰香林"]},
    {"id": 32, "name": "火炬建發·望江台", "district": "火炬", "aliases": ["火炬建发望江台", "火炬建發望江台", "望江台"]},
    {"id": 33, "name": "東方名都", "district": "火炬", "aliases": ["东方名都", "東方名都"]},
    {"id": 34, "name": "逸駿半島", "district": "坦洲", "aliases": ["逸骏半岛", "逸駿半島"]},
    {"id": 35, "name": "優越香格里", "district": "坦洲", "aliases": ["优越香格里", "優越香格里"]},
    {"id": 36, "name": "保利·和光塵樾", "district": "古鎮", "aliases": ["保利和光尘樾", "保利·和光塵樾", "和光尘樾"]},
    {"id": 37, "name": "星晨·君悦灣", "district": "港口", "aliases": ["星辰君悦湾", "星晨君悦湾", "星晨·君悦灣"]},
    {"id": 38, "name": "鉑灣半島", "district": "南頭", "aliases": ["铂湾半岛", "鉑灣半島"]},
]

# Build lookup maps
ALIAS_TO_CANONICAL: dict[str, str] = {}
for p in PROJECTS:
    for alias in p["aliases"]:
        ALIAS_TO_CANONICAL[alias.lower().strip()] = p["name"]


def match_project(raw_name: str) -> str | None:
    """Fuzzy match a scraped name to a canonical project name. Returns None if no match."""
    # Strip common suffixes that Beike adds
    suffixes = [
        "商业类", "别墅", "待售", "售罄", "在售住宅", "在售",
        "九期", "八期", "七期", "六期", "五期", "四期", "三期", "二期", "一期",
        "2期", "3期", "4期",
    ]
    clean = raw_name.lower().strip()
    for sfx in suffixes:
        if clean.endswith(sfx.lower()):
            clean = clean[:-len(sfx)].strip()

    # 1. Exact alias match (check both original and cleaned)
    if clean in ALIAS_TO_CANONICAL:
        return ALIAS_TO_CANONICAL[clean]
    if raw_name.lower().strip() in ALIAS_TO_CANONICAL:
        return ALIAS_TO_CANONICAL[raw_name.lower().strip()]

    # 2. Substring match
    for p in PROJECTS:
        for alias in p["aliases"]:
            a = alias.lower().strip()
            if len(a) >= 3 and (a in clean or clean in a):
                return p["name"]

    return None


OUTPUT_DIR = "output"
HISTORY_FILE = "history.json"
