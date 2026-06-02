// 港航匯 — 全合成口播視頻 / 有色玻璃卡片 + 電影暗調背景 / 柱子哥風格
// Remotion 一鍵渲染完整 MP4，無需剪映疊加

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
  Img,
  staticFile,
} from 'remotion';

// 鮮艷配色盤 — 藍橙綠紫紅青 六色循環
const V = [
  '#5599FF', // 0: 藍 blue
  '#FFA726', // 1: 橙 orange
  '#26C281', // 2: 綠 green
  '#AB47BC', // 3: 紫 purple
  '#FF6B6B', // 4: 紅 red
  '#00BCD4', // 5: 青 cyan
];
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const C = {
  text: '#FFFFFF',
  textSecondary: '#D0D5DD',
  textTertiary: '#98A0B0',
};
const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
};
const TS = '0 2px 10px rgba(0,0,0,0.5)';

// ====== Cinematic Dark Background ======
// 程序化電影暗調背景：漸變 + 光暈 + 暗角 + Ken Burns 慢速縮放
// 支援 bgImage prop 切換為 AI 生成的真實圖片

const CinematicBackground: React.FC<{
  colorA: string;
  colorB?: string;
  glowColor?: string;
  glowX?: number;
  glowY?: number;
  imageSrc?: string;
}> = ({ colorA, colorB = '#0A0A0F', glowColor, glowX = 50, glowY = 35, imageSrc }) => {
  const frame = useCurrentFrame();

  const primaryGlow = glowColor || colorA;

  // Ken Burns 慢速縮放（整個場景時長約 120-180 幀，縮放 5%）
  const zoom = interpolate(frame, [0, 180], [1, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* 真實圖片層（如有提供） */}
      {imageSrc && (
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
      )}
      {/* 漸變層（無圖片時全顯，有圖片時疊加暗色罩） */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at ${glowX}% ${glowY}%, ${hexToRgba(primaryGlow, 0.18)} 0%, transparent 50%),
            linear-gradient(160deg, ${hexToRgba(colorA, 0.45)} 0%, ${colorB} 70%, #06060C 100%)
          `,
          transform: imageSrc ? 'none' : `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      />
      {/* 暗角 vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
};

// ====== Schema ======

export const GangHangHuiOverlaySchema = z.object({
  // Hook (0-5s)
  hookHeadline: z.string(),
  hookSubtext: z.string(),
  // Reveal (5-8s)
  revealHeadline: z.string(),
  revealSubtext: z.string(),
  // Warnings (8-16s)
  warning1Title: z.string(),
  warning1Desc: z.string(),
  warning2Title: z.string(),
  warning2Desc: z.string(),
  warning3Title: z.string(),
  warning3Desc: z.string(),
  // Transition (16-18s)
  transitionHeadline: z.string(),
  transitionSubtext: z.string(),
  // Benefits (18-36s)
  benefit1Title: z.string(),
  benefit1Desc: z.string(),
  benefit2Title: z.string(),
  benefit2Desc: z.string(),
  benefit3Title: z.string(),
  benefit3Desc: z.string(),
  // Climax (36-42s)
  climaxHeadline: z.string(),
  climaxSubtext: z.string(),
  // CTA (42-45s)
  ctaHeadline: z.string(),
  ctaContact: z.string(),
  // 可選背景圖片（AI 生成後放入 public/ 即可替換）
  bgImages: z.object({
    hook: z.string().optional(),
    reveal: z.string().optional(),
    warnings: z.string().optional(),
    transition: z.string().optional(),
    benefits: z.string().optional(),
    climax: z.string().optional(),
    cta: z.string().optional(),
  }).optional(),
});

type Props = z.infer<typeof GangHangHuiOverlaySchema>;

// ====== Background Layer with Crossfade ======

const BackgroundLayer: React.FC<{
  colorA: string;
  colorB?: string;
  glowColor?: string;
  glowX?: number;
  glowY?: number;
  imageSrc?: string;
  durationInFrames: number;
}> = ({ colorA, colorB, glowColor, glowX, glowY, imageSrc, durationInFrames }) => {
  const frame = useCurrentFrame();

  // 淡入淡出（頭尾各 15 幀 = 0.5s）
  const fadeDuration = 15;
  const fadeIn = interpolate(frame, [0, fadeDuration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - fadeDuration, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <CinematicBackground
        colorA={colorA}
        colorB={colorB}
        glowColor={glowColor}
        glowX={glowX}
        glowY={glowY}
        imageSrc={imageSrc}
      />
    </div>
  );
};

// ====== Tinted Glass Card ======

const GlassCard: React.FC<{
  color: string;
  headline: string;
  subtext?: string;
  headlineSize?: number;
  subtextSize?: number;
  opacity?: number;
  scale?: number;
  y?: number;
  maxWidth?: number;
}> = ({ color, headline, subtext, headlineSize = 72, subtextSize = 40, opacity = 1, scale = 1, y = 0, maxWidth = 860 }) => (
  <div
    style={{
      width: '85%',
      maxWidth,
      padding: headlineSize > 100 ? '44px 52px' : '36px 48px',
      backgroundColor: hexToRgba(color, 0.26),
      borderRadius: 24,
      border: `1px solid ${hexToRgba(color, 0.40)}`,
      backdropFilter: 'blur(16px)',
      opacity,
      transform: `scale(${scale}) translateY(${y}px)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center' as const,
    }}
  >
    <h2
      style={{
        fontSize: headlineSize,
        fontWeight: 700,
        color,
        fontFamily: F.display,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        marginBottom: subtext ? 16 : 0,
        textShadow: `0 4px 20px ${hexToRgba(color, 0.4)}`,
      }}
    >
      {headline}
    </h2>
    {subtext && (
      <p
        style={{
          fontSize: subtextSize,
          color: C.textSecondary,
          fontFamily: F.text,
          lineHeight: 1.5,
          textShadow: TS,
        }}
      >
        {subtext}
      </p>
    )}
  </div>
);

// ====== Stacked Cards (for warnings & benefits) ======

const StackedCards: React.FC<{
  cards: Array<{ title: string; desc: string }>;
  colors: string[];
  staggerFrames?: number;
}> = ({ cards, colors, staggerFrames = 36 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 24,
        width: '100%',
        paddingLeft: '6%',
      }}
    >
      {cards.map((card, i) => {
        const cc = colors[i];
        const delay = i * staggerFrames;
        const itemFrame = Math.max(0, frame - delay);

        const cardSpring = spring({
          frame: itemFrame,
          fps,
          config: { damping: 20, stiffness: 90, mass: 1.2 },
        });

        const cardOpacity = interpolate(itemFrame, [0, 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        });

        const cardY = interpolate(itemFrame, [0, 18], [40, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.back(1.2)),
        });

        return (
          <div
            key={i}
            style={{
              width: '92%',
              maxWidth: 920,
              padding: '38px 52px',
              backgroundColor: hexToRgba(cc, 0.22),
              borderRadius: 20,
              border: `1px solid ${hexToRgba(cc, 0.35)}`,
              backdropFilter: 'blur(14px)',
              opacity: cardOpacity,
              transform: `translateY(${cardY}px) scale(${0.92 + cardSpring * 0.08})`,
              display: 'flex',
              alignItems: 'center',
              gap: 30,
            }}
          >
            {/* Number badge */}
            <div
              style={{
                width: 76,
                height: 76,
                minWidth: 76,
                borderRadius: 16,
                backgroundColor: hexToRgba(cc, 0.30),
                border: `1px solid ${hexToRgba(cc, 0.50)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 42,
                fontWeight: 700,
                color: cc,
                fontFamily: F.display,
                boxShadow: `0 0 24px ${hexToRgba(cc, 0.35)}`,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 62,
                  fontWeight: 600,
                  color: cc,
                  fontFamily: F.display,
                  marginBottom: 10,
                  letterSpacing: '-0.5px',
                  textShadow: `0 2px 16px ${hexToRgba(cc, 0.40)}`,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: 50,
                  color: C.textSecondary,
                  fontFamily: F.text,
                  lineHeight: 1.45,
                  textShadow: TS,
                  opacity: interpolate(itemFrame - 8, [0, 10], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ====== Scenes ======

const FPS = 30;
const s = (sec: number) => sec * FPS;

// Timing constants (total ~45s = 1350f)
const T = {
  hookStart: s(0),
  revealStart: s(4.5),
  warningsStart: s(7.5),
  transitionStart: s(15),
  benefitsStart: s(17),
  climaxStart: s(35),
  ctaStart: s(40),
  total: s(45),
};

// ====== Scene 1: Hook (0-4.5s) ======

const HookScene: React.FC<{ headline: string; subtext: string }> = ({ headline, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 18, stiffness: 80, mass: 1.5 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      <GlassCard
        color={V[0]}
        headline={headline}
        subtext={subtext}
        headlineSize={96}
        subtextSize={56}
        opacity={opacity}
        scale={0.85 + s1 * 0.15}
      />
    </AbsoluteFill>
  );
};

// ====== Scene 2: Reveal (4.5-7.5s) ======

const RevealScene: React.FC<{ headline: string; subtext: string }> = ({ headline, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[1];

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      <GlassCard
        color={v}
        headline={headline}
        subtext={subtext}
        headlineSize={120}
        subtextSize={52}
        opacity={opacity}
        scale={0.88 + scale * 0.12}
      />
    </AbsoluteFill>
  );
};

// ====== Scene 3: Warnings (7.5-15s) ======

const WarningsScene: React.FC<{
  cards: Array<{ title: string; desc: string }>;
}> = ({ cards }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelColor = V[2]; // 綠
  const cardColors = [V[3], V[4], V[5]]; // 紫 · 紅 · 青

  const labelOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px' }}>
      <p
        style={{
          fontSize: 36,
          fontFamily: F.text,
          color: labelColor,
          letterSpacing: '0.2em',
          marginBottom: 32,
          opacity: labelOpacity,
          textShadow: `0 2px 10px ${hexToRgba(labelColor, 0.4)}`,
          textTransform: 'uppercase' as const,
        }}
      >
        睇中之前 · 三大警告
      </p>
      <StackedCards cards={cards} colors={cardColors} staggerFrames={38} />
    </AbsoluteFill>
  );
};

// ====== Scene 4: Transition (15-17s) ======

const TransitionScene: React.FC<{ headline: string; subtext: string }> = ({ headline, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[0]; // 藍

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      <GlassCard
        color={v}
        headline={headline}
        subtext={subtext}
        headlineSize={100}
        subtextSize={60}
        opacity={opacity}
        scale={0.9 + scale * 0.1}
      />
    </AbsoluteFill>
  );
};

// ====== Scene 5: Benefits (17-35s) ======

const BenefitsScene: React.FC<{
  cards: Array<{ title: string; desc: string }>;
}> = ({ cards }) => {
  const frame = useCurrentFrame();
  const labelV = V[1]; // 橙

  const labelOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px' }}>
      <p
        style={{
          fontSize: 36,
          fontFamily: F.text,
          color: labelV,
          letterSpacing: '0.2em',
          marginBottom: 32,
          opacity: labelOpacity,
          textShadow: `0 2px 10px ${hexToRgba(labelV, 0.4)}`,
          textTransform: 'uppercase' as const,
        }}
      >
        男人嘅「救命草」
      </p>
            <StackedCards cards={cards} colors={[V[2], V[3], V[4]]} staggerFrames={40} />
    </AbsoluteFill>
  );
};

// ====== Scene 6: Climax (35-40s) ======

const ClimaxScene: React.FC<{ headline: string; subtext: string }> = ({ headline, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[5]; // 青

  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 16, stiffness: 75, mass: 1.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      <GlassCard
        color={v}
        headline={headline}
        subtext={subtext}
        headlineSize={88}
        subtextSize={56}
        opacity={opacity}
        scale={0.85 + scale * 0.15}
      />
    </AbsoluteFill>
  );
};

// ====== Scene 7: CTA (40-45s) ======

const CTAScene: React.FC<{ headline: string; contact: string }> = ({ headline, contact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[0]; // 藍

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hScale = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });

  const contactSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const contactOpacity = interpolate(frame - 18, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const phonePulse = interpolate(frame - 40, [0, 15, 30], [1, 1.03, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
      {/* Headline card */}
      <div
        style={{
          width: '85%',
          maxWidth: 860,
          padding: '40px 52px',
          backgroundColor: hexToRgba(v, 0.26),
          borderRadius: 24,
          border: `1px solid ${hexToRgba(v, 0.40)}`,
          backdropFilter: 'blur(16px)',
          opacity,
          transform: `scale(${0.9 + hScale * 0.1})`,
          marginBottom: 48,
          textAlign: 'center' as const,
        }}
      >
        <h2
          style={{
            fontSize: 100,
            fontWeight: 700,
            color: v,
            fontFamily: F.display,
            letterSpacing: '-0.02em',
            textShadow: `0 4px 24px ${hexToRgba(v, 0.5)}`,
          }}
        >
          {headline}
        </h2>
      </div>

      {/* Contact card */}
      <div
        style={{
          padding: '44px 68px',
          backgroundColor: hexToRgba(v, 0.36),
          borderRadius: 24,
          border: `2px solid ${hexToRgba(v, 0.60)}`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 40px ${hexToRgba(v, 0.2)}`,
          opacity: contactOpacity,
          transform: `scale(${0.93 + contactSpring * 0.07})`,
          textAlign: 'center' as const,
        }}
      >
        <p
          style={{
            fontSize: 36,
            fontFamily: F.text,
            color: C.textTertiary,
            letterSpacing: '0.1em',
            marginBottom: 16,
            textShadow: TS,
          }}
        >
          WhatsApp
        </p>
        <p
          style={{
            fontSize: 78,
            fontFamily: F.mono,
            fontWeight: 600,
            color: C.text,
            letterSpacing: '0.05em',
            transform: `scale(${phonePulse})`,
            textShadow: `0 0 20px ${hexToRgba(v, 0.45)}`,
          }}
        >
          {contact}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ====== Main ======

export const GangHangHuiOverlay: React.FC<Props> = (props) => {
  const warnings = [
    { title: props.warning1Title, desc: props.warning1Desc },
    { title: props.warning2Title, desc: props.warning2Desc },
    { title: props.warning3Title, desc: props.warning3Desc },
  ];

  const benefits = [
    { title: props.benefit1Title, desc: props.benefit1Desc },
    { title: props.benefit2Title, desc: props.benefit2Desc },
    { title: props.benefit3Title, desc: props.benefit3Desc },
  ];

  const bg = props.bgImages;

  return (
    <AbsoluteFill style={{ backgroundColor: '#06060C' }}>
      {/* ====== Background Layers ====== */}
      <Sequence from={T.hookStart} durationInFrames={T.revealStart - T.hookStart}><BackgroundLayer colorA="#1A2A4A" glowColor="#5599FF" glowX={40} glowY={30} imageSrc={bg?.hook} durationInFrames={T.revealStart - T.hookStart} /></Sequence>
      <Sequence from={T.revealStart} durationInFrames={T.warningsStart - T.revealStart}><BackgroundLayer colorA="#2A1A0A" glowColor="#FFA726" glowX={55} glowY={28} imageSrc={bg?.reveal} durationInFrames={T.warningsStart - T.revealStart} /></Sequence>
      <Sequence from={T.warningsStart} durationInFrames={T.transitionStart - T.warningsStart}><BackgroundLayer colorA="#0A1A10" glowColor="#26C281" glowX={30} glowY={45} imageSrc={bg?.warnings} durationInFrames={T.transitionStart - T.warningsStart} /></Sequence>
      <Sequence from={T.transitionStart} durationInFrames={T.benefitsStart - T.transitionStart}><BackgroundLayer colorA="#1A2240" glowColor="#5599FF" glowX={50} glowY={38} imageSrc={bg?.transition} durationInFrames={T.benefitsStart - T.transitionStart} /></Sequence>
      <Sequence from={T.benefitsStart} durationInFrames={T.climaxStart - T.benefitsStart}><BackgroundLayer colorA="#1F1408" glowColor="#FFA726" glowX={45} glowY={32} imageSrc={bg?.benefits} durationInFrames={T.climaxStart - T.benefitsStart} /></Sequence>
      <Sequence from={T.climaxStart} durationInFrames={T.ctaStart - T.climaxStart}><BackgroundLayer colorA="#0A1A1F" glowColor="#00BCD4" glowX={50} glowY={22} imageSrc={bg?.climax} durationInFrames={T.ctaStart - T.climaxStart} /></Sequence>
      <Sequence from={T.ctaStart} durationInFrames={T.total - T.ctaStart}><BackgroundLayer colorA="#152035" glowColor="#5599FF" glowX={50} glowY={35} imageSrc={bg?.cta} durationInFrames={T.total - T.ctaStart} /></Sequence>
      {/* ====== Content Layers ====== */} {/* ====== Content Layers ====== */}{/* ====== Content Layers ====== */}

      <Sequence from={T.hookStart} durationInFrames={T.revealStart - T.hookStart}>
        <HookScene headline={props.hookHeadline} subtext={props.hookSubtext} />
      </Sequence>

      <Sequence from={T.revealStart} durationInFrames={T.warningsStart - T.revealStart}>
        <RevealScene headline={props.revealHeadline} subtext={props.revealSubtext} />
      </Sequence>

      <Sequence from={T.warningsStart} durationInFrames={T.transitionStart - T.warningsStart}>
        <WarningsScene cards={warnings} />
      </Sequence>

      <Sequence from={T.transitionStart} durationInFrames={T.benefitsStart - T.transitionStart}>
        <TransitionScene headline={props.transitionHeadline} subtext={props.transitionSubtext} />
      </Sequence>

      <Sequence from={T.benefitsStart} durationInFrames={T.climaxStart - T.benefitsStart}>
        <BenefitsScene cards={benefits} />
      </Sequence>

      <Sequence from={T.climaxStart} durationInFrames={T.ctaStart - T.climaxStart}>
        <ClimaxScene headline={props.climaxHeadline} subtext={props.climaxSubtext} />
      </Sequence>

      <Sequence from={T.ctaStart} durationInFrames={T.total - T.ctaStart}>
        <CTAScene headline={props.ctaHeadline} contact={props.ctaContact} />
      </Sequence>
    </AbsoluteFill>
  );
};
