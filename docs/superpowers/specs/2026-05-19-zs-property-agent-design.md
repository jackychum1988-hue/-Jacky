# 中山房产智能日报 Agent 设计文档

## 目标

每天早上 9:00（北京时间）自动搜集中山房产相关信息，通过 PushPlus 推送到个人微信，作为「港人中山置业通Jacky」IP 内容素材来源。

## 架构

```
GitHub Actions (UTC 1:00 = 北京时间 9:00)
  └─ 触发 main.py
       ├─ 并发抓取 6 路信息源
       ├─ 解析并提取关键信息
       ├─ 汇总为 Markdown 日报
       └─ 调用 PushPlus API 推送到微信
```

## 信息源

| # | 来源 | URL | 内容 | 抓取方式 |
|---|------|-----|------|----------|
| 1 | 安居客中山 | zs.fang.anjuke.com | 新盘价格/户型/开盘/优惠 | requests + BeautifulSoup |
| 2 | 中山住建局 | jsj.zs.gov.cn | 购房政策/公积金/补贴 | requests + RSS/HTML |
| 3 | 中山日报 | zsnews.cn | 城建/深中通道/楼市新闻 | RSS |
| 4 | 抖音房产主播 | 通过搜索 | 罗宾Sir/小强总/东哥找房/冉Sir 最新更新 | requests + HTML |
| 5 | YouTube | youtube.com | "中山 买房" "中山 楼盘" 热门短片 | YouTube Data API v3 |
| 6 | Facebook | facebook.com | 中山房产相关热门帖文 | 通过搜索引擎代理发现 |

## 技术栈

- 语言：Python 3.11+
- 依赖：`requests`, `beautifulsoup4`, `feedparser`, `google-api-python-client`
- 调度：GitHub Actions (schedule: cron `0 1 * * *`)
- 推送：PushPlus HTTP API

## 配置项（GitHub Secrets）

| Secret | 说明 |
|--------|------|
| `PUSHPLUS_TOKEN` | PushPlus 消息推送 Token |
| `YOUTUBE_API_KEY` | YouTube Data API v3 密钥 |

## 日报输出格式

```
🏠 中山房产日报 | YYYY-MM-DD

📰 【政策与城建】
- 标题 + 摘要 + 来源链接

🏗 【新盘动态】
- 楼盘名：区域，均价xxx，户型xxx，动态描述

🎙 【抖音主播动态】
- 主播名 今日更新：标题 + 链接

📺 【YouTube热门】
- 标题 + 频道名 + 播放量 + 链接

📘 【Facebook热门】
- 帖文摘要 + 来源 + 链接
```

## 文件结构

```
d:\房产个人IP香港\zs-property-agent\
├── main.py              # 入口，编排全部流程
├── fetchers/
│   ├── __init__.py
│   ├── anjuke.py        # 安居客抓取
│   ├── zs_gov.py        # 住建局政策
│   ├── zs_news.py       # 中山日报
│   ├── douyin_bloggers.py  # 抖音主播
│   ├── youtube_search.py   # YouTube搜索
│   └── facebook_search.py  # Facebook搜索
├── reporter.py          # 汇总生成 Markdown 日报
├── pusher.py            # PushPlus 推送
├── requirements.txt
└── .github/workflows/
    └── daily-report.yml # GitHub Actions 定时任务
```

## 约束

- 仅读取公开网页信息，不做任何需要登录的抓取
- 单次运行控制在 2 分钟内完成（GitHub Actions 免费额度内）
- PushPlus 免费版每日 200 条，本任务每天消耗 1 条
