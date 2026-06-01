// Root.tsx - Remotion Composition 注册入口

import React from 'react';
import { Composition, AbsoluteFill, useCurrentFrame } from 'remotion';
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
import { COLORS } from './design-system/tokens';

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
      <Composition
        id="GangHangHuiAd"
        component={GangHangHuiAd}
        durationInFrames={30 * 15}
        fps={30}
        width={1080}
        height={1920}
        schema={GangHangHuiAdSchema}
        defaultProps={{
          brandName: '港航匯',
          priceLabel: '總價',
          priceValue: 21.8,
          priceUnit: '萬起',
          priceSuffix: '*精裝現樓 即買即入住',
          hookEyebrow: '中山城芯 · 精裝現樓',
          hookBody: '港人上車首選',
          features: [
            {
              icon: 'mapPin',
              title: '中山城芯',
              description: '深中通道直達 · 港車北上1小時生活圈',
            },
            { icon: 'building', title: '精裝現樓', description: '所見即所得 · 即買即收樓即入住' },
            { icon: 'currency', title: '港人優惠', description: '低總價上車盤 · 專享VIP禮遇' },
          ],
          benefitHeadline: '即買即住',
          benefitBody: '深中通道直達 · 1小時生活圈 · 港車北上',
          ctaHeadline: '預約睇樓',
          ctaSubtitle: 'VIP專車接送',
          ctaContact: '+852 6672 2526',
        }}
      />
      {/* 港航匯 — Modern Short Video Skill: 极简暗黑 8段式 TransitionSeries */}
      <Composition
        id="GangHangHuiModern"
        component={GangHangHuiModern}
        durationInFrames={DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        schema={GangHangHuiModernSchema}
        defaultProps={{
          brandName: '港航匯',
          tagline: '中山城芯 · 精裝現樓 · 港人上車首選',
          priceValue: 21.8,
          priceUnit: '萬起',
          features: [
            { title: '中山城芯', description: '深中通道直達 · 港車北上1小時生活圈' },
            { title: '精裝現樓', description: '所見即所得 · 即買即收樓即入住' },
            { title: '港人優惠', description: '低總價上車盤 · 專享VIP禮遇' },
          ],
          outro: '港人上車首選',
          ctaHeadline: '預約睇樓',
          ctaSubtitle: 'VIP專車接送',
          ctaContact: '+852 6672 2526',
        }}
      />
      {/* 港航匯 — 全合成口播視頻 / 電影暗調背景 + 玻璃卡片 / 45秒 */}
      <Composition
        id="GangHangHuiOverlay"
        component={GangHangHuiOverlay}
        durationInFrames={30 * 45}
        fps={30}
        width={1080}
        height={1920}
        schema={GangHangHuiOverlaySchema}
        defaultProps={{
          hookHeadline: '抖唔到氣？',
          hookSubtext: '四五百呎住四五個人 · 老婆日日鵝 · 仔女日日嘈',
          revealHeadline: '總價 21.8 萬',
          revealSubtext: '中山城芯 · 精裝現樓 · 男人嘅避風港',
          warning1Title: '得個殼同基本裝修',
          warning1Desc: '冇奢華會所 · 冇大泳池 · 發夢早啲',
          warning2Title: '33㎡ 只夠兩公婆',
          warning2Desc: '想帶埋成家嚟週末？多個人都逼到爆',
          warning3Title: '冇花園',
          warning3Desc: '養狗種花免問 · 純住宅空間',
          transitionHeadline: '男人嘅「救命草」？',
          transitionSubtext: '點解我咁講？',
          benefit1Title: '總價 21.8 萬 · 私己錢買得起',
          benefit1Desc: '民水民电 · 明火煮食 · 真正屬於自己嘅空間',
          benefit2Title: '男人嘅浪漫',
          benefit2Desc: '週末熄電話 · 打機睇波嘆啤酒 · 冇人阻你',
          benefit3Title: '進可攻 · 退可守',
          benefit3Desc: '唔過嚟就托管出租 · 租客幫你養樓 · 老婆見到有錢收笑到見牙唔見眼',
          climaxHeadline: '最奢侈嘅係…',
          climaxSubtext:
            '唔係名錶跑車 · 而係一個可以完全放空自己嘅空間\n叉足電再返香港搏殺 · 感情好咗 · 事業自然順',
          ctaHeadline: '想睇樓？即刻聯絡 Jacky！',
          ctaContact: '+852 6672 2526',
          // 背景圖片：留空使用程序化暗調漸變，放入 public/ 圖片即可替換
          bgImages: {},
        }}
      />
      {/* 法律陷阱口播透明疊加素材 / 75秒 / 三張大卡片逐一展示 */}
      <Composition
        id="LegalTrapsOverlay"
        component={LegalTrapsOverlay}
        durationInFrames={30 * 75}
        fps={30}
        width={1080}
        height={1920}
        schema={LegalTrapsOverlaySchema}
        defaultProps={{
          hookLine1: '喺香港買樓，你有冇諗過…',
          hookLine2: '唔係有錢就買到心水樓，',
          hookLine3: '仲有好多法律陷阱等緊你。',
          hookLine4: '買樓前一定要知嘅三大法律陷阱！',
          revealHeadline: '唔好以為有錢就大晒',
          revealSubtext: '香港買樓有三大法律陷阱，隨時令你後悔一世。今日同你拆解！',
          trap1Title: '陷阱一：違例建築',
          trap1Desc: '見到個靚露台好開心？可能係僭建！銀行唔批按揭，保險唔包賠，賣樓仲要被壓價。簽約前一定要check圖則！',
          trap2Title: '陷阱二：維修令',
          trap2Desc: '大廈收到強制維修令？維修費隨時幾十萬甚至過百萬！買樓前一定要查大廈記錄，唔好貪平買咗個炸彈返嚟。',
          trap3Title: '陷阱三：業權瑕疵',
          trap3Desc: '業主唔係得一個？有人未簽名就賣？土地查冊一定要做，否則買咗都可能唔係你㗎！',
          recapHeadline: '三大陷阱！買樓前一定要Check清楚',
          recapSubtext: '僭建、維修令、業權瑕疵。記住：土地查冊、查圖則、查大廈記錄，三樣缺一不可！',
          ctaHeadline: '想買樓唔想中伏？搵Jacky幫你！',
          ctaContact: '+852 6672 2526',
          ctaTags: '#香港買樓 #買樓陷阱 #土地查冊 #僭建 #維修令 #業權',
        }}
      />
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
          trap1Desc: '內地買樓契稅係總價3%，唔同香港分段計！200萬樓就要6萬契稅，現金一筆過冇得分期。簽約前一定要計清楚呢筆數！',
          trap2Title: '陷阱二：增值稅 — 發展商轉嫁俾你',
          trap2Desc: '新樓有增值稅，發展商通常話「包稅」，但隨時用其他名目收返你！管理費、裝修費、雜費一個月可以幾千蚊。問清楚「總代價」先好簽！',
          trap3Title: '陷阱三：轉手稅 — 五年內賣樓扣你20%',
          trap3Desc: '內地五年內賣樓要交個人所得稅，賺100萬要交20萬！唔似香港咁簡單。打算短炒嘅港人一定要知，否則賺埋都唔夠交稅！',
          recapHeadline: '三大稅費陷阱！買樓前一定要計清楚',
          recapSubtext: '契稅3%、增值稅陷阱、轉手稅20%。記住：睇總代價、問清楚包咩稅、計埋五年內轉手成本，三樣缺一不可！',
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
        durationInFrames={2040}
        fps={30}
        width={1080}
        height={1920}
        schema={PipOverlaySchema}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames ?? 2040,
          width: props.width ?? 1080,
          height: props.height ?? 1920,
        })}
        defaultProps={{
          width: 1080,
          height: 1920,
          fps: 30,
          durationInFrames: 2040,
          elements: [
            {
              type: 'KeywordTag',
              text: 'Sample Tag',
              enterAt: 15,
              exitAt: 90,
              animation: 'spring',
              position: 'top-right',
              props: { color: '#5599FF', size: 'lg' },
            },
          ],
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
