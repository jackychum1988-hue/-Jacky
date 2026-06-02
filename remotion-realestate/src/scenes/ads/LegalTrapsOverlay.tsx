// 法律陷阱口播透明疊加素材 / 75秒 / 柱子哥風格卡片
// 剪映用法: 導入 PNG 序列幀 → 畫中畫 → 混合模式: 正常

import React from 'react';
import { z } from 'zod';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from 'remotion';
import { GlassCard, NumberBadge, PunchLineBox } from '../../components/new';

// ====== 柱子哥配色 — 暗調克制 ======

const V = [
  '#C0392B', // 0: 暗紅 → Hook 強調
  '#B8944A', // 1: 啞金 → Reveal / 價格數字
  '#7A8B8B', // 2: 灰青 → Trap 3 冷靜收束
];

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const C = {
  text: '#F5F0EB',         // 暖白（非純白，柱子哥風格）
  textSecondary: '#B8B0A8', // 灰白
  textTertiary: '#8A8278',  // 深灰
};

const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
};

const TS = '0 2px 10px rgba(0,0,0,0.5)';
const FPS = 30;
const s = (sec: number) => sec * FPS;

// Timing
const T = {
  hook: { from: s(0), dur: s(8) },
  reveal: { from: s(8), dur: s(7) },
  trap1: { from: s(15), dur: s(15) },
  trap2: { from: s(30), dur: s(17) },
  trap3: { from: s(47), dur: s(15) },
  recap: { from: s(62), dur: s(6) },
  cta: { from: s(68), dur: s(7) },
  total: s(75),
};

// ====== Schema ======

export const LegalTrapsOverlaySchema = z.object({
  hookLine1: z.string(),
  hookLine2: z.string(),
  hookLine3: z.string(),
  hookLine4: z.string(),
  revealHeadline: z.string(),
  revealSubtext: z.string(),
  trap1Title: z.string(),
  trap1Desc: z.string(),
  trap2Title: z.string(),
  trap2Desc: z.string(),
  trap3Title: z.string(),
  trap3Desc: z.string(),
  recapHeadline: z.string(),
  recapSubtext: z.string(),
  ctaHeadline: z.string(),
  ctaContact: z.string(),
  ctaTags: z.string(),
});

type Props = z.infer<typeof LegalTrapsOverlaySchema>;

// ====== Trap Card（柱子哥風格：左側色條 + 左對齊 + 強光暈文字） ======

const TrapCard: React.FC<{
  n: number;
  color: string;
  title: string;
  desc: string;
}> = ({ n, color, title, desc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 側滑入場：從右側滑入 (280px → 0)
  const slideSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 90, mass: 1.2 },
  });
  const slideX = interpolate(slideSpring, [0, 1], [280, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 光暈脈衝：標題光暈隨 sin 波振盪
  const glowPhase = Math.sin(frame * 0.07) * 0.5 + 0.5;
  const glowRadius = 30 + glowPhase * 24;
  const glowAlpha = 0.5 + glowPhase * 0.35;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // 抖音/小紅書安全區：上下留 15%
        padding: '12% 8%',
      }}
    >
      <div style={{ transform: `translateX(${slideX}px)`, width: '100%' }}>
        <GlassCard color={color} showLeftBar glowIntensity={1} padding="44px 48px 40px 56px">
        <NumberBadge number={n} color={color} label="法律陷阱" size={64} fontSize={36} />

        <div style={{ marginBottom: 20 }} />

        <h2
          style={{
            fontSize: 40,
            fontWeight: 800,
            color,
            fontFamily: F.display,
            letterSpacing: '-0.5px',
            lineHeight: 1.25,
            marginBottom: 18,
            // 光暈脈衝文字
            textShadow: `
              0 0 ${glowRadius}px ${hexToRgba(color, glowAlpha)},
              0 0 ${glowRadius * 2}px ${hexToRgba(color, glowAlpha * 0.5)},
              0 2px 8px rgba(0,0,0,0.5)
            `,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: 30,
            color: C.textSecondary,
            fontFamily: F.text,
            lineHeight: 1.55,
            textShadow: `0 0 12px ${hexToRgba(color, 0.15)}`,
            opacity: interpolate(frame - 12, [0, 14], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            margin: 0,
          }}
        >
          {desc}
        </p>
      </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 1: Hook (0-8s) — 暗紅強調 ======

const HookScene: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const accent = V[0]; // 暗紅

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '12% 8%',
        gap: 18,
      }}
    >
      {lines.map((line, i) => {
        const delay = i * 40;
        const itemFrame = Math.max(0, frame - delay);
        const opacity = interpolate(itemFrame, [0, 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const y = interpolate(itemFrame, [0, 18], [30, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const isPunch = i === lines.length - 1;

        return (
          <div key={i} style={{ opacity, transform: `translateY(${y}px)` }}>
            {isPunch ? (
              <PunchLineBox color={accent} delay={i * 40} fontSize={64}>
                {line}
              </PunchLineBox>
            ) : (
              <p
                style={{
                  fontSize: 44,
                  color: C.text,
                  fontFamily: F.text,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  textShadow: `0 0 20px ${hexToRgba(accent, 0.12)}`,
                  margin: 0,
                }}
              >
                {line}
              </p>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ====== Scene 2: Reveal (8-15s) — 啞金揭示 ======

const RevealScene: React.FC<{ headline: string; subtext: string }> = ({ headline, subtext }) => {
  const v = V[1]; // 啞金

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '12% 8%',
      }}
    >
      <GlassCard color={v} showLeftBar glowIntensity={1.1} padding="44px 52px">
        <h2
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: v,
            fontFamily: F.display,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            marginBottom: 16,
            textShadow: `
              0 0 40px ${hexToRgba(v, 0.6)},
              0 0 80px ${hexToRgba(v, 0.25)},
              0 2px 8px rgba(0,0,0,0.5)
            `,
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontSize: 36,
            color: C.textSecondary,
            fontFamily: F.text,
            lineHeight: 1.5,
            textShadow: `0 0 12px ${hexToRgba(v, 0.15)}`,
            margin: 0,
          }}
        >
          {subtext}
        </p>
      </GlassCard>
    </AbsoluteFill>
  );
};

// ====== Scene 6: Recap (62-68s) — 暗紅總結 ======

const RecapScene: React.FC<{ headline: string; subtext: string }> = ({ headline, subtext }) => {
  const v = V[0]; // 暗紅

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '12% 8%',
      }}
    >
      <GlassCard color={v} showLeftBar glowIntensity={1.2} padding="44px 52px" borderWidth={2}>
        <h2
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: v,
            fontFamily: F.display,
            lineHeight: 1.3,
            marginBottom: 16,
            textShadow: `
              0 0 36px ${hexToRgba(v, 0.7)},
              0 0 80px ${hexToRgba(v, 0.3)},
              0 2px 8px rgba(0,0,0,0.5)
            `,
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontSize: 34,
            color: C.textSecondary,
            fontFamily: F.text,
            lineHeight: 1.5,
            textShadow: `0 0 12px ${hexToRgba(v, 0.15)}`,
            margin: 0,
          }}
        >
          {subtext}
        </p>
      </GlassCard>
    </AbsoluteFill>
  );
};

// ====== Scene 7: CTA (68-75s) — 啞金行動號召 ======

const CTAScene: React.FC<{ headline: string; contact: string; tags: string }> = ({
  headline,
  contact,
  tags,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[1]; // 啞金

  const contactSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const contactOpacity = interpolate(frame - 18, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '12% 8%',
      }}
    >
      <GlassCard color={v} showLeftBar glowIntensity={1} padding="36px 48px" borderRadius={16} style={{ marginBottom: 36 }}>
        <h2
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: v,
            fontFamily: F.display,
            lineHeight: 1.3,
            textShadow: `
              0 0 30px ${hexToRgba(v, 0.6)},
              0 0 60px ${hexToRgba(v, 0.25)}
            `,
            margin: 0,
          }}
        >
          {headline}
        </h2>
      </GlassCard>

      {/* WhatsApp Contact */}
      <div
        style={{
          padding: '36px 56px',
          backgroundColor: `rgba(14,12,10,0.88)`,
          borderRadius: 16,
          border: `2px solid ${hexToRgba(v, 0.5)}`,
          boxShadow: `
            0 0 32px ${hexToRgba(v, 0.3)},
            0 0 64px ${hexToRgba(v, 0.1)},
            inset 0 1px 0 ${hexToRgba(v, 0.15)}
          `,
          opacity: contactOpacity,
          transform: `scale(${0.93 + contactSpring * 0.07})`,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontFamily: F.text,
            color: C.textTertiary,
            letterSpacing: '0.1em',
            marginBottom: 12,
            textShadow: TS,
          }}
        >
          WhatsApp
        </p>
        <p
          style={{
            fontSize: 60,
            fontFamily: F.mono,
            fontWeight: 600,
            color: C.text,
            letterSpacing: '0.05em',
            transform: `scale(${1 + Math.sin(frame * 0.1) * 0.025})`,
            textShadow: `
              0 0 24px ${hexToRgba(v, 0.5)},
              0 0 48px ${hexToRgba(v, 0.2)}
            `,
            margin: 0,
          }}
        >
          {contact}
        </p>
      </div>

      {/* Tags */}
      <div
        style={{
          opacity: interpolate(frame - 35, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          padding: '14px 28px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p style={{ fontSize: 24, color: C.textTertiary, fontFamily: F.text, margin: 0 }}>{tags}</p>
      </div>
    </AbsoluteFill>
  );
};

// ====== Main ======

export const LegalTrapsOverlay: React.FC<Props> = (props) => {
  const hookLines = [props.hookLine1, props.hookLine2, props.hookLine3, props.hookLine4];

  const traps = [
    { n: 1, color: V[0], title: props.trap1Title, desc: props.trap1Desc },
    { n: 2, color: V[1], title: props.trap2Title, desc: props.trap2Desc },
    { n: 3, color: V[2], title: props.trap3Title, desc: props.trap3Desc },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <style>{`body { background: transparent !important; }`}</style>

      <Sequence from={T.hook.from} durationInFrames={T.hook.dur} premountFor={s(0.5)}>
        <HookScene lines={hookLines} />
      </Sequence>

      <Sequence from={T.reveal.from} durationInFrames={T.reveal.dur} premountFor={s(0.5)}>
        <RevealScene headline={props.revealHeadline} subtext={props.revealSubtext} />
      </Sequence>

      {traps.map((trap, i) => {
        const keys = ['trap1', 'trap2', 'trap3'] as const;
        const key = keys[i];
        return (
          <Sequence key={i} from={T[key].from} durationInFrames={T[key].dur} premountFor={s(0.5)}>
            <TrapCard n={trap.n} color={trap.color} title={trap.title} desc={trap.desc} />
          </Sequence>
        );
      })}

      <Sequence from={T.recap.from} durationInFrames={T.recap.dur} premountFor={s(0.5)}>
        <RecapScene headline={props.recapHeadline} subtext={props.recapSubtext} />
      </Sequence>

      <Sequence from={T.cta.from} durationInFrames={T.cta.dur} premountFor={s(0.5)}>
        <CTAScene headline={props.ctaHeadline} contact={props.ctaContact} tags={props.ctaTags} />
      </Sequence>
    </AbsoluteFill>
  );
};
