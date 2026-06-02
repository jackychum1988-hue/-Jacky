// 港航匯 — 中山楼盘开场大标题（参数化版）

import React from 'react';
import { z } from 'zod';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  Sequence,
} from 'remotion';
import {
  HeroTitle,
  PriceTag,
  FeatureGrid,
  LightSweep,
} from '../../components/new';
import { COLORS, FONTS, SIZES } from '../../design-system/tokens';

// ====== Zod Schema — Studio 右侧面板可编辑 ======

const iconEnum = z.enum([
  'home', 'building', 'tower', 'mapPin', 'key',
  'bed', 'bath', 'ruler', 'parking', 'train',
  'school', 'shopping', 'tree', 'waves', 'view',
  'currency', 'trending', 'clock',
]);

export const GangHangHuiSchema = z.object({
  title: z.string().describe('楼盘名称'),
  subtitle: z.string().describe('副标题/位置'),
  totalPrice: z.number().describe('总价（万）'),
  priceUnit: z.string().describe('价格单位'),
  priceSuffix: z.string().describe('价格后缀说明'),
  tags: z.string().describe('标签（逗号分隔）'),
  featureIcon1: iconEnum.describe('卖点1图标'),
  featureTitle1: z.string().describe('卖点1标题'),
  featureDesc1: z.string().describe('卖点1描述'),
  featureIcon2: iconEnum.describe('卖点2图标'),
  featureTitle2: z.string().describe('卖点2标题'),
  featureDesc2: z.string().describe('卖点2描述'),
  featureIcon3: iconEnum.describe('卖点3图标'),
  featureTitle3: z.string().describe('卖点3标题'),
  featureDesc3: z.string().describe('卖点3描述'),
  ctaSubtitle: z.string().describe('CTA副标题'),
  contactLabel: z.string().describe('联系方式标签'),
  contactPhone: z.string().describe('电话号码'),
});

type Props = z.infer<typeof GangHangHuiSchema>;

// ====== 组件 ======

export const GangHangHuiIntro: React.FC<Props> = ({
  title,
  subtitle,
  totalPrice,
  priceUnit,
  priceSuffix,
  tags,
  featureIcon1, featureTitle1, featureDesc1,
  featureIcon2, featureTitle2, featureDesc2,
  featureIcon3, featureTitle3, featureDesc3,
  ctaSubtitle,
  contactLabel,
  contactPhone,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

  const features = [
    { icon: featureIcon1, title: featureTitle1, description: featureDesc1 },
    { icon: featureIcon2, title: featureTitle2, description: featureDesc2 },
    { icon: featureIcon3, title: featureTitle3, description: featureDesc3 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* 背景质感层 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 30% 30%, ${COLORS.primary}10 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 70% 60%, ${COLORS.extended.terracotta}08 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 50% 50%, ${COLORS.backgroundElevated}30 0%, transparent 70%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* 金光扫过效果 */}
      <LightSweep duration={90} height={height} />

      {/* 第一阶段：大标题入场 (0~5s, 0~150f) */}
      <Sequence from={0} durationInFrames={150}>
        <HeroTitle
          title={title}
          subtitle={subtitle}
          tags={tagList}
          titleDelay={8}
          subtitleDelay={30}
          tagsDelay={55}
        />
      </Sequence>

      {/* 第二阶段：价格 + 卖点 (5~10.5s, 150~315f) */}
      <Sequence from={150} durationInFrames={165}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: SIZES.spacing.xxxl,
          }}
        >
          <PriceTag
            price={totalPrice}
            unit={priceUnit}
            label="總價"
            suffix={priceSuffix}
            size="large"
            startDelay={15}
          />

          <div
            style={{
              marginTop: SIZES.spacing.xxl,
              opacity: interpolate(frame - 150 - 50, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <FeatureGrid
              features={features}
              columns={3}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 第三阶段：尾版 CTA (10.5~16s, 315~480f) */}
      <Sequence from={315} durationInFrames={165}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: SIZES.spacing.xxxl,
          }}
        >
          {/* CTA 标题 */}
          <div
            style={{
              textAlign: 'center',
              opacity: interpolate(frame - 315, [0, 25], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
              }),
              transform: `translateY(${interpolate(frame - 315, [0, 25], [40, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)`,
            }}
          >
            <h2
              style={{
                fontSize: SIZES.h1,
                fontFamily: FONTS.display,
                color: COLORS.text,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textShadow: '0 0 80px rgba(200, 160, 82, 0.2)',
                marginBottom: SIZES.spacing.md,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: SIZES.h3,
                fontFamily: FONTS.text,
                color: COLORS.primary,
                fontWeight: 400,
                marginBottom: SIZES.spacing.xxl,
              }}
            >
              {ctaSubtitle}
            </p>
          </div>

          {/* 联系方式卡片 */}
          <div
            style={{
              padding: `${SIZES.spacing.xl}px ${SIZES.spacing.xxl}px`,
              backgroundColor: `${COLORS.backgroundElevated}E0`,
              borderRadius: SIZES.radius.xl,
              border: `1px solid ${COLORS.backgroundSecondary}`,
              textAlign: 'center',
              opacity: interpolate(frame - 315 - 30, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              transform: `scale(${spring({
                frame: frame - 315 - 30,
                fps,
                config: { damping: 15, stiffness: 100 },
              }) * 0.05 + 0.95})`,
            }}
          >
            <p
              style={{
                fontSize: SIZES.body,
                fontFamily: FONTS.text,
                color: COLORS.textSecondary,
                marginBottom: SIZES.spacing.sm,
              }}
            >
              {contactLabel}
            </p>
            <p
              style={{
                fontSize: SIZES.h3,
                fontFamily: FONTS.mono,
                color: COLORS.text,
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {contactPhone}
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
