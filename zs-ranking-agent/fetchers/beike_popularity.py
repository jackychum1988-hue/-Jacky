"""贝壳找房 — 楼盘关注人数 & 挂牌均价爬虫."""
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime


def fetch_popularity(project_names: list[str]) -> list[dict]:
    """Fetch follower count and listing price from Beike for given projects.

    Args:
        project_names: list of canonical project names to search for

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

    for name in project_names:
        try:
            search_url = f"https://zs.ke.com/loupan/pg1/?key={name}"
            resp = requests.get(search_url, headers=headers, timeout=15)
            if resp.status_code != 200:
                print(f"[beike] HTTP {resp.status_code} for {name}")
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            followers = 0
            for span in soup.find_all("span"):
                text = span.get_text(strip=True)
                if "关注" in text or "人关注" in text:
                    digits = "".join(c for c in text if c.isdigit())
                    if digits:
                        followers = int(digits)
                        break

            avg_price = 0.0
            for span in soup.find_all(["span", "em"]):
                text = span.get_text(strip=True)
                if "元/㎡" in text:
                    digits = "".join(c for c in text if c.isdigit())
                    if digits:
                        avg_price = float(digits)
                        break

            if followers > 0 or avg_price > 0:
                results.append({
                    "project_name": name,
                    "followers": followers,
                    "listing_avg_price": avg_price,
                    "source": "beike",
                    "fetched_at": datetime.now().isoformat(),
                })

        except Exception as e:
            print(f"[beike] Error for {name}: {e}")
            continue

    if len(results) < 5:
        results += _bing_fallback(project_names, results)

    return results


def _bing_fallback(project_names: list[str], existing: list[dict]) -> list[dict]:
    """Bing search fallback for projects not found via direct Beike search."""
    existing_names = {r["project_name"] for r in existing}
    missing = [n for n in project_names if n not in existing_names]
    results: list[dict] = []

    for name in missing[:10]:
        try:
            search_url = f"https://www.bing.com/search?q=site:zs.ke.com+{name}"
            resp = requests.get(search_url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "lxml")
                snippets = soup.find_all("li", class_="b_algo")
                for snip in snippets:
                    text = snip.get_text()
                    if "人关注" in text:
                        m = re.search(r"(\d+)\s*人关注", text)
                        if m:
                            results.append({
                                "project_name": name,
                                "followers": int(m.group(1)),
                                "listing_avg_price": 0.0,
                                "source": "beike_bing_fallback",
                                "fetched_at": datetime.now().isoformat(),
                            })
                            break
        except Exception as e:
            print(f"[beike-bing] Error for {name}: {e}")
            continue

    return results
