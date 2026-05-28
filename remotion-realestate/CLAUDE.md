# CLAUDE.md

Remotion 房产视频项目。为香港/大湾区房产内容创作者打造的 Remotion 视频组件库。

## 项目概述

设计风格：**暖金奢华 + 大地色系**
- 暖黑底色 (#1A1815) + 奢华金主色 (#C8A052)
- Georgia 衬线标题 + PingFang SC 正文
- 厚重弹性动画 + 金光扫过效果
- 65+ SVG 图标（房产/交通/学校/景观）

## 开发命令

```bash
# 安装依赖
npm install

# 启动 Remotion Studio 预览 (http://localhost:3000)
npm run dev

# 渲染视频
npx remotion render src/index.ts <CompositionID> out/video.mp4

# 渲染周排行榜叠加视频 (ProRes 4444 alpha)
npx ts-node scripts/render_ranking.ts ../zs-ranking-agent/output/timeline-latest.json out/zhongshan-ranking.mov

# 升级 Remotion
npx remotion upgrade
```

## 架构

```
src/
├── design-system/           # 设计系统
│   ├── tokens.ts           # 颜色/字体/间距（暖金大地色）
│   └── animations.ts       # Spring 预设/缓动/入场动画
├── components/new/          # 20+ 可复用组件
│   ├── index.ts            # 统一导出
│   ├── HeroTitle.tsx       # 大标题开场
│   ├── SectionTitle.tsx    # 章节标题 + 进度
│   ├── PriceTag.tsx        # 价格展示（HK$万）
│   ├── PropertyCard.tsx    # 房源信息卡
│   ├── FeatureCard.tsx     # 特性卡片
│   ├── MetricCard.tsx      # 数据指标（数字滚动）
│   ├── ComparisonCards.tsx  # 对比卡片
│   ├── ProcessFlow.tsx     # 流程步骤
│   ├── EvolutionTree.tsx   # 演进时间线
│   ├── KnowledgeWeb.tsx    # 知识网络
│   ├── CausalGraph.tsx     # 因果关系图
│   ├── AnimatedList.tsx    # 动画列表
│   ├── DataTable.tsx       # 数据表格
│   ├── HighlightQuote.tsx  # 高亮引用
│   ├── TypewriterText.tsx  # 打字机文字
│   ├── CommentBubble.tsx   # 弹幕评论
│   ├── Transitions.tsx     # 5 种转场效果
│   └── Icons.tsx           # 65+ SVG 图标
├── components/overlay/      # 透明叠加组件 (26 个, JSON 驱动)
│   ├── RankingBarChart.tsx  # 排行榜柱状图 (SVG)
│   ├── TrendLineChart.tsx   # 均价走势折线图 (SVG)
│   └── RankingChangeList.tsx # 涨跌排名列表
├── scenes/demo/            # 演示场景
├── Root.tsx                # Composition 定义
└── index.ts                # 入口
```

## 组件使用模式

### HeroTitle — 开场大标题
```tsx
<HeroTitle
  title="華發觀山水"
  subtitle="港人中山置業首選"
  tags={["低密度", "山景", "現樓"]}
/>
```

### PriceTag — 价格展示
```tsx
<PriceTag
  price={280}
  unit="萬起"
  label="總價"
  suffix="*享港人專屬優惠"
  size="large"
/>
```

### PropertyCard — 房源信息卡
```tsx
<PropertyCard
  property={{
    name: '華發觀山水',
    district: '中山·三鄉',
    price: 280,
    priceUnit: '萬起',
    area: '1,200',
    layout: '三房兩廳',
    tags: ['山景', '現樓', '低密度'],
    highlights: ['270°山景視野', '5分鐘到輕軌站', '港車北上直達'],
  }}
/>
```

### FeatureGrid — 特性卡片
```tsx
<FeatureGrid
  features={[
    { icon: 'bed', title: '三房兩廳', description: '實用面積約1,200呎' },
    { icon: 'train', title: '交通便利', description: '5分鐘到輕軌站' },
    { icon: 'tree', title: '低密度', description: '1.2容積率' },
  ]}
  columns={3}
/>
```

### ProcessFlow — 流程步骤
```tsx
<ProcessFlow
  title="港人中山置業流程"
  steps={[
    { label: '選定樓盤', status: 'complete' },
    { label: '簽訂合同', status: 'complete' },
    { label: '辦理貸款', status: 'active' },
    { label: '過戶登記', status: 'pending' },
    { label: '交樓入伙', status: 'pending' },
  ]}
/>
```

### ComparisonCards — 楼盘对比
```tsx
<ComparisonCards
  title="兩大熱門樓盤 PK"
  items={[
    { label: '中山·華發觀山水', color: 'gold', details: ['280萬起', '山景'] },
    { label: '珠海·峰景灣', color: 'ocean', details: ['350萬起', '海景'] },
  ]}
/>
```

## 动画规范

### Do
- 全部使用 `useCurrentFrame()` 驱动动画
- 使用 `spring()` + `SPRING_PRESETS`
- 使用 `interpolate()` 配合缓动
- 价格数字用 `SPRING_PRESETS.luxury`
- 大标题用 `SPRING_PRESETS.heavy`

### Don't
- **禁止 CSS 动画** (@keyframes)
- **禁止 Tailwind 动画类** (animate-*, transition-*)
- **禁止 emoji** — 用 Icons.tsx 的 SVG 图标
- **禁止硬编码颜色** — 用 `COLORS` 常量

## 图标速查

| 概念 | 图标 | | 概念 | 图标 |
|---|---|---|---|---|
| 房子 | `Home` | | 地铁 | `Train` |
| 楼盘 | `Building` | | 学校 | `School` |
| 高层 | `Tower` | | 商场 | `Shopping` |
| 定位 | `MapPin` | | 绿化 | `Tree` |
| 收楼 | `Key` | | 金钱 | `Currency` |
| 卧室 | `Bed` | | 升值 | `Trending` |
| 面积 | `Ruler` | | 海景 | `Waves` |

```tsx
import { Home, Building, MapPin, Currency } from './components/new/Icons';
```

## 依赖

- remotion 4.0+
- react 19
- typescript 5.0
- tailwindcss 4.0 (仅用于编译，禁止动画类)

## 已安装技能

| 技能 | 用途 |
|------|------|
| Jacky-auto-editing | JSON 驱动的口播叠加视频自动生成（ProRes 4444 alpha → 剪映画中画） |
| Jacky-PNG | 静态透明底 PNG 卡片渲染（柱子哥 13 种款式 + 3 种脚本模板） |
