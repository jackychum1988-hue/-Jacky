"""模块1: 豪宅情报员 — 自动采集目标楼盘动态 + 生成选题简报"""

import sys
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from config import (
    TARGET_COMMUNITIES,
    SEARCH_KEYWORDS,
    REQUEST_TIMEOUT,
    MAX_LISTINGS_PER_COMMUNITY,
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def search_anjuke_listings(community: dict) -> list[dict]:
    """搜索安居客上某楼盘的挂牌信息"""
    items = []
    name = community["name"]
    try:
        search_url = f"https://zhongshan.anjuke.com/sale/?q={name}"
        resp = requests.get(search_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()

        if "验证码" in resp.text or "captcha" in resp.text.lower():
            print(f"[scout] anjuke blocked by captcha for {name}", file=sys.stderr)
            return items

        soup = BeautifulSoup(resp.text, "html.parser")
        for card in soup.select(".property")[:MAX_LISTINGS_PER_COMMUNITY]:
            title_el = card.select_one(".property-content-title-name")
            price_el = card.select_one(".property-price-total")
            info_el = card.select_one(".property-content-info")
            link_el = card.select_one("a[href]")

            title = title_el.get_text(strip=True) if title_el else name
            price = price_el.get_text(strip=True) if price_el else ""
            info = info_el.get_text(strip=True) if info_el else ""
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = "https://zhongshan.anjuke.com" + link

            if price:
                items.append({
                    "community": name,
                    "title": title,
                    "price": price,
                    "info": info,
                    "link": link,
                    "source": "安居客",
                })
    except requests.RequestException as e:
        print(f"[scout] anjuke error for {name}: {e}", file=sys.stderr)
    except Exception as e:
        print(f"[scout] error for {name}: {e}", file=sys.stderr)

    return items


def search_news() -> list[dict]:
    """搜索中山豪宅相关新闻"""
    items = []
    for keyword in SEARCH_KEYWORDS:
        try:
            search_url = f"https://www.baidu.com/s?wd={requests.utils.quote(keyword)}"
            resp = requests.get(search_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            resp.encoding = "utf-8"
            resp.raise_for_status()

            soup = BeautifulSoup(resp.text, "html.parser")
            for result in soup.select(".result")[:3]:
                title_el = result.select_one("h3 a")
                snippet_el = result.select_one(".c-abstract")

                title = title_el.get_text(strip=True) if title_el else ""
                snippet = snippet_el.get_text(strip=True) if snippet_el else ""
                link = title_el.get("href", "") if title_el else ""

                if title:
                    items.append({
                        "title": title,
                        "snippet": snippet,
                        "link": link,
                        "source": f"百度搜索:{keyword}",
                    })
        except Exception as e:
            print(f"[scout] news search error for '{keyword}': {e}", file=sys.stderr)

    return items


def build_brief(listings: list[dict], news: list[dict]) -> str:
    """生成选题简报 Markdown"""
    today = datetime.now().strftime("%Y-%m-%d %A")
    lines = [
        f"🏡 中山壹号墅 · 选题简报",
        f"📅 {today}",
        "",
        "---",
        "",
    ]

    # 挂牌动态
    if listings:
        lines.append("## 📋 目标楼盘挂牌动态")
        lines.append("")
        communities_seen = set()
        for item in listings:
            comm = item["community"]
            if comm not in communities_seen:
                lines.append(f"### {comm}")
                lines.append(f"来源：{item['source']}")
                communities_seen.add(comm)
            lines.append(f"- [{item['title']}]({item['link']}) — {item['price']}")
            if item.get("info"):
                lines.append(f"  {item['info']}")
        lines.append("")

    # 市场新闻
    if news:
        lines.append("## 📰 相关新闻与话题")
        lines.append("")
        for item in news:
            link_md = f"[{item['title']}]({item['link']})" if item.get("link") else item["title"]
            lines.append(f"- {link_md}")
            if item.get("snippet"):
                lines.append(f"  {item['snippet']}")
        lines.append("")

    # 选题建议
    lines.append("---")
    lines.append("")
    lines.append("## 💡 本周选题建议")
    lines.append("")
    lines.append("基于以上信息，本周可考虑以下选题方向：")
    lines.append("")
    lines.append("### 别墅深探（支柱①）")
    for comm in TARGET_COMMUNITIES[:5]:
        listing_count = sum(1 for l in listings if l["community"] == comm["name"])
        if listing_count > 0:
            lines.append(f"- **{comm['name']}**：有{listing_count}个新挂牌，可做深度探访")
        else:
            lines.append(f"- **{comm['name']}**：暂无新挂牌，可做社区全景介绍")
    lines.append("")
    lines.append("### 圈层生活方式（支柱②）")
    lines.append("- 根据当前季节选择应季话题（庭院换季/夏季泳池打理/家庭影院暑期片单）")
    lines.append("")
    lines.append("### 市场内参（支柱③）")
    lines.append("- 如有足够数据，可做月度二手豪宅成交分析")
    lines.append("")
    lines.append("### 个人IP故事（支柱④）")
    lines.append("- 选择最近探访过的一个楼盘写手记")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("> 🤖 由中山壹号墅智能Agent自动生成")
    lines.append("> 📝 选定选题后，运行 `python main.py workshop` 生成初稿")

    return "\n".join(lines)


def run_scout() -> str:
    """运行情报采集，返回选题简报"""
    print(f"[scout] 开始采集 | {datetime.now().isoformat()}")

    all_listings = []
    for comm in TARGET_COMMUNITIES:
        print(f"[scout] 搜索: {comm['name']}")
        listings = search_anjuke_listings(comm)
        all_listings.extend(listings)
        print(f"[scout]   -> {len(listings)} 条挂牌")

    print(f"[scout] 搜索新闻")
    news = search_news()
    print(f"[scout]   -> {len(news)} 条新闻")

    brief = build_brief(all_listings, news)
    print(f"[scout] 简报生成完成，共 {len(brief)} 字符")
    return brief
