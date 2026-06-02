// 港航匯 — Modern Short Video Skill 版本 / 透明底色+有色玻璃背板 / 大字版
// 剪映用法: 画中画 → 混合模式: 正常(Normal)

import React from 'react';
import { z } from 'zod';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

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

// 基础色彩
const DARK = {
  text: '#FFFFFF',
  textSecondary: '#D0D5DD',
  textTertiary: '#98A0B0',
  accent: '#5599FF',
  accentBright: '#77AAFF',
  borderSubtle: 'rgba(255,255,255,0.10)',
};
const TS = '0 2px 10px rgba(0,0,0,0.55)';
const TSLarge = '0 4px 20px rgba(0,0,0,0.6)';

const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
};

const TRANSITION_DURATION = 15;
const FPS = 30;

const SCENES = {
  reveal: 2 * FPS,
  concept: 2.5 * FPS,
  price: 2.5 * FPS,
  feature1: 2.5 * FPS,
  feature2: 2.5 * FPS,
  feature3: 2.5 * FPS,
  outro: 2 * FPS,
  cta: 2.5 * FPS,
};

function calcDuration(): number {
  const total = Object.values(SCENES).reduce((a, b) => a + b, 0);
  return total - TRANSITION_DURATION * 7;
}

export const DURATION_IN_FRAMES = calcDuration();

export const GangHangHuiModernSchema = z.object({
  brandName: z.string(),
  tagline: z.string(),
  priceValue: z.number(),
  priceUnit: z.string(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).max(3),
  outro: z.string(),
  ctaHeadline: z.string(),
  ctaSubtitle: z.string(),
  ctaContact: z.string(),
});

type Props = z.infer<typeof GangHangHuiModernSchema>;

const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'none';
}> = ({ children, delay = 0, duration = 20, direction = 'up' }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const y = direction === 'up'
    ? interpolate(frame - delay, [0, duration], [30, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 0;

  return <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>;
};

// ====== Scene 1: Reveal ======

const RevealScene: React.FC<{ brandName: string }> = ({ brandName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const v = V[0]; // coral red

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          padding: '36px 64px',
          borderRadius: 20,
          backgroundColor: hexToRgba(v, 0.16),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <h1
          style={{
            fontSize: 150,
            fontWeight: 700,
            color: v,
            letterSpacing: '-3px',
            transform: `scale(${0.9 + scale * 0.1})`,
            fontFamily: F.display,
            textShadow: `0 4px 24px ${hexToRgba(v, 0.5)}`,
          }}
        >
          {brandName}
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 2: Concept ======

const ConceptScene: React.FC<{ tagline: string }> = ({ tagline }) => {
  const v = V[1]; // warm orange
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      <FadeIn delay={5} duration={25}>
        <div
          style={{
            padding: '32px 56px',
            borderRadius: 20,
            backgroundColor: hexToRgba(v, 0.16),
            border: `1px solid ${hexToRgba(v, 0.3)}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <p style={{ fontSize: 56, color: v, textAlign: 'center', lineHeight: 1.5, fontFamily: F.text, letterSpacing: '0.02em', textShadow: `0 2px 14px ${hexToRgba(v, 0.4)}` }}>
            {tagline}
          </p>
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ====== Scene 3: Price ======

const PriceScene: React.FC<{ priceValue: number; priceUnit: string }> = ({ priceValue, priceUnit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[2]; // emerald green

  const progress = spring({ frame: frame - 10, fps, config: { damping: 25, stiffness: 80 } });
  const displayPrice = interpolate(progress, [0, 1], [0, priceValue], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '36px 64px',
          borderRadius: 20,
          backgroundColor: hexToRgba(v, 0.16),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <FadeIn delay={0} duration={20} direction="up">
          <p style={{ fontSize: 32, color: v, letterSpacing: '0.2em', marginBottom: 20, fontFamily: F.text, textTransform: 'uppercase', textShadow: `0 2px 10px ${hexToRgba(v, 0.4)}` }}>
            Price
          </p>
        </FadeIn>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 72, color: v, fontWeight: 600, fontFamily: F.text, opacity: progress, textShadow: `0 0 20px ${hexToRgba(v, 0.5)}` }}>HK$</span>
          <span style={{ fontSize: 240, fontWeight: 700, color: DARK.text, letterSpacing: '-4px', fontFamily: F.display, lineHeight: 1, textShadow: TSLarge }}>
            {displayPrice.toFixed(1)}
          </span>
          <span style={{ fontSize: 72, color: DARK.textSecondary, fontFamily: F.text, opacity: progress, textShadow: TS }}>{priceUnit}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 4-6: Feature ======

const FeatureScene: React.FC<{ n: number; title: string; description: string }> = ({ n, title, description }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[2 + n]; // emerald, blue, purple for features 1-3

  const cardSpring = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: '80%',
          maxWidth: 860,
          padding: '52px 56px',
          backgroundColor: hexToRgba(v, 0.16),
          borderRadius: 24,
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          backdropFilter: 'blur(16px)',
          opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        }}
      >
        <p style={{ fontSize: 24, color: v, letterSpacing: '0.15em', marginBottom: 16, fontFamily: F.text, textTransform: 'uppercase', textShadow: `0 0 12px ${hexToRgba(v, 0.4)}` }}>
          {`Feature ${n}`}
        </p>
        <h2 style={{ fontSize: 64, fontWeight: 600, color: v, marginBottom: 12, fontFamily: F.display, letterSpacing: '-1px', textShadow: `0 4px 20px ${hexToRgba(v, 0.5)}` }}>
          {title}
        </h2>
        <p style={{ fontSize: 34, color: DARK.textSecondary, fontFamily: F.text, lineHeight: 1.5, textShadow: TS }}>
          {description}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 7: Outro ======

const OutroScene: React.FC<{ brandName: string; outro: string }> = ({ brandName, outro }) => {
  const v = V[6]; // sky blue
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 64px',
          borderRadius: 24,
          backgroundColor: hexToRgba(v, 0.16),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <FadeIn delay={5} duration={25} direction="up">
          <h2 style={{ fontSize: 120, fontWeight: 700, color: v, letterSpacing: '-2px', marginBottom: 20, fontFamily: F.display, textShadow: `0 4px 24px ${hexToRgba(v, 0.5)}` }}>
            {brandName}
          </h2>
        </FadeIn>
        <FadeIn delay={20} duration={25} direction="up">
          <p style={{ fontSize: 44, color: DARK.textSecondary, fontFamily: F.text, textShadow: TS }}>{outro}</p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 8: CTA ======

const CTAScene: React.FC<{
  headline: string;
  subtitle: string;
  contact: string;
}> = ({ headline, subtitle, contact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[7]; // pink

  const btnScale = spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* CTA text plate */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '36px 56px',
          borderRadius: 24,
          backgroundColor: hexToRgba(v, 0.16),
          border: `1px solid ${hexToRgba(v, 0.3)}`,
          marginBottom: 56,
          backdropFilter: 'blur(16px)',
        }}
      >
        <FadeIn delay={5} duration={20} direction="up">
          <h2 style={{ fontSize: 100, fontWeight: 700, color: v, marginBottom: 16, fontFamily: F.display, letterSpacing: '-2px', textAlign: 'center', textShadow: `0 4px 24px ${hexToRgba(v, 0.5)}` }}>
            {headline}
          </h2>
        </FadeIn>
        <FadeIn delay={18} duration={20} direction="up">
          <p style={{ fontSize: 40, color: DARK.textSecondary, margin: 0, fontFamily: F.text, textShadow: TS }}>{subtitle}</p>
        </FadeIn>
      </div>

      {/* Contact card */}
      <div
        style={{
          padding: '36px 64px',
          backgroundColor: hexToRgba(v, 0.25),
          borderRadius: 24,
          border: `2px solid ${hexToRgba(v, 0.5)}`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 40px ${hexToRgba(v, 0.2)}`,
          opacity: interpolate(frame - 20, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          transform: `scale(${0.95 + btnScale * 0.05})`,
        }}
      >
        <p style={{ fontSize: 26, color: DARK.textTertiary, letterSpacing: '0.1em', marginBottom: 12, fontFamily: F.text, textAlign: 'center', textShadow: TS }}>
          {subtitle}
        </p>
        <p style={{ fontSize: 72, fontWeight: 600, color: DARK.text, letterSpacing: '0.05em', fontFamily: F.mono, textAlign: 'center', textShadow: `0 2px 16px ${hexToRgba(v, 0.4)}` }}>
          {contact}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ====== Main ======

export const GangHangHuiModern: React.FC<Props> = ({
  brandName,
  tagline,
  priceValue,
  priceUnit,
  features,
  outro,
  ctaHeadline,
  ctaSubtitle,
  ctaContact,
}) => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={SCENES.reveal}>
      <RevealScene brandName={brandName} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} presentation={fade()} />

    <TransitionSeries.Sequence durationInFrames={SCENES.concept}>
      <ConceptScene tagline={tagline} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} presentation={fade()} />

    <TransitionSeries.Sequence durationInFrames={SCENES.price}>
      <PriceScene priceValue={priceValue} priceUnit={priceUnit} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} presentation={fade()} />

    {features.map((f, i) => (
      <React.Fragment key={i}>
        <TransitionSeries.Sequence durationInFrames={SCENES.feature1}>
          <FeatureScene n={i + 1} title={f.title} description={f.description} />
        </TransitionSeries.Sequence>
        {i < features.length - 1 || true ? (
          <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} presentation={fade()} />
        ) : null}
      </React.Fragment>
    ))}

    <TransitionSeries.Sequence durationInFrames={SCENES.outro}>
      <OutroScene brandName={brandName} outro={outro} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} presentation={fade()} />

    <TransitionSeries.Sequence durationInFrames={SCENES.cta}>
      <CTAScene headline={ctaHeadline} subtitle={ctaSubtitle} contact={ctaContact} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
