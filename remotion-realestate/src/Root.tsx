// Root.tsx - Remotion Composition 注册入口

import React from 'react';
import { Composition, Still, AbsoluteFill, useCurrentFrame } from 'remotion';
import './index.css';
import { RealEstateDemo } from './scenes/demo/RealEstateDemo';
import { GangHangHuiIntro, GangHangHuiSchema } from './scenes/demo/GangHangHuiIntro';
import { JackyIntroOutro } from './scenes/demo/JackyIntroOutro';
import { GangHangHuiAd, GangHangHuiAdSchema } from './scenes/ads/GangHangHuiAd';
import {
  GangHangHuiModern,
  GangHangHuiModernSchema,
  DURATION_IN_FRAMES,
} from './scenes/ads/GangHangHuiModern';
import { GangHangHuiOverlay, GangHangHuiOverlaySchema } from './scenes/ads/GangHangHuiOverlay';
import { LegalTrapsOverlay, LegalTrapsOverlaySchema } from './scenes/ads/LegalTrapsOverlay';
import { ManCaveOverlay, ManCaveOverlaySchema } from './scenes/ads/ManCaveOverlay';
import { ComparisonCards, SectionTitle, ProcessFlow, HeroProductTitle } from './components/new';
import { IconCloudScene } from './scenes/IconCloudScene';
import { PipOverlay, PipOverlaySchema } from './scenes/PipOverlay';
import { FullBgOverlay, FullBgOverlaySchema } from './scenes/FullBgOverlay';
import { DataSourceCard } from './scenes/DataSourceCard';
import { CityPriceDataSource } from './scenes/CityPriceDataSource';
import { SidaizhaiDataSource } from './scenes/SidaizhaiDataSource';
import { SidaizhaiProjectsShowcase } from './scenes/SidaizhaiProjectsShowcase';
import { SeazenMotionDemo } from './scenes/SeazenMotionDemo';
import { COLORS } from './design-system/tokens';
import propertyCostRanking from '../config/property-cost-ranking.json';
import dualContractTimeline from '../config/dual-contract-timeline.json';
import parkSeasonsInfo from '../config/park-seasons-info.json';
import parkSeasonsResettlement from '../config/park-seasons-resettlement.json';
import zhongshanComparison from '../config/zhongshan-comparison.json';
import renovationTrapsTimeline from '../config/renovation-traps-v1.json';
import seazenFundSafetyTimeline from '../config/seazen-fund-safety-v1.json';
import { SundipCover, DataCover, OpinionCover, WarningCover } from './covers';

// ====== 主 Root 组件 ======

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 房产视频组件演示 */}
      {/* 港航匯開場大標題 — 参数化：右侧面板可编辑 */}
      {/* 楼盘对比演示 */}
      {/* 买房流程演示 */}
      {/* 港航匯 — 产品标题动效（两行文字自上而下酷炫入场） */}
      {/* Jacky口播精剪 — 片头+片尾动画（柱子哥风格） */}
      {/* 港航匯 — Remotion Ad Video Skill: 价格直击路线 15s */}
      {/* 港航匯 — Modern Short Video Skill: 极简暗黑 8段式 TransitionSeries */}
      {/* 港航匯 — 全合成口播視頻 / 電影暗調背景 + 玻璃卡片 / 45秒 */}
      {/* 法律陷阱口播透明疊加素材 / 75秒 / 三張大卡片逐一展示 */}

      {/* 稅費陷阱口播透明疊加素材 / 75秒 / 複用 LegalTrapsOverlay 框架 */}
      <Composition
        id="TaxTrapsOverlay"
        component={LegalTrapsOverlay}
        durationInFrames={30 * 75}
        fps={30}
        width={1080}
        height={1920}
        schema={LegalTrapsOverlaySchema}
        defaultProps={{
          hookLine1: '喺香港買樓，最怕唔係冇錢，',
          hookLine2: '而係計漏咗嗰筆稅！',
          hookLine3: '稅費隨時多過你份首期，',
          hookLine4: '買樓前一定要知嘅三大稅費陷阱！',
          revealHeadline: '稅費可以貴過首期？',
          revealSubtext: '唔好以為計掂首期就搞掂。稅費陷阱分分鐘令你失預算，今日同你拆解！',
          trap1Title: '陷阱一：契稅 — 3%唔係講笑',
          trap1Desc:
            '內地買樓契稅係總價3%，唔同香港分段計！200萬樓就要6萬契稅，現金一筆過冇得分期。簽約前一定要計清楚呢筆數！',
          trap2Title: '陷阱二：增值稅 — 發展商轉嫁俾你',
          trap2Desc:
            '新樓有增值稅，發展商通常話「包稅」，但隨時用其他名目收返你！管理費、裝修費、雜費一個月可以幾千蚊。問清楚「總代價」先好簽！',
          trap3Title: '陷阱三：轉手稅 — 五年內賣樓扣你20%',
          trap3Desc:
            '內地五年內賣樓要交個人所得稅，賺100萬要交20萬！唔似香港咁簡單。打算短炒嘅港人一定要知，否則賺埋都唔夠交稅！',
          recapHeadline: '三大稅費陷阱！買樓前一定要計清楚',
          recapSubtext:
            '契稅3%、增值稅陷阱、轉手稅20%。記住：睇總代價、問清楚包咩稅、計埋五年內轉手成本，三樣缺一不可！',
          ctaHeadline: '唔想計漏稅？搵Jacky幫你計！',
          ctaContact: '+852 6672 2526',
          ctaTags: '#香港買樓 #中山買樓 #稅費陷阱 #契稅 #增值稅 #港人置業',
        }}
      />
      {/* 男人秘密基地口播透明疊加素材 / 68秒 */}
      <Composition
        id="ManCaveOverlay"
        component={ManCaveOverlay}
        durationInFrames={30 * 68}
        fps={30}
        width={1080}
        height={1920}
        schema={ManCaveOverlaySchema}
        defaultProps={{
          hookColor: '#1A56DB',
          hookLine1: '香港男人嘅痛',
          hookLine2: '抖唔到氣？',
          hookLine3: '你係咪覺得抖唔到氣？',
          hookLine4: '想買層中山樓做避風港？小心貪平買咗個山旯旮！',
          revealLabel: '睇中之前我警告你...',
          revealNumber: '21.8',
          revealUnit: '萬起',
          revealHeadline: '中山城芯 · 精裝現樓 · 男人嘅避風港',
          revealSubtext: '睇中之前我警告你...',
          warning1Icon: 'building',
          warning1Title: '得個殼同基本裝修',
          warning1Desc: '想要奢華會所、大泳池？發夢早啲啦',
          warning2Icon: 'ruler',
          warning2Title: '33平頂多住兩公婆',
          warning2Desc: '想帶埋成家人過嚟？多個人都逼到爆',
          warning3Icon: 'tree',
          warning3Title: '冇花園養狗種花',
          warning3Desc: '實事求是，唔好期望太高',
          pivotLabel: '男人嘅救命草？',
          pivotHeadline: '但點解我話佢係男人嘅「救命草」？',
          benefit1Icon: 'currency',
          benefit1Title: '私己錢都買得起',
          benefit1Desc: '總價21.8萬 民水民电 明火煮食',
          benefit2Icon: 'home',
          benefit2Title: '極致嘅個人空間',
          benefit2Desc: '男人的浪漫 打機睇波嘆啤酒',
          benefit3Icon: 'trending',
          benefit3Title: '進可攻退可守',
          benefit3Desc: '托管出租 租客幫你養樓',
          quickIcon1: 'currency',
          quickLabel1: '私己錢買得起',
          quickIcon2: 'home',
          quickLabel2: '極致個人空間',
          quickIcon3: 'trending',
          quickLabel3: '進可攻退可守',
          climaxLabel: '男人最奢侈嘅係...',
          climaxHeadline: '做隻自由的小鳥',
          climaxSubtext: '男人最奢侈嘅空間 叉足電再返香港搏殺',
          ctaHeadline: '想睇樓？即刻聯絡 Jacky！',
          ctaContact: '+852 6672 2526',
          ctaTags: '中山城芯 / 精裝現樓 / 21.8萬起',
        }}
      />
      {/* 中山楼盘图标云 — 透明背景 3D 卡片云动画 */}
      <Composition
        id="IconCloud"
        component={IconCloudScene}
        durationInFrames={30 * 12}
        fps={30}
        width={2048}
        height={2048}
      />
      {/* 画中画 Overlay 动效 — 透明背景，JSON 时间线驱动 */}
      <Composition
        id="PipOverlay"
        component={PipOverlay}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 6000,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={propertyCostRanking}
      />
      {/* 双合同陷阱口播叠加视频 */}
      <Composition
        id="DualContractOverlay"
        component={PipOverlay}
        durationInFrames={2760}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 6000,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={dualContractTimeline}
      />
      {/* 华润仁恒公园四季 — 数据展示卡片 */}
      <Composition
        id="ParkSeasonsInfo"
        component={PipOverlay}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 6000,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={parkSeasonsInfo}
      />
      {/* 华润仁恒公园四季 — 回迁房深度拆解 (v11标准) */}
      <Composition
        id="ParkSeasonsResettlement"
        component={PipOverlay}
        durationInFrames={2810}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 6000,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={parkSeasonsResettlement}
      />
      {/* 中山vs珠海vs惠州 — 三城对比口播视频 / 165秒 / 10卡 */}
      <Composition
        id="ZhongshanComparison"
        component={FullBgOverlay}
        durationInFrames={4950}
        fps={30}
        width={1080}
        height={1920}
        schema={FullBgOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 4950,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={zhongshanComparison}
      />
      {/* 数据来源参考卡片 — 静态 PNG */}
      <Composition
        id="DataSourceCard"
        component={DataSourceCard}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* 大湾区房价数据来源 — 5秒动态卡片 / 6项数据依次入场 */}
      <Composition
        id="CityPriceDataSource"
        component={CityPriceDataSource}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* 四代住宅数据来源 — 5秒动态卡片 / 5项数据依次入场 */}
      <Composition
        id="SidaizhaiDataSource"
        component={SidaizhaiDataSource}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* 四代宅热销战绩 — 7秒项目展示 / 主角+3配角对比 */}
      <Composition
        id="SidaizhaiProjectsShowcase"
        component={SidaizhaiProjectsShowcase}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 装修避坑 — 三招搵笨套路拆解 / 75秒 / 9卡 */}
      <Composition
        id="RenovationTrapsOverlay"
        component={PipOverlay}
        durationInFrames={2250}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 6000,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={renovationTrapsTimeline}
      />

      {/* 新城控股爆雷 — 预售资金监管账户 / 126秒 / 11卡 */}
      <Composition
        id="SeazenFundSafetyOverlay"
        component={PipOverlay}
        durationInFrames={3780}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 6000,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={seazenFundSafetyTimeline}
      />

      {/* 新城控股爆雷动效展示 */}
      <Composition
        id="SeazenMotionDemo"
        component={SeazenMotionDemo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ====== 封面 <Still> 组件 ====== */}

      <Still
        id="CoverSundip"
        component={SundipCover as unknown as React.FC<Record<string, unknown>>}
        width={1242}
        height={1656}
        defaultProps={{
          series: 'sundip' as const,
          episodeNumber: 1,
          highlightNumber: '21.8',
          highlightUnit: '万',
          highlightLabel: '首付上车中山',
          propertyName: '港航汇·三房',
          tags: ['近港珠澳大桥', '精装修交付', '送全屋家电'],
        }}
      />

      <Still
        id="CoverData"
        component={DataCover as unknown as React.FC<Record<string, unknown>>}
        width={1242}
        height={1656}
        defaultProps={{
          series: 'data' as const,
          episodeNumber: 1,
          title: '香港 vs 中山\n买楼成本大对比',
          leftLabel: '香港',
          leftValue: '$800万',
          leftSub: '200呎·纳米楼',
          rightLabel: '中山',
          rightValue: '$80万',
          rightSub: '900呎·三房',
          insight: '港人每月悭供款 $12,000',
        }}
      />

      <Still
        id="CoverOpinion"
        component={OpinionCover as unknown as React.FC<Record<string, unknown>>}
        width={1242}
        height={1656}
        defaultProps={{
          series: 'opinion' as const,
          episodeNumber: 1,
          title: '港人买中山楼\n最易中嘅3个伏',
          hook: '第一个你可能已经踩咗...',
        }}
      />

      <Still
        id="CoverWarning"
        component={WarningCover as unknown as React.FC<Record<string, unknown>>}
        width={1242}
        height={1656}
        defaultProps={{
          series: 'warning' as const,
          episodeNumber: 1,
          title: '买卖合同\n3大陷阱',
          items: ['公摊面积模糊', '交付标准缩水', '违约责任不对等'],
        }}
      />
    </>
  );
};

// ====== 场景组件 ======

const PropertyComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <SectionTitle sectionNumber={1} title="熱門樓盤對比" />
      <ComparisonCards
        title="中山 vs 珠海"
        subtitle="兩大熱門置業城市PK"
        highlightWords={{ 中山: 'gold', 珠海: 'ocean' }}
        items={[
          {
            label: '中山·華發觀山水',
            description: '低密度山景大盤',
            color: 'gold',
            details: ['總價280萬起', '1小時到港珠澳大橋', '山景+湖景', '容積率1.2'],
          },
          {
            label: '珠海·華發峰景灣',
            description: '橫琴新區核心',
            color: 'ocean',
            details: ['總價350萬起', '緊鄰橫琴口岸', '海景+城景', '精裝修交付'],
          },
        ]}
        showParticles={true}
      />
    </AbsoluteFill>
  );
};

const BuyingProcessScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <SectionTitle sectionNumber={2} title="港人置業流程" />
      <ProcessFlow
        title="港人中山置業五步流程"
        subtitle="從選盤到入伙，全程跟進"
        steps={[
          { label: '選定樓盤', description: '實地考察或VR睇樓', status: 'complete' },
          { label: '簽訂合同', description: '支付定金簽認購書', status: 'complete' },
          { label: '辦理貸款', description: '香港或內地銀行', status: 'active' },
          { label: '過戶登記', description: '房管局產權轉移', status: 'pending' },
          { label: '交樓入伙', description: '驗收領取鑰匙', status: 'pending' },
        ]}
        direction="horizontal"
        showProgress={true}
      />
    </AbsoluteFill>
  );
};
