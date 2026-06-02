// 港航匯 — 抖音竖屏广告（价格直击路线 / 透明底色+有色玻璃背板 / 大字版）
// 剪映用法: 画中画 → 混合模式: 正常(Normal) — 有色半透明背板确保文字始终清晰

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
import * as Icons from '../../components/new/Icons';

// 鲜艳配色盘 — 每张卡片独立色彩标识
const V = [
  '#FF6B6B', // coral red
  '#FFA726', // warm orange
  '#26C281', // emerald green
  '#5599FF', // bright blue
  '#AB47BC', // purple
  '#FF7043', // deep orange
  '#42A5F5', // sky blue
  '#EC407A', // pink
];
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// 浓郁高对比度基础配色
const C = {
  text: '#FFFFFF',
  textSecondary: '#D0D5DD',
  textTertiary: '#98A0B0',
  borderSubtle: 'rgba(255,255,255,0.10)',
  borderAccent: 'rgba(85,153,255,0.45)',
};
const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
};

// ====== Zod Schema ======

const FeatureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const GangHangHuiAdSchema = z.object({
  brandName: z.string(),
  priceLabel: z.string(),
  priceValue: z.number(),
  priceUnit: z.string(),
  priceSuffix: z.string(),
  hookEyebrow: z.string(),
  hookBody: z.string(),
  features: z.array(FeatureSchema).max(3),
  benefitHeadline: z.string(),
  benefitBody: z.string(),
  ctaHeadline: z.string(),
  ctaSubtitle: z.string(),
  ctaContact: z.string(),
});

type Props = z.infer<typeof GangHangHuiAdSchema>;

const iconMap: Record<string, React.FC<Icons.IconProps>> = {
  mapPin: Icons.MapPin,
  building: Icons.Building,
  currency: Icons.Currency,
  home: Icons.Home,
  train: Icons.Train,
  key: Icons.Key,
  tower: Icons.Tower,
  bed: Icons.Bed,
  school: Icons.School,
  shopping: Icons.Shopping,
  tree: Icons.Tree,
  waves: Icons.Waves,
  view: Icons.View,
  trending: Icons.Trending,
  clock: Icons.Clock,
};

const getIcon = (name: string) => iconMap[name] || Icons.Home;

// ====== Scene 1: Price Hook (0-2s) ======

const PriceHookScene: React.FC<{
  brandName: string;
  priceLabel: string;
  priceValue: number;
  priceUnit: string;
  priceSuffix: string;
  hookEyebrow: string;
  hookBody: string;
}> = ({ brandName, priceLabel, priceValue, priceUnit, hookEyebrow, hookBody }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[0]; // coral red — 价格冲击

  const countProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.5 },
  });

  const displayPrice = interpolate(countProgress, [0, 1], [0, priceValue], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const eyebrowOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const eyebrowY = interpolate(frame, [0, 12], [30, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const bodyOpacity = interpolate(frame - 20, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const brandOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const plateOpacity = interpolate(countProgress, [0.1, 0.6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 60px',
      }}
    >
      {/* Brand name */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          opacity: brandOpacity,
        }}
      >
        <span
          style={{
            fontSize: 48,
            fontFamily: F.text,
            color: v,
            letterSpacing: '0.3em',
            fontWeight: 500,
            textShadow: `0 2px 12px ${hexToRgba(v, 0.5)}`,
          }}
        >
          {brandName}
        </span>
      </div>

      {/* Price Label — 第一行:鲜艳色 */}
      <p
        style={{
          fontSize: 52,
          fontFamily: F.text,
          color: v,
          letterSpacing: '0.2em',
          marginBottom: 24,
          opacity: eyebrowOpacity,
          transform: `translateY(${eyebrowY}px)`,
          textShadow: `0 2px 10px ${hexToRgba(v, 0.5)}`,
        }}
      >
        {hookEyebrow}
      </p>

      {/* Price Counter — 有色玻璃背板 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 56px',
          borderRadius: 20,
          backgroundColor: hexToRgba(v, 0.18),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          opacity: plateOpacity,
          backdropFilter: 'blur(16px)',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontFamily: F.text,
              color: v,
              fontWeight: 600,
              opacity: countProgress,
              textShadow: `0 0 20px ${hexToRgba(v, 0.5)}`,
            }}
          >
            HK$
          </span>
          <span
            style={{
              fontSize: 280,
              fontFamily: F.display,
              fontWeight: 700,
              color: C.text,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {displayPrice.toFixed(1)}
          </span>
          <span
            style={{
              fontSize: 88,
              fontFamily: F.text,
              color: C.textSecondary,
              fontWeight: 400,
              opacity: countProgress,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {priceUnit}
          </span>
        </div>

        {/* Divider inside plate */}
        <div
          style={{
            width: interpolate(countProgress, [0.3, 1], [0, 200]),
            height: 3,
            background: `linear-gradient(90deg, transparent, ${v}, transparent)`,
            marginTop: 16,
            opacity: countProgress,
          }}
        />
      </div>

      {/* Hook body — 第二行:白色 */}
      <p
        style={{
          fontSize: 56,
          fontFamily: F.text,
          color: C.textSecondary,
          textAlign: 'center',
          letterSpacing: '0.05em',
          opacity: bodyOpacity,
          textShadow: '0 2px 10px rgba(0,0,0,0.55)',
        }}
      >
        {hookBody}
      </p>
    </AbsoluteFill>
  );
};

// ====== Scene 2: Feature Cards (2-7s) ======

const FeaturesScene: React.FC<{
  features: Array<{ icon: string; title: string; description: string }>;
}> = ({ features }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardColors = [V[1], V[2], V[3]]; // orange, emerald, blue

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 64px',
        gap: 36,
      }}
    >
      {features.map((feature, i) => {
        const delay = i * 14;
        const itemFrame = Math.max(0, frame - delay);
        const cc = cardColors[i];

        const cardSpring = spring({
          frame: itemFrame,
          fps,
          config: { damping: 22, stiffness: 90, mass: 1.2 },
        });

        const cardOpacity = interpolate(itemFrame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        });

        const cardX = interpolate(itemFrame, [0, 18], [i % 2 === 0 ? -80 : 80, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: Easing.out(Easing.back(1.2)),
        });

        const IconComp = getIcon(feature.icon);

        return (
          <div
            key={i}
            style={{
              width: '100%',
              maxWidth: 900,
              padding: '40px 48px',
              backgroundColor: hexToRgba(cc, 0.16),
              borderRadius: 20,
              border: `1px solid ${hexToRgba(cc, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              opacity: cardOpacity,
              transform: `translateX(${cardX}px) scale(${0.92 + cardSpring * 0.08})`,
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Colored edge accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 4,
                background: cc,
                opacity: cardSpring,
                boxShadow: `0 0 14px ${hexToRgba(cc, 0.6)}`,
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: 88,
                height: 88,
                minWidth: 88,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: hexToRgba(cc, 0.2),
                border: `1px solid ${hexToRgba(cc, 0.4)}`,
                boxShadow: `0 0 18px ${hexToRgba(cc, 0.3)}`,
                transform: `scale(${spring({ frame: itemFrame - 5, fps, config: { damping: 12, stiffness: 160 } })})`,
              }}
            >
              <IconComp size={44} color={cc} />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 52,
                  fontWeight: 600,
                  color: cc,
                  fontFamily: F.display,
                  marginBottom: 8,
                  letterSpacing: '-0.5px',
                  textShadow: `0 2px 10px ${hexToRgba(cc, 0.5)}`,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 36,
                  color: C.textSecondary,
                  fontFamily: F.text,
                  lineHeight: 1.5,
                  textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                  opacity: interpolate(itemFrame - 8, [0, 12], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                  }),
                }}
              >
                {feature.description}
              </p>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ====== Scene 3: Benefit Deepen (7-11s) ======

const BenefitScene: React.FC<{
  headline: string;
  body: string;
  priceValue: number;
}> = ({ headline, body, priceValue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[4]; // purple — 核心价值感

  const hOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const hScale = spring({
    frame, fps,
    config: { damping: 18, stiffness: 80, mass: 1.5 },
  });

  const bOpacity = interpolate(frame - 15, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const priceSpring = spring({
    frame: frame - 20, fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 60px',
      }}
    >
      {/* 有色玻璃背板 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 56px',
          borderRadius: 24,
          backgroundColor: hexToRgba(v, 0.16),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <h2
          style={{
            fontSize: 160,
            fontFamily: F.display,
            fontWeight: 700,
            color: v,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            opacity: hOpacity,
            transform: `scale(${0.88 + hScale * 0.12})`,
            marginBottom: 24,
            textShadow: `0 4px 24px ${hexToRgba(v, 0.5)}`,
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontSize: 60,
            fontFamily: F.text,
            color: C.textSecondary,
            textAlign: 'center',
            lineHeight: 1.5,
            opacity: bOpacity,
            marginBottom: 40,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {body}
        </p>

        {/* Price reminder */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            opacity: priceSpring,
            transform: `scale(${0.9 + priceSpring * 0.1})`,
          }}
        >
          <span style={{ fontSize: 60, fontFamily: F.text, color: v, fontWeight: 600, textShadow: `0 0 16px ${hexToRgba(v, 0.5)}` }}>
            HK$
          </span>
          <span
            style={{
              fontSize: 150,
              fontFamily: F.display,
              fontWeight: 700,
              color: C.text,
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {priceValue.toFixed(1)}
          </span>
          <span style={{ fontSize: 64, fontFamily: F.text, color: C.textSecondary, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            萬起
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 4: CTA (11-15s) ======

const CTAScene: React.FC<{
  brandName: string;
  headline: string;
  subtitle: string;
  contact: string;
}> = ({ brandName, headline, subtitle, contact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[5]; // deep orange — 行动号召

  const hOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const hY = interpolate(frame, [0, 18], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const cardSpring = spring({
    frame: frame - 20, fps,
    config: { damping: 14, stiffness: 90, mass: 1.3 },
  });

  const cardOpacity = interpolate(frame - 20, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const phonePulse = interpolate(frame - 45, [0, 15, 30], [1, 1.04, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 60px',
      }}
    >
      {/* Brand name */}
      <p
        style={{
          fontSize: 48,
          fontFamily: F.text,
          color: v,
          letterSpacing: '0.3em',
          fontWeight: 500,
          marginBottom: 36,
          opacity: hOpacity,
          textShadow: `0 2px 12px ${hexToRgba(v, 0.5)}`,
        }}
      >
        {brandName}
      </p>

      {/* CTA headline + subtitle 有色玻璃背板 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 56px',
          borderRadius: 24,
          backgroundColor: hexToRgba(v, 0.16),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          marginBottom: 56,
          backdropFilter: 'blur(16px)',
        }}
      >
        <h2
          style={{
            fontSize: 140,
            fontFamily: F.display,
            fontWeight: 700,
            color: v,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            opacity: hOpacity,
            transform: `translateY(${hY}px)`,
            textShadow: `0 4px 24px ${hexToRgba(v, 0.5)}`,
            marginBottom: 16,
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontSize: 52,
            fontFamily: F.text,
            color: C.textSecondary,
            textAlign: 'center',
            opacity: interpolate(frame - 10, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            }),
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Contact card — 高对比度 */}
      <div
        style={{
          padding: '48px 72px',
          backgroundColor: hexToRgba(v, 0.25),
          borderRadius: 24,
          border: `2px solid ${hexToRgba(v, 0.5)}`,
          textAlign: 'center',
          opacity: cardOpacity,
          transform: `scale(${0.93 + cardSpring * 0.07})`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 40px ${hexToRgba(v, 0.25)}`,
        }}
      >
        <p
          style={{
            fontSize: 36,
            fontFamily: F.text,
            color: C.textSecondary,
            marginBottom: 16,
            letterSpacing: '0.1em',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}
        >
          {subtitle}
        </p>
        <p
          style={{
            fontSize: 84,
            fontFamily: F.mono,
            color: C.text,
            fontWeight: 600,
            letterSpacing: '0.05em',
            transform: `scale(${phonePulse})`,
            textShadow: `0 2px 18px ${hexToRgba(v, 0.5)}`,
          }}
        >
          {contact}
        </p>
      </div>

      {/* Bottom dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          display: 'flex',
          gap: 10,
          opacity: interpolate(frame - 40, [0, 20], [0, 1], {
            extrapolateLeft: 'clamp',
          }),
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: C.textSecondary,
              opacity: 0.3 + i * 0.15,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ====== Main Composition ======

export const GangHangHuiAd: React.FC<Props> = (props) => {
  const { fps } = useVideoConfig();
  const dur = (s: number) => s * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <Sequence from={dur(0)} durationInFrames={dur(2)}>
        <PriceHookScene
          brandName={props.brandName}
          priceLabel={props.priceLabel}
          priceValue={props.priceValue}
          priceUnit={props.priceUnit}
          priceSuffix={props.priceSuffix}
          hookEyebrow={props.hookEyebrow}
          hookBody={props.hookBody}
        />
      </Sequence>

      <Sequence from={dur(2)} durationInFrames={dur(5)}>
        <FeaturesScene features={props.features} />
      </Sequence>

      <Sequence from={dur(7)} durationInFrames={dur(4)}>
        <BenefitScene
          headline={props.benefitHeadline}
          body={props.benefitBody}
          priceValue={props.priceValue}
        />
      </Sequence>

      <Sequence from={dur(11)} durationInFrames={dur(4)}>
        <CTAScene
          brandName={props.brandName}
          headline={props.ctaHeadline}
          subtitle={props.ctaSubtitle}
          contact={props.ctaContact}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
