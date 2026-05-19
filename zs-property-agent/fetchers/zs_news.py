import feedparser
from datetime import datetime, timedelta
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

ZS_NEWS_RSS = "https://www.zsnews.cn/index.php/rss/index/index"


def fetch_zs_news() -> list[dict]:
    items = []
    try:
        feed = feedparser.parse(ZS_NEWS_RSS)
        recent = datetime.now() - timedelta(days=3)

        for entry in feed.entries[:MAX_ITEMS_PER_SOURCE]:
            title = entry.get("title", "")
            link = entry.get("link", "")
            summary = entry.get("summary", "")
            published = entry.get("published", "")

            try:
                from email.utils import parsedate_to_datetime
                pub_date = parsedate_to_datetime(published)
                pub_date = pub_date.replace(tzinfo=None)
                if pub_date < recent:
                    continue
            except (ValueError, TypeError):
                pass

            relevant_keywords = ["房", "楼", "深中", "城建", "规划", "公积金", "政策"]
            if any(kw in title for kw in relevant_keywords):
                items.append({
                    "title": title,
                    "link": link,
                    "summary": _clean_html(summary)[:200],
                    "date": published,
                })
    except Exception:
        pass

    return items


def _clean_html(raw: str) -> str:
    from html import unescape
    import re
    text = re.sub(r"<[^>]+>", "", raw)
    return unescape(text).strip()
