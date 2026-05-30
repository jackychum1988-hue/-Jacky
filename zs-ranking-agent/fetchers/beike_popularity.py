"""贝壳找房 — 楼盘关注人数 & 挂牌均价爬虫.

策略:
1. 直接搜索贝壳楼盘页面提取关注数和均价
2. Bing 搜索缓存页面作为降级方案
3. 都失败则返回空，由 aggregator 处理
"""
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import quote


def fetch_popularity(project_names: list[str]) -> list[dict]:
    """Fetch follower count and listing price from Beike for given projects.

    Returns:
        [{project_name: str, followers: int, listing_avg_price: float, source: str}]
    """
    results: list[dict] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://zs.ke.com/",
    }

    for name in project_names[:15]:  # Limit to 15 to avoid being blocked
        data = _try_direct_beike(name, headers)
        if data:
            results.append(data)
            continue

        # Fallback: Bing cached search
        data = _try_bing_beike(name)
        if data:
            results.append(data)

    print(f"[beike] Got {len(results)}/{len(project_names)} projects with data")
    return results


def _try_direct_beike(name: str, headers: dict) -> dict | None:
    """Try direct Beike search for a project."""
    try:
        search_url = f"https://zs.ke.com/loupan/pg1/?key={quote(name)}"
        resp = requests.get(search_url, headers=headers, timeout=15)
        if resp.status_code != 200:
            print(f"[beike] HTTP {resp.status_code} for {name}")
            return None

        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text()

        followers = 0
        avg_price = 0.0

        # Extract followers (关注人数) from text patterns
        follow_match = re.search(r'(\d[\d,]*)\s*人(?:关注|已关注)', text)
        if follow_match:
            followers = int(follow_match.group(1).replace(",", ""))

        # Extract average price (均价)
        price_match = re.search(r'(\d[\d,]*)\s*元/㎡', text)
        if price_match:
            avg_price = float(price_match.group(1).replace(",", ""))

        if followers > 0 or avg_price > 0:
            return {
                "project_name": name,
                "followers": followers,
                "listing_avg_price": avg_price,
                "source": "beike",
                "fetched_at": datetime.now().isoformat(),
            }
    except Exception as e:
        print(f"[beike] Error for {name}: {e}")

    return None


def _try_bing_beike(name: str) -> dict | None:
    """Bing search fallback for Beike data."""
    try:
        search_url = f"https://www.bing.com/search?q=site:zs.ke.com+{quote(name)}+%E6%A5%BC%E7%9B%98"
        resp = requests.get(search_url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }, timeout=10)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text()

        followers = 0
        # Look for patterns in search snippets
        follow_match = re.search(r'(\d[\d,]*)\s*人(?:关注|已关注)', text)
        if follow_match:
            followers = int(follow_match.group(1).replace(",", ""))

        avg_price = 0.0
        price_match = re.search(r'(\d[\d,]*)\s*元/㎡', text)
        if price_match:
            avg_price = float(price_match.group(1).replace(",", ""))

        if followers > 0 or avg_price > 0:
            return {
                "project_name": name,
                "followers": followers,
                "listing_avg_price": avg_price,
                "source": "beike_bing",
                "fetched_at": datetime.now().isoformat(),
            }
    except Exception as e:
        print(f"[beike-bing] Error for {name}: {e}")

    return None
