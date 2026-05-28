"""中山住建局 — 商品房网签成交数据爬虫."""
import requests
from bs4 import BeautifulSoup
from datetime import datetime


def fetch_transactions() -> list[dict]:
    """Fetch weekly transaction data from ZS housing bureau.

    Returns:
        [{project_name: str, units_sold: int, area_sqm: float, avg_price: float}]
    """
    results: list[dict] = []

    urls = [
        "https://jsj.zs.gov.cn/zwgk/zfcx/",
        "https://jsj.zs.gov.cn/zwgk/tjxx/",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }

    for url in urls:
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows:
                    cells = row.find_all(["td", "th"])
                    if len(cells) < 4:
                        continue
                    text_cells = [c.get_text(strip=True) for c in cells]
                    for i, cell_text in enumerate(text_cells):
                        if i + 3 >= len(text_cells):
                            break
                        project = cell_text
                        try:
                            units = int(text_cells[i + 1].replace(",", "").replace("套", ""))
                            area = float(text_cells[i + 2].replace(",", "").replace("㎡", "").replace("m2", ""))
                            price = float(text_cells[i + 3].replace(",", "").replace("元", "").replace("/㎡", ""))
                            if units > 0 and 5000 < price < 50000:
                                results.append({
                                    "project_name": project,
                                    "units_sold": units,
                                    "area_sqm": area,
                                    "avg_price": price,
                                    "source": "zs_gov",
                                    "fetched_at": datetime.now().isoformat(),
                                })
                        except (ValueError, IndexError):
                            continue
            if results:
                break
        except Exception as e:
            print(f"[zs_gov] Error fetching {url}: {e}")
            continue

    if not results:
        print("[zs_gov] No structured data found. Returning empty — check report for manual fill.")

    return results
