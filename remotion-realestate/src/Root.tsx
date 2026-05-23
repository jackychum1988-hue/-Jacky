// Root.tsx - Remotion Composition 注册入口

import React from 'react';
import { Composition, AbsoluteFill, useCurrentFrame } from 'remotion';
import './index.css';
import { RealEstateDemo } from './scenes/demo/RealEstateDemo';
import { GangHangHuiIntro, GangHangHuiSchema } from './scenes/demo/GangHangHuiIntro';
import { JackyIntroOutro } from './scenes/demo/JackyIntroOutro';
import { GangHangHuiAd, GangHangHuiAdSchema } from './scenes/ads/GangHangHuiAd';
import { GangHangHuiModern, GangHangHuiModernSchema, DURATION_IN_FRAMES } from './scenes/ads/GangHangHuiModern';
import { GangHangHuiOverlay, GangHangHuiOverlaySchema } from './scenes/ads/GangHangHuiOverlay';
import { ComparisonCards, SectionTitle, ProcessFlow, HeroProductTitle } from './components/new';
import { IconCloudScene } from './scenes/IconCloudScene';
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
      <Composition
        id="GangHangHuiHeroTitle"
        component={() => (
          <HeroProductTitle
            line1="中山港航匯"
            line2="男人的救命稻草"
          />
        )}
        durationInFrames={30 * 4}
        fps={30}
        width={1080}
        height={1920}
      />

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
      {/* 港航匯 — 口播透明疊加素材 / 45秒有色玻璃卡片 */}
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
          climaxSubtext: '唔係名錶跑車 · 而係一個可以完全放空自己嘅空間\n叉足電再返香港搏殺 · 感情好咗 · 事業自然順',
          ctaHeadline: '想睇樓？即刻聯絡 Jacky！',
          ctaContact: '+852 6672 2526',
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
