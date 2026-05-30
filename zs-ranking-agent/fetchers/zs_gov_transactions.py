"""中山住建局 / 合富研究院 — 商品房网签成交数据爬虫.

数据来源:
1. 中山住建局网签查询系统 http://113.106.13.237:82/
2. 合富研究院周度网签龙虎榜 (通过新闻媒体转载获取)
3. 中山乐居/房天下等媒体周报

策略: 尝试直接查询住建局系统, 失败则从新闻媒体搜索合富周报数据.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re


def fetch_transactions() -> list[dict]:
    """Fetch weekly transaction data for Zhongshan projects.

    Returns:
        [{project_name: str, units_sold: int, area_sqm: float, avg_price: float, source: str}]
    """
    results: list[dict] = []

    # Strategy 1: Try direct government query system
    results = _try_gov_query()
    if results:
        return results

    # Strategy 2: Search news media for 合富研究院 weekly report
    results = _try_news_scrape()
    if results:
        return results

    print("[zs_gov] No data found from any source.")
    return []


def _try_gov_query() -> list[dict]:
    """Try the real ZS housing bureau query system."""
    results: list[dict] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "http://jsj.zs.gov.cn/",
    }

    urls = [
        "http://113.106.13.237:82/",
        "https://jsj.zs.gov.cn/zwgk/zwdt/",
        "https://jsj.zs.gov.cn/gkmlpt/content/2/2495/post_2495409.html",
    ]

    for url in urls:
        try:
            resp = requests.get(url, headers=headers, timeout=15, verify=False)
            if resp.status_code != 200:
                print(f"[zs_gov] HTTP {resp.status_code} for {url}")
                continue

            soup = BeautifulSoup(resp.text, "html.parser")

            # Look for table rows with transaction data
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows:
                    cells = row.find_all(["td", "th"])
                    if len(cells) < 3:
                        continue
                    text_cells = [c.get_text(strip=True) for c in cells]

                    # Try to find rows with project name + numbers
                    for i, cell_text in enumerate(text_cells):
                        if i + 2 >= len(text_cells):
                            break
                        # Check if this cell looks like a project name (Chinese chars, 2-8 chars)
                        if not re.search(r'[一-鿿]', cell_text):
                            continue
                        if len(cell_text) < 2 or len(cell_text) > 20:
                            continue

                        try:
                            # Try to parse adjacent cells as numbers
                            next_val = text_cells[i + 1].replace(",", "").replace("套", "").strip()
                            units = int(next_val) if next_val.isdigit() else 0
                            if units <= 0:
                                continue

                            price = 0.0
                            area = 0.0
                            if i + 2 < len(text_cells):
                                try:
                                    price_str = text_cells[i + 2].replace(",", "").replace("元", "").replace("/㎡", "").strip()
                                    price = float(price_str) if re.match(r'^\d+', price_str) else 0.0
                                except ValueError:
                                    pass

                            if units > 0 and (price == 0.0 or 5000 < price < 50000):
                                results.append({
                                    "project_name": cell_text,
                                    "units_sold": units,
                                    "area_sqm": area,
                                    "avg_price": price,
                                    "source": "zs_gov",
                                    "fetched_at": datetime.now().isoformat(),
                                })
                        except (ValueError, IndexError):
                            continue

            if results:
                print(f"[zs_gov] Found {len(results)} records from {url}")
                break
        except requests.exceptions.SSLError:
            print(f"[zs_gov] SSL error for {url}, skipping")
            continue
        except Exception as e:
            print(f"[zs_gov] Error fetching {url}: {e}")
            continue

    return results


def _try_news_scrape() -> list[dict]:
    """Try to scrape 合富研究院 weekly report from news media.

    The 合富研究院 weekly 网签龙虎榜 is republished by multiple outlets:
    - 中山乐居 (zs.leju.com)
    - 搜狐焦点中山
    - 房天下 (zs.fang.com)
    - 微信公众号文章
    """
    results: list[dict] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
    }

    # Search for recent weekly report URLs
    search_urls = [
        "https://zs.leju.com/news/2026-04-09/16117447919004163044838.shtml",
    ]

    for url in search_urls:
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code != 200:
                print(f"[zs_gov-news] HTTP {resp.status_code} for {url}")
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            text = soup.get_text()

            # Look for patterns like: "XX项目 XX套" or "XX楼盘 网签XX套"
            # Common patterns in 合富 reports:
            # "第一名：XXX，网签XX套"
            # "TOP1：XXX 成交XX套"
            patterns = [
                r'(?:第[一二三四五六七八九十\d]+名[：:]\s*)?([一-鿿·]+?(?:花园|城|湾|府|苑|郡|台|岸|匯|汇|壹号|天寓|半山|香林|半岛|名都|春城|康城|国际|公馆|瑧悦|琅悦))\s*(?:网签|成交|销售)?\s*(\d+)\s*套',
                r'([一-鿿·]{2,8}(?:花园|城|湾|府|苑|郡|台|岸|匯|汇|壹号|天寓|半山|香林|半岛|名都|春城|康城|国际|公馆|瑧悦|琅悦))\s+(\d+)\s*套',
            ]

            for pattern in patterns:
                matches = re.findall(pattern, text)
                for match in matches:
                    project_name = match[0].strip()
                    units = int(match[1])
                    if units > 0:
                        # Avoid duplicates
                        if not any(r["project_name"] == project_name for r in results):
                            results.append({
                                "project_name": project_name,
                                "units_sold": units,
                                "area_sqm": 0.0,
                                "avg_price": 0.0,
                                "source": "hefu_news",
                                "fetched_at": datetime.now().isoformat(),
                            })

            if results:
                print(f"[zs_gov-news] Extracted {len(results)} records from {url}")
                break
        except Exception as e:
            print(f"[zs_gov-news] Error for {url}: {e}")
            continue

    return results
