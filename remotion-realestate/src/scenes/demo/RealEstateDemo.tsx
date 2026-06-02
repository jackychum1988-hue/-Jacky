// RealEstateDemo - 房产视频组件演示场景
// 展示核心组件的实际使用

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { COLORS } from '../../design-system/tokens';
import {
  HeroTitle,
  SectionTitle,
  PriceTag,
  FeatureGrid,
  ProcessFlow,
  AnimatedList,
} from '../../components/new';

interface RealEstateDemoProps {
  propertyName: string;
  propertyDistrict: string;
  propertyPrice: number;
  propertyTags: string[];
}

export const RealEstateDemo: React.FC<RealEstateDemoProps> = ({
  propertyName,
  propertyDistrict,
  propertyPrice,
  propertyTags,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Scene 1: 开场大标题 (0-5s, 150 frames) */}
      <Sequence from={0} durationInFrames={150}>
        <HeroTitle title={propertyName} subtitle={propertyDistrict} tags={propertyTags} />
      </Sequence>
      {/* Scene 2: 价格展示 (5-10s, 150 frames) */}
      <Sequence from={150} durationInFrames={150}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.background,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 96,
          }}
        >
          <PriceTag
            price={propertyPrice}
            unit="萬起"
            label="總價"
            suffix="*享港人專屬優惠"
            size="large"
            startDelay={20}
          />
        </AbsoluteFill>
      </Sequence>
      {/* Scene 3: 户型亮点 (10-16s, 180 frames) */}
      <Sequence from={300} durationInFrames={180}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.background,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 96,
          }}
        >
          <SectionTitle sectionNumber={1} title="戶型亮點" />
          <FeatureGrid
            features={[
              { icon: 'bed', title: '三房兩廳', description: '實用面積約1,200呎，動靜分區' },
              { icon: 'view', title: '270°山景', description: '永久無遮擋景觀，視野開闊' },
              { icon: 'train', title: '交通便利', description: '5分鐘到輕軌站，直達珠海' },
            ]}
            columns={3}
          />
        </AbsoluteFill>
      </Sequence>
      {/* Scene 4: 核心卖点 (16-22s, 180 frames) */}
      <Sequence from={480} durationInFrames={180}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.background,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 96,
          }}
        >
          <SectionTitle sectionNumber={2} title="為何選擇這裡？" />
          <AnimatedList
            items={[
              { title: '低密度社區', description: '僅1.2容積率，千畝原生山林環抱', icon: 'tree' },
              { title: '港車北上直達', description: '經港珠澳大橋，約1小時到香港', icon: 'mapPin' },
              { title: '精裝修現樓', description: '即買即住，無需等待，所見即所得', icon: 'key' },
              { title: '完善配套', description: '步行可達學校、商場、醫院', icon: 'shopping' },
            ]}
            variant="card"
          />
        </AbsoluteFill>
      </Sequence>
      {/* Scene 5: 买房流程 (22-30s, 240 frames) */}
      <Sequence from={660} durationInFrames={240}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.background,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 96,
          }}
        >
          <SectionTitle sectionNumber={3} title="置業流程" />
          <ProcessFlow
            title="港人中山買樓五步曲"
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
      </Sequence>
      {/* Scene 6: 结尾 CTA (30-35s, 150 frames) */}
      <Sequence from={900} durationInFrames={150}>
        <HeroTitle
          title="預約睇樓"
          subtitle="WhatsApp: +852 XXXX XXXX"
          tags={['免費專車接送', '一對一諮詢', '獨家優惠']}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
