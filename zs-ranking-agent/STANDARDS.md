# 中山楼盘每周排行榜 — 制作标准

> **适用**: 所有排行榜视频渲染，包括自动爬虫和手动编译数据
> **制定日期**: 2026-05-31
> **基准成品**: `out/zhongshan-ranking-2026-02.mov`

---

## 一、数据格式标准

### 1.1 history.json 结构

```json
{
  "updated": "YYYY-MM-DD",
  "source": "数据来源说明",
  "period": "数据覆盖周期",
  "total_units": 全市成交套数,
  "avg_price": 全市均价,
  "volume": { "楼盘名": {"value": 套数}, ... },
  "popularity": { "楼盘名": {"value": 关注人数}, ... },
  "prices": { "楼盘名": 当前均价, ... },
  "trend": {
    "weeks": ["W1", "W2", ...],
    "prices": [均价1, 均价2, ...]
  }
}
```

### 1.2 聚合数据格式 (aggregated dict)

```python
{
    "volume_ranking": [
        {"name": "楼盘名", "value": 成交套数, "changePct": 环比变化%},
        # ... TOP10
    ],
    "popularity_ranking": [
        {"name": "楼盘名", "value": 关注人数, "changePct": 环比变化%},
        # ... TOP10
    ],
    "change_ranking": [
        {"name": "楼盘名", "priceBefore": 上月均价, "priceAfter": 本月均价, "changePct": 涨跌%},
        # ... TOP10 (按涨跌绝对值排序)
    ],
    "trend_data": {
        "weeks": ["W1", ...],  # 最多8周
        "prices": [均价1, ...]
    }
}
```

### 1.3 数据来源优先级

| 优先级 | 成交量 | 热度 | 均价 |
|--------|--------|------|------|
| 1 | 合富研究院周报(微信/新闻转载) | 贝壳找房搜索页面 | 房天下/58爱房挂牌价 |
| 2 | 住建局网签系统(113.106.13.237:82) | Bing 缓存贝壳页面 | 住建局网签公示 |
| 3 | WebSearch 手动编译 | WebSearch 手动编译 | WebSearch 手动编译 |

---

## 二、视频参数标准

| 参数 | 值 | 不可更改 |
|------|-----|----------|
| 分辨率 | **1080×1920** (竖屏) | ✅ |
| 帧率 | **30fps** | ✅ |
| 编码 | **ProRes 4444** | ✅ |
| 像素格式 | **yuva444p10le** (含Alpha) | ✅ |
| 图片格式 | **PNG** | ✅ |
| 总时长 | **68秒 / 2040帧** | —— |
| 总元素数 | **9个** | —— |

### 时间分段 (2040帧)

| 段 | 起始帧 | 结束帧 | 时长 | 组件 |
|----|--------|--------|------|------|
| 标题 | 0 | 90 | 3s | `HookCard` |
| 成交量榜 | 90 | 690 | 20s | `RankingBarChart` |
| 热度榜 | 720 | 1320 | 20s | `RankingBarChart` |
| 涨跌榜 | 1350 | 1950 | 20s | `RankingChangeList` + `TrendLineChart` |
| 片尾 | 1980 | 2040 | 2s | `EndCard` |

---

## 三、组件属性标准

### 3.1 HookCard (标题卡)

```json
{
  "type": "HookCard",
  "enterAt": 0, "exitAt": 90,
  "animation": "spring", "position": "center",
  "props": {
    "label": "中山楼盘数据周报",
    "headline": "本周排行榜",
    "subline": "成交量 TOP10 · 热度 TOP10 · 涨跌 TOP10  |  YYYY.MM.DD",
    "color": "#C8A052"
  }
}
```

### 3.2 KeywordTag (段标签)

```json
{
  "type": "KeywordTag",
  "enterAt": 70, "exitAt": 690,
  "animation": "fade", "position": "safe-top",
  "props": { "text": "成交量榜", "color": "#C8A052", "size": "lg" }
}
```

三个段颜色：成交量 `#C8A052`、热度 `#F5A623`、涨跌 `#10B981`

### 3.3 RankingBarChart (排行榜柱状图)

```json
{
  "type": "RankingBarChart",
  "enterAt": 90, "exitAt": 690,
  "animation": "spring", "position": "center",
  "props": {
    "title": "本周成交量 TOP10",
    "items": [{"name": "...", "value": N, "changePct": N.N}],
    "unit": "套",
    "color": "#C8A052"
  }
}
```

### 3.4 RankingChangeList (涨跌列表)

```json
{
  "type": "RankingChangeList",
  "enterAt": 1350, "exitAt": 1950,
  "animation": "spring", "position": "center",
  "props": {
    "title": "本周涨跌 TOP10",
    "items": [{"name": "...", "priceBefore": N, "priceAfter": N, "changePct": N.N}],
    "color": "#10B981"
  }
}
```

### 3.5 TrendLineChart (均价走势)

```json
{
  "type": "TrendLineChart",
  "enterAt": 1380, "exitAt": 1950,
  "animation": "fade", "position": "bottom-right",
  "offset": {"x": -40, "y": -40},
  "props": {
    "weeks": ["W5","W6",...],
    "prices": [13800, 13750, ...],
    "title": "近8周均价走势",
    "color": "#C8A052"
  }
}
```

### 3.6 EndCard (片尾)

```json
{
  "type": "EndCard",
  "enterAt": 1980, "exitAt": 2040,
  "animation": "fade", "position": "center",
  "props": {
    "channelName": "港人中山置业通Jacky",
    "subscribeText": "关注我 · 每周更新中山楼盘数据",
    "color": "#C8A052"
  }
}
```

---

## 四、视觉标准 (不可违反)

### 4.1 透明度和背景

| 元素 | 背景色 | 边框 |
|------|--------|------|
| 图表背板 | `rgba(10,8,6,0.38)` | `1px solid rgba(color, 0.15)` |
| 排行行背景 | `rgba(10,8,6,0.35)` | 无边框 |
| 圆角 | `16px` (背板) / `12px` (行) | —— |

### 4.2 严禁项

- ❌ **backdropFilter: blur()** — 导致过度渲染
- ❌ **boxShadow 辉光** — 污染透明通道
- ❌ **textShadow 发光** — 文字模糊
- ❌ **emoji 字符** (↑↓→等) — 使用 SVG polygon
- ❌ **CSS @keyframes / Tailwind animate-*** — 使用 useCurrentFrame()
- ❌ **硬编码字体** — 使用 F.display / F.text / F.mono

### 4.3 色彩映射

| 用途 | 色值 | 场景 |
|------|------|------|
| 暖金主色 | `#C8A052` | 成交量榜、标题、走势图、片尾 |
| 琥珀色 | `#F5A623` | 热度榜 |
| 翠绿色 | `#10B981` | 涨跌榜 |
| 纯白文字 | `#FFFFFF` (C.text) | 标题/频道名 |
| 奶白文字 | `#F5F0E8` (C.textSecondary) | 楼盘名/副标题 |
| 暖灰文字 | `#C8BFA8` (C.textTertiary) | 数值/辅助信息 |
| 灰蓝(跌) | `#6B7B8D` | 下跌箭头/百分比 |

### 4.4 字体规范

- 标题/频道名: `F.display` (Inter / Noto Sans SC)
- 正文/楼盘名: `F.text` (Inter / PingFang SC)
- 数字: `F.mono` (SF Mono / JetBrains Mono)

---

## 五、渲染命令

```bash
# 1. 生成数据 (二选一)
cd zs-ranking-agent
python main.py              # 自动爬虫 (CI 环境)
python run_real_data.py     # 手动编译 (爬虫失败时)

# 2. 渲染视频
cd remotion-realestate
npx ts-node scripts/render_ranking.ts \
  ../zs-ranking-agent/output/timeline-latest.json \
  "out/zhongshan-ranking-$(date +%Y-%m-%d).mov"

# 3. 验证 Alpha 通道
ffprobe -v quiet -show_streams out/zhongshan-ranking-*.mov | grep pix_fmt
# 预期: pix_fmt=yuva444p12le
```

---

## 六、质量标准检查清单

渲染完成后逐项确认：

- [ ] `ffprobe` 确认 `pix_fmt=yuva444p12le`
- [ ] 文件大小 > 500MB (内容充足)
- [ ] 拖入剪映画中画 → 透明区域可见底层视频
- [ ] 三个榜单各10条数据，无空榜
- [ ] 文字清晰无模糊，无辉光溢出
- [ ] 颜色分明：成交量金、热度橙、涨跌绿
- [ ] 片尾 "港人中山置业通Jacky" 清晰
- [ ] 无 emoji，箭头为 SVG 三角形
