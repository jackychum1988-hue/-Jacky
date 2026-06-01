# KOL 竞品内容分析系统 — 设计文档

## 概述

定期抓取香港房产 KOL 在 YouTube、小红书、Facebook、视频号的内容，分析话题策略和高频关键词，输出差异化选题建议。日报快讯（每日 7:00）+ 周报深度分析（每周一 7:00），通过 PushPlus 推送至微信。

## 架构

```
kol-watcher-agent/
├── main.py              # 入口，支持 --mode daily|weekly
├── config.py            # KOL 列表、搜索词、平台配置
├── fetchers/
│   ├── youtube_kol.py       # YouTube Data API v3
│   ├── xiaohongshu_kol.py   # Bing site:xiaohongshu.com
│   ├── facebook_kol.py      # Bing site:facebook.com
│   └── shipinhao_kol.py     # 搜索+内容提取
├── analyzer.py          # DeepSeek AI（daily轻量/weekly深度）
├── reporter.py          # Markdown 日报+周报生成
├── dedup.py             # 7天URL去重
├── history.json         # 话题/关键词时间序列追踪
├── pusher.py            # PushPlus 微信推送
├── .env.example
└── requirements.txt
```

独立 agent，与现有 zs-property-agent / sanjie-soup-agent / moments-agent / zhongshan-villa-agent 平级。

## 监控 KOL 配置

### YouTube（7 个频道）

| 频道 | 订阅 | 定位 |
|------|------|------|
| CKBRO 置家兄弟 | 125K | 大湾区综合 |
| 容易置業/容易工作室 | 91.7K | 中山专精 |
| Winson講樓 | 22.1K | 媒体人背景 |
| Heartbeat Home 心動家 | 13.6K | 中山生活+睇楼 |
| Nana珠海中山置業頻道 | — | 港人专属 |
| 灣區順易置業 | — | 中山免佣 |
| 灣區博士沈永年 | — | 低首付推广 |

### 小红书（6 个博主）

罗宾Sir（湾区王）、汤姆港房 Tom、Mango、阿阁、孙慧雪、王俊棠在湾区

### Facebook

搜索词模式动态发现：`大灣區置業` / `中山買樓 港人` / `珠海睇樓團` 等

### 视频号（4 个博主，聚焦中山）

汤姆港房 Tom、罗宾Sir、Mango、阿阁

## 输出结构

### 日报快讯（≤500字）

- 今日发布动态（逐条摘要，每条≤30字）
- 今日热词（TOP10，排除通用词）
- 话题风向（2-3个热点方向）
- 差异化选题建议（2-3个，含标题+切入角度+差异化说明）

### 周报（2000-3000字）

- 本周概览（内容数/互动量/KOL数，vs上周）
- 话题趋势分析（TOP5话题+趋势标记）
- 关键词排行榜（TOP20+新兴关键词）
- 爆款内容拆解（TOP3，Hook/结构/情绪点）
- 蓝海发现（竞品未覆盖话题）
- 差异化选题建议（3-5个完整选题）
- 下周预测

## Analyzer 提示词

### 日报模式
轻量分析：发布动态摘要 → 热词提取 → 话题风向 → 差异化选题（结合Jacky三大内容支柱：带客看房50%/专业知识30%/个人生活20%）。粤语口语输出。

### 周报模式
深度分析：7天趋势对比 → TOP20关键词 → 爆款拆解 → 蓝海发现 → 完整选题建议（含受众情绪预期） → 下周热点预测。数据驱动，拒绝空泛。

## Fetchers

| 平台 | 方法 | 局限 |
|------|------|------|
| YouTube | Data API v3 search.list + videos.list，按频道ID抓取最近3天 | 受API配额限制 |
| 小红书 | Bing `site:xiaohongshu.com` + 博主名搜索 | 非实时，依赖搜索引擎收录 |
| Facebook | Bing `site:facebook.com` + 搜索词 | 封闭群组不可达 |
| 视频号 | Bing搜索 + 微信搜一搜 | 封闭性强，覆盖率有限 |

统一输出格式：`[{title, url, description, published_at, platform, author, engagement}]`，每个 fetcher 30秒超时，独立 try/except 不阻断其他平台。

## GitHub Actions

- `kol-watch-daily.yml`：每天 23:23 UTC（北京时间 7:23），mode=daily
- `kol-watch-weekly.yml`：每周一 23:23 UTC，mode=weekly，上传 output/ artifact

共用已有 secrets：DEEPSEEK_API_KEY、YOUTUBE_API_KEY、PUSHPLUS_TOKEN。

## 错误处理

| 场景 | 策略 |
|------|------|
| 单平台抓取失败 | 跳过，标注"未获取到" |
| 全部平台失败 | 推送"数据暂不可用" |
| DeepSeek API 超时/限流 | retry 1次（truncate 50%），失败降级为纯数据汇总 |
| YouTube 配额耗尽 | 降级为 Bing 搜索 |
| 当日无新内容 | 推送"今日竞品无更新" |

## history.json 结构

```json
{
  "weeks": {
    "2026-W22": {
      "top_keywords": {},
      "top_topics": [],
      "total_posts": 0,
      "top_kols": []
    }
  },
  "seen_urls": {}
}
```

## 验证

1. `python main.py --mode daily` → 检查 PushPlus 推送
2. `python main.py --mode weekly` → 检查 output/ 输出
3. 检查 `.seen_urls.json` 去重
4. 手动触发 GitHub Actions 端到端验证
