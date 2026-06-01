"""贝壳找房 — 楼盘价格 & 热度爬虫.

解析 zs.ke.com/loupan 列表页 DOM:
- resblock-name → 项目名称
- resblock-desc-wrapper → 含均价 "XXXXX元/㎡(均价)"
- 分页抓取直到匹配所有目标项目
"""
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime


def fetch_popularity(project_names: list[str]) -> list[dict]:
    """Fetch prices from Beike listing pages, match to canonical names."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://zs.ke.com/",
    }

    from config import match_project

    all_items: dict[str, dict] = {}  # canonical_name → {followers, price}
    target_set = set(project_names)

    for page in range(1, 20):  # Max 20 pages (~200 projects)
        try:
            url = f"https://zs.ke.com/loupan/pg{page}/"
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code != 200:
                print(f"[beike] pg{page}: HTTP {resp.status_code}")
                break

            soup = BeautifulSoup(resp.text, "html.parser")
            name_elems = soup.find_all(class_="resblock-name")

            if not name_elems:
                print(f"[beike] pg{page}: no listings found, stopping")
                break

            for elem in name_elems:
                # Clean project name (remove "在售住宅"/"在售"/"售罄" etc.)
                raw_name = elem.get_text(strip=True)
                clean_name = re.sub(r'(在售住宅|在售|售罄|待售|已售完)', '', raw_name).strip()

                # Fuzzy match to canonical name
                canonical = match_project(clean_name)
                if not canonical:
                    continue

                # Find price: resblock-name is a child of resblock-desc-wrapper
                # which contains the price text directly
                price = 0.0
                desc_parent = elem.parent  # resblock-desc-wrapper
                if desc_parent:
                    pm = re.search(r'(\d[\d,]+)\s*元/㎡\s*[\(（]均价[\)）]', desc_parent.get_text())
                    if pm:
                        price = float(pm.group(1).replace(",", ""))

                if canonical not in all_items:
                    all_items[canonical] = {
                        "project_name": canonical,
                        "followers": 0,
                        "listing_avg_price": price,
                        "source": "beike",
                        "fetched_at": datetime.now().isoformat(),
                    }
                elif price > all_items[canonical]["listing_avg_price"]:
                    all_items[canonical]["listing_avg_price"] = price

            found = len(all_items)
            print(f"[beike] pg{page}: {len(name_elems)} listings, matched {found}/{len(target_set)} targets")

            # Stop early if all targets found
            if found >= len(target_set):
                break

        except Exception as e:
            print(f"[beike] pg{page} error: {e}")
            continue

    results = list(all_items.values())
    print(f"[beike] Total: {len(results)}/{len(target_set)} projects with price data")
    return results
