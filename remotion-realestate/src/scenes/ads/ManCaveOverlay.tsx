// 男人秘密基地口播透明疊加素材 / 68秒 / 柱子哥風格卡片
// 剪映用法: 渲染 PNG 序列 → 畫中畫 → 正常模式（Alpha 通道）
// 透明底+正常模式: 無褪色、無需補償，色彩精準還原

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
import { Building, Ruler, Tree, Currency, Home, Trending, Tower, Alert, Flame } from '../../components/new/Icons';

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  building: Building,
  ruler: Ruler,
  tree: Tree,
  currency: Currency,
  home: Home,
  trending: Trending,
  tower: Tower,
  alert: Alert,
  flame: Flame,
};

// ====== 正常模式無需補償（Alpha 通道直接疊加） ======

const B = {
  glow: 1.0,         // 中性（正常模式無褪色）
  textAlpha: 1.0,
  shadowA: 1.0,       // 中性
  borderA: 1.0,       // 中性
};

// ====== 柱子哥暖調配色（高飽和版 — 6色循環無疲勞） ======
// 無邊框雙行卡: Hook(藍) → Reveal(金) → Pivot(青) → Climax(紅)
// GlassCard: W1(紅) → W2(綠) → W3(紫) → B1(金) → B2(綠) → B3(紫) → CTA(金)

const V = [
  '#FF4136', // 0: 烈焰紅 — Hook / Climax / Warning1
  '#F5A623', // 1: 亮琥珀金 — Reveal / Benefit1 / CTA
  '#1A56DB', // 2: 深藍 — Hook 備用
  '#10B981', // 3: 翡翠綠 — Warning2 / Benefit2
  '#8B5CF6', // 4: 紫羅蘭 — Warning3 / Benefit3
  '#06B6D4', // 5: 青色 — Pivot 轉折
];

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// 純白文字系統（正常模式直接顯示）
const C = {
  text: '#FFFFFF',           // 純白
  textSecondary: '#F5F0E8',  // 高明度暖白（透明底疊加保持清晰）
  textTertiary: '#C8BFA8',   // 中高明度灰（標籤/輔助）
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
  hook:      { from: s(0),  dur: s(7)  },
  reveal:    { from: s(7),  dur: s(5)  },
  warning1:  { from: s(12), dur: s(5)  },
  warning2:  { from: s(17), dur: s(5)  },
  warning3:  { from: s(22), dur: s(5)  },
  pivot:     { from: s(27), dur: s(5)  },
  benefit1:  { from: s(32), dur: s(7)  },
  benefit2:  { from: s(39), dur: s(7)  },
  benefit3:  { from: s(46), dur: s(7)  },
  climax:    { from: s(53), dur: s(10) },
  cta:       { from: s(63), dur: s(5)  },
  total:     s(68),
};

// ====== Zod Schema ======

export const ManCaveOverlaySchema = z.object({
  hookColor: z.string().default('#1A56DB'),
  hookLine1: z.string(),
  hookLine1En: z.string().optional().default(''),
  hookLine2: z.string(),
  hookLine2En: z.string().optional().default(''),
  hookLine3: z.string(),
  hookLine4: z.string(),
  revealLabel: z.string(),
  revealLabelEn: z.string().optional().default(''),
  revealNumber: z.string(),
  revealUnit: z.string(),
  revealHeadline: z.string(),
  revealHeadlineEn: z.string().optional().default(''),
  revealSubtext: z.string(),
  warning1Icon: z.string().default('tower'),
  warning1Title: z.string(),
  warning1TitleEn: z.string().optional().default(''),
  warning1Desc: z.string(),
  warning2Icon: z.string().default('home'),
  warning2Title: z.string(),
  warning2TitleEn: z.string().optional().default(''),
  warning2Desc: z.string(),
  warning3Icon: z.string().default('alert'),
  warning3Title: z.string(),
  warning3TitleEn: z.string().optional().default(''),
  warning3Desc: z.string(),
  pivotLabel: z.string(),
  pivotHeadline: z.string(),
  pivotHeadlineEn: z.string().optional().default(''),
  benefit1Icon: z.string().default('flame'),
  benefit1Title: z.string(),
  benefit1TitleEn: z.string().optional().default(''),
  benefit1Desc: z.string(),
  benefit2Icon: z.string().default('home'),
  benefit2Title: z.string(),
  benefit2TitleEn: z.string().optional().default(''),
  benefit2Desc: z.string(),
  benefit3Icon: z.string().default('trending'),
  benefit3Title: z.string(),
  benefit3TitleEn: z.string().optional().default(''),
  benefit3Desc: z.string(),
  quickIcon1: z.string().default('flame'),
  quickLabel1: z.string(),
  quickLabel1En: z.string().optional().default(''),
  quickIcon2: z.string().default('home'),
  quickLabel2: z.string(),
  quickLabel2En: z.string().optional().default(''),
  quickIcon3: z.string().default('trending'),
  quickLabel3: z.string(),
  quickLabel3En: z.string().optional().default(''),
  climaxLabel: z.string(),
  climaxHeadline: z.string(),
  climaxHeadlineEn: z.string().optional().default(''),
  climaxSubtext: z.string(),
  ctaHeadline: z.string(),
  ctaHeadlineEn: z.string().optional().default(''),
  ctaContact: z.string(),
  ctaTags: z.string(),
});

type Props = z.infer<typeof ManCaveOverlaySchema>;

// ====== HonestCard（誠實警告 / 男人救星通用卡片） ======

const HonestCard: React.FC<{
  n: number;
  color: string;
  title: string;
  desc: string;
  label: string;
  icon?: string;
  titleEn?: string;
}> = ({ n, color, title, desc, label, icon, titleEn = '' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 側滑入場
  const slideSpring = spring({
    frame,
    fps,
    config: { damping: 35, stiffness: 75, mass: 2.0 },
  });
  const slideX = interpolate(slideSpring, [0, 1], [220, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // 弧形路徑 — Y軸微弧（先上後下，溫暖友好）
  const arcY = interpolate(slideSpring, [0, 0.5, 1], [-10, 4, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // 微預期 — 先微微放大再到位
  const anticipation = interpolate(slideSpring, [0, 0.25, 1], [1.02, 0.98, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // 光暈延遲 — 卡片先落地，光再亮起（Secondary layer trails primary）
  const glowDelay = spring({
    frame: frame - 8,
    fps,
    config: { damping: 35, stiffness: 70, mass: 2.0 },
  });
  const glowRadius = interpolate(glowDelay, [0, 1], [12, 56], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const glowAlpha = interpolate(glowDelay, [0, 1], [0.2, 0.85], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // 穩定後極微呼吸（ambient layer）
  const settledGlow = Math.sin(frame * 0.03) * 0.08 + 0.92;
  const finalGlowAlpha = glowAlpha * (glowDelay > 0.85 ? settledGlow : 1);
  const sa = B.shadowA;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '8% 5%',
      }}
    >
      <div style={{ transform: `translateX(${slideX}px) translateY(${arcY}px) scale(${anticipation})` }}>
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={1.0 * B.glow}
          transparentBg
          showOuterGlow={false}
          maxWidth={980}
          padding="48px 56px 48px 64px"
        >
          {/* 第一行：NumberBadge + Icon 横排 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
            <NumberBadge number={n} color={color} label={label} size={108} fontSize={64} />
            {icon && ICON_MAP[icon] ? (
              React.createElement(ICON_MAP[icon], { size: 88, color: '#FFFFFF', strokeWidth: 2 })
            ) : null}
          </div>

          {/* 第二行：标题 */}
          <h2
            style={{
              fontSize: 108,
              fontWeight: 800,
              color: C.text,
              fontFamily: F.display,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              textShadow: `
                0 0 ${glowRadius}px ${hexToRgba(color, finalGlowAlpha * sa)},
                0 0 ${glowRadius * 2}px ${hexToRgba(color, finalGlowAlpha * sa * 0.5)},
                0 2px 8px rgba(0,0,0,0.5)
              `,
              margin: '0 0 10px 0',
            }}
          >
            {title}
          </h2>

          {/* 英文副文本 */}
          {titleEn ? (
            <p style={{
              fontSize: 56, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
              margin: '0 0 22px 0',
            }}>
              {titleEn}
            </p>
          ) : null}

          {/* 第三行：描述 */}
          <p
            style={{
              fontSize: 56,
              color: C.textSecondary,
              fontFamily: F.text,
              lineHeight: 1.5,
              textShadow: `
                0 0 20px ${hexToRgba(color, 0.55 * sa)},
                0 0 40px ${hexToRgba(color, 0.22 * sa)}
              `,
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

// ====== TwoLineCard — 無邊框雙行卡片：上彩色小標籤 + 下純白大字衝擊 ======

const TwoLineCard: React.FC<{
  label: string; headline: string; color?: string;
  labelEn?: string; headlineEn?: string;
}> = ({
  label,
  headline,
  color,
  labelEn = '',
  headlineEn = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = color ?? V[2]; // 默認深藍，可覆蓋

  const springIn = spring({
    frame,
    fps,
    config: { damping: 35, stiffness: 75, mass: 2.0 },
  });
  const scale = interpolate(springIn, [0, 1], [0.96, 1]);
  const opacity = interpolate(springIn, [0, 1], [0, 1]);

  const headlineDelay = spring({
    frame: frame - 12,
    fps,
    config: { damping: 32, stiffness: 80, mass: 1.5 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '8% 5%',
      }}
    >
      <div style={{ opacity, transform: `scale(${scale})` }}>
        {/* 第一行：藍色小標籤 */}
        <p
          style={{
            fontSize: 54,
            fontWeight: 600,
            color: accent,
            fontFamily: F.text,
            letterSpacing: '0.08em',
            lineHeight: 1.3,
            textShadow: `0 0 20px ${hexToRgba(accent, 0.4)}`,
            margin: '0 0 12px 0',
          }}
        >
          {label}
        </p>

        {/* 英文副文本 */}
        {labelEn ? (
          <p
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              margin: '-4px 0 16px 0',
            }}
          >
            {labelEn}
          </p>
        ) : null}

        {/* 第二行：白色大字衝擊 */}
        <h1
          style={{
            fontSize: 128,
            fontWeight: 800,
            color: C.text,
            fontFamily: F.display,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            opacity: headlineDelay,
            transform: `scale(${0.95 + headlineDelay * 0.05})`,
            textShadow: `
              0 0 48px ${hexToRgba(accent, 0.55)},
              0 0 100px ${hexToRgba(accent, 0.2)},
              0 4px 16px rgba(0,0,0,0.5)
            `,
            margin: 0,
          }}
        >
          {headline}
        </h1>

        {/* 英文副文本 */}
        {headlineEn ? (
          <p
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              margin: '2px 0 0 0',
            }}
          >
            {headlineEn}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 2: Reveal — BigNumber 炸裂數字卡 (7-12s) ======

const BigNumberScene: React.FC<{
  label: string; number: string; unit: string; sublabel: string;
  labelEn?: string; sublabelEn?: string;
}> = ({
  label,
  number: num,
  unit,
  sublabel,
  labelEn = '',
  sublabelEn = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = V[1]; // 金色

  const springIn = spring({
    frame, fps,
    config: { damping: 35, stiffness: 75, mass: 2.0 },
  });
  const scale = interpolate(springIn, [0, 1], [0.94, 1]);
  const opacity = interpolate(springIn, [0, 1], [0, 1]);

  // 數字彈跳 — 重型揭示
  const numSpring = spring({
    frame: frame - 10, fps,
    config: { damping: 30, stiffness: 70, mass: 2.5 },
  });

  // 副標延遲
  const subDelay = spring({
    frame: frame - 22, fps,
    config: { damping: 35, stiffness: 70, mass: 2.0 },
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: 'transparent', display: 'flex',
      flexDirection: 'column', justifyContent: 'center',
      alignItems: 'flex-start', padding: '8% 5%',
    }}>
      <div style={{ opacity, transform: `scale(${scale})` }}>
        {/* 標籤 */}
        <p style={{
          fontSize: 52, fontWeight: 600, color: accent,
          fontFamily: F.text, letterSpacing: '0.12em',
          textShadow: `0 0 16px ${hexToRgba(accent, 0.35)}`,
          margin: '0 0 8px 0',
        }}>
          {label}
        </p>

        {/* 英文副文本 */}
        {labelEn ? (
          <p style={{
            fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
            fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
            margin: '-2px 0 12px 0',
          }}>
            {labelEn}
          </p>
        ) : null}

        {/* 超大數字 + 單位 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, transform: `scale(${0.9 + numSpring * 0.1})` }}>
          <span style={{
            fontSize: 180, fontWeight: 900, color: accent,
            fontFamily: F.display, letterSpacing: '-0.03em', lineHeight: 1,
            textShadow: `
              0 0 60px ${hexToRgba(accent, 0.7)},
              0 0 120px ${hexToRgba(accent, 0.3)},
              0 4px 20px rgba(0,0,0,0.5)
            `,
          }}>
            {num}
          </span>
          <span style={{
            fontSize: 76, fontWeight: 700, color: C.text,
            fontFamily: F.display, letterSpacing: '-0.01em',
            textShadow: `0 0 24px ${hexToRgba(accent, 0.4)}`,
          }}>
            {unit}
          </span>
        </div>

        {/* 副標 */}
        <p style={{
          fontSize: 58, fontWeight: 500, color: C.textSecondary,
          fontFamily: F.text, lineHeight: 1.4, marginTop: 16,
          opacity: subDelay,
          textShadow: `0 0 18px ${hexToRgba(accent, 0.25)}`,
          margin: '16px 0 0 0',
        }}>
          {sublabel}
        </p>

        {/* 英文副文本 */}
        {sublabelEn ? (
          <p style={{
            fontSize: 28, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
            fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
            margin: '4px 0 0 0',
          }}>
            {sublabelEn}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 3-5: SplitCard — 左右分欄警告卡 ======

const SplitCard: React.FC<{
  n: number; color: string; title: string; desc: string; label: string; icon?: string;
  titleEn?: string;
}> = ({ n, color, title, desc, label, icon, titleEn = '' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideSpring = spring({
    frame, fps,
    config: { damping: 35, stiffness: 75, mass: 2.0 },
  });
  const slideX = interpolate(slideSpring, [0, 1], [180, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const arcY = interpolate(slideSpring, [0, 0.5, 1], [-10, 4, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const anticipation = interpolate(slideSpring, [0, 0.25, 1], [1.02, 0.98, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const descOpacity = interpolate(frame - 10, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: 'transparent', display: 'flex',
      justifyContent: 'center', alignItems: 'flex-start', padding: '8% 5%',
    }}>
      <div style={{
        transform: `translateX(${slideX}px) translateY(${arcY}px) scale(${anticipation})`,
      }}>
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={1.0 * B.glow}
          transparentBg
          showOuterGlow={false}
          maxWidth={980}
          padding="40px 48px 40px 56px"
        >
          {/* 第一行：NumberBadge + Icon 横排 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
            <NumberBadge number={n} color={color} label={label} size={108} fontSize={64} />
            {icon && ICON_MAP[icon] ? (
              React.createElement(ICON_MAP[icon], { size: 88, color: '#FFFFFF', strokeWidth: 2 })
            ) : null}
          </div>

          {/* 第二行：标题 */}
          <h2 style={{
            fontSize: 108, fontWeight: 800, color: C.text,
            fontFamily: F.display, letterSpacing: '-0.5px', lineHeight: 1.2,
            textShadow: `
              0 0 32px ${hexToRgba(color, 0.55)},
              0 0 64px ${hexToRgba(color, 0.2)},
              0 2px 8px rgba(0,0,0,0.5)
            `,
            margin: '0 0 10px 0',
          }}>
            {title}
          </h2>

          {/* 英文副文本 */}
          {titleEn ? (
            <p style={{
              fontSize: 56, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
              margin: '0 0 18px 0',
            }}>
              {titleEn}
            </p>
          ) : null}

          {/* 第三行：描述 */}
          <p style={{
            fontSize: 56, color: C.textSecondary, fontFamily: F.text,
            lineHeight: 1.5, opacity: descOpacity,
            textShadow: `
              0 0 16px ${hexToRgba(color, 0.4)},
              0 0 32px ${hexToRgba(color, 0.15)}
            `,
            margin: 0,
          }}>
            {desc}
          </p>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 6: Pivot — PunchLineBox 衝擊邊框句 (27-32s) ======

const PunchLineBoxScene: React.FC<{ text: string; textEn?: string }> = ({ text, textEn = '' }) => {
  return (
    <AbsoluteFill style={{
      backgroundColor: 'transparent', display: 'flex',
      justifyContent: 'center', alignItems: 'flex-start',
      padding: '8% 5%',
    }}>
      <div>
        <PunchLineBox color={V[2]} fontSize={104}>{text}</PunchLineBox>
        {textEn ? (
          <p style={{
            fontSize: 30, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
            fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
            margin: '12px 0 0 0', padding: '0 4px',
          }}>
            {textEn}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 7: IconRow — 圖標特性行 (32-39s) ======

const IconRow: React.FC<{
  items: { icon: string; label: string; labelEn?: string }[];
  color: string;
}> = ({ items, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springIn = spring({
    frame, fps,
    config: { damping: 35, stiffness: 75, mass: 2.0 },
  });
  const scale = interpolate(springIn, [0, 1], [0.94, 1]);
  const opacity = interpolate(springIn, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{
      backgroundColor: 'transparent', display: 'flex',
      flexDirection: 'column', justifyContent: 'center',
      alignItems: 'flex-start', padding: '8% 5%',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', width: '96%',
        maxWidth: 980, opacity, transform: `scale(${scale})`,
      }}>
        {items.map((item, i) => {
          const itemDelay = spring({
            frame: frame - (i * 10), fps,
            config: { damping: 32, stiffness: 80, mass: 1.5 },
          });
          const itemY = interpolate(itemDelay, [0, 1], [24, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              opacity: itemDelay, transform: `translateY(${itemY}px)`,
            }}>
              {/* 圖標圓形容器 */}
              <div style={{
                width: 108, height: 108, borderRadius: 24,
                backgroundColor: hexToRgba(color, 0.2),
                border: `2px solid ${hexToRgba(color, 0.5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `
                  0 0 28px ${hexToRgba(color, 0.45)},
                  0 0 56px ${hexToRgba(color, 0.15)}
                `,
              }}>
                {ICON_MAP[item.icon] ? (
                  React.createElement(ICON_MAP[item.icon], { size: 56, color, strokeWidth: 2 })
                ) : null}
              </div>
              {/* 標籤 */}
              <span style={{
                fontSize: 56, fontWeight: 600, color: C.text,
                fontFamily: F.text, letterSpacing: '0.04em',
                textShadow: `0 0 14px ${hexToRgba(color, 0.3)}`,
              }}>
                {item.label}
              </span>
              {/* 英文副文本 */}
              {item.labelEn ? (
                <span style={{
                  fontSize: 30, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
                  fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
                  marginTop: 2,
                }}>
                  {item.labelEn}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 6: Climax (53-63s) — 無邊框雙行卡片 ======

const ClimaxScene: React.FC<{ label: string; headline: string; labelEn?: string; headlineEn?: string }> = ({ label, headline, labelEn = '', headlineEn = '' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = V[0];

  // 極慢重型入場 — 情感最高點，一切慢下來
  const springIn = spring({
    frame,
    fps,
    config: { damping: 40, stiffness: 50, mass: 3.0 },
  });
  const scale = interpolate(springIn, [0, 1], [0.9, 1]);
  const opacity = interpolate(springIn, [0, 1], [0, 1]);

  // 大字更晚出現 — 先看標籤，再讀衝擊句
  const headlineDelay = spring({
    frame: frame - 16,
    fps,
    config: { damping: 38, stiffness: 55, mass: 2.5 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '8% 5%',
      }}
    >
      <div style={{ opacity, transform: `scale(${scale})` }}>
        <p
          style={{
            fontSize: 54,
            fontWeight: 600,
            color: accent,
            fontFamily: F.text,
            letterSpacing: '0.08em',
            lineHeight: 1.3,
            textShadow: `0 0 20px ${hexToRgba(accent, 0.4)}`,
            margin: '0 0 12px 0',
          }}
        >
          {label}
        </p>
        {labelEn ? (
          <p
            style={{
              fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
              margin: '-4px 0 20px 0',
            }}
          >
            {labelEn}
          </p>
        ) : null}
        <h1
          style={{
            fontSize: 128,
            fontWeight: 800,
            color: C.text,
            fontFamily: F.display,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            opacity: headlineDelay,
            transform: `scale(${0.95 + headlineDelay * 0.05})`,
            textShadow: `
              0 0 48px ${hexToRgba(accent, 0.55)},
              0 0 100px ${hexToRgba(accent, 0.2)},
              0 4px 16px rgba(0,0,0,0.5)
            `,
            margin: 0,
          }}
        >
          {headline}
        </h1>
        {headlineEn ? (
          <p
            style={{
              fontSize: 40, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
              margin: '4px 0 0 0',
            }}
          >
            {headlineEn}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ====== Scene 7: CTA (63-68s) ======

const CTAScene: React.FC<{ headline: string; contact: string; tags: string; headlineEn?: string }> = ({
  headline,
  contact,
  tags,
  headlineEn = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = V[1];

  const contactSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 35, stiffness: 70, mass: 2.0 },
  });
  const contactOpacity = interpolate(frame - 22, [0, 18], [0, 1], {
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
        padding: '8% 5%',
      }}
    >
      <GlassCard
        color={v}
        showLeftBar
        glowIntensity={1.0 * B.glow}
        transparentBg
        maxWidth={980}
        padding="36px 48px"
        borderRadius={16}
        style={{ marginBottom: 36 }}
      >
        <h2
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: C.text,
            fontFamily: F.display,
            lineHeight: 1.3,
            textShadow: `
              0 0 36px ${hexToRgba(v, 0.85 * B.shadowA)},
              0 0 72px ${hexToRgba(v, 0.35 * B.shadowA)}
            `,
            margin: 0,
          }}
        >
          {headline}
        </h2>

        {/* 英文副文本 */}
        {headlineEn ? (
          <p style={{
            fontSize: 34, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
            fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2,
            margin: '4px 0 0 0',
          }}>
            {headlineEn}
          </p>
        ) : null}
      </GlassCard>

      {/* WhatsApp Contact */}
      <div
        style={{
          padding: '36px 56px',
          backgroundColor: 'rgba(14,12,10,0.88)',
          borderRadius: 16,
          border: `2.5px solid ${hexToRgba(v, 0.7 * B.borderA)}`,
          boxShadow: `
            0 0 48px ${hexToRgba(v, 0.45 * B.shadowA)},
            0 0 96px ${hexToRgba(v, 0.15 * B.shadowA)},
            inset 0 1px 0 ${hexToRgba(v, 0.22 * B.shadowA)}
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
            fontSize: 80,
            fontFamily: F.mono,
            fontWeight: 700,
            color: C.text,
            letterSpacing: '0.05em',
            transform: `scale(${1 + Math.sin(frame * 0.1) * 0.025})`,
            textShadow: `
              0 0 32px ${hexToRgba(v, 0.7 * B.shadowA)},
              0 0 64px ${hexToRgba(v, 0.3 * B.shadowA)}
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
        <p style={{ fontSize: 24, color: C.textTertiary, fontFamily: F.text, margin: 0 }}>
          {tags}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ====== Main ======

export const ManCaveOverlay: React.FC<Props> = (props) => {
  const hookLines = [props.hookLine1, props.hookLine2, props.hookLine3, props.hookLine4];

  const warnings = [
    { n: 1, color: V[0], title: props.warning1Title, titleEn: props.warning1TitleEn, desc: props.warning1Desc, label: '誠實警告' as const, icon: props.warning1Icon },
    { n: 2, color: V[3], title: props.warning2Title, titleEn: props.warning2TitleEn, desc: props.warning2Desc, label: '誠實警告' as const, icon: props.warning2Icon },
    { n: 3, color: V[4], title: props.warning3Title, titleEn: props.warning3TitleEn, desc: props.warning3Desc, label: '誠實警告' as const, icon: props.warning3Icon },
  ];

  const benefits = [
    { n: 1, color: V[1], title: props.benefit1Title, titleEn: props.benefit1TitleEn, desc: props.benefit1Desc, label: '男人救星' as const, icon: props.benefit1Icon },
    { n: 2, color: V[3], title: props.benefit2Title, titleEn: props.benefit2TitleEn, desc: props.benefit2Desc, label: '男人救星' as const, icon: props.benefit2Icon },
    { n: 3, color: V[4], title: props.benefit3Title, titleEn: props.benefit3TitleEn, desc: props.benefit3Desc, label: '男人救星' as const, icon: props.benefit3Icon },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <style>{`body { background: transparent !important; }`}</style>

      <Sequence from={T.hook.from} durationInFrames={T.hook.dur} premountFor={s(0.5)}>
        <TwoLineCard label={props.hookLine1} headline={props.hookLine2} color={props.hookColor} labelEn={props.hookLine1En} headlineEn={props.hookLine2En} />
      </Sequence>

      <Sequence from={T.reveal.from} durationInFrames={T.reveal.dur} premountFor={s(0.5)}>
        <BigNumberScene label={props.revealLabel} number={props.revealNumber} unit={props.revealUnit} sublabel={props.revealHeadline} labelEn={props.revealLabelEn} sublabelEn={props.revealHeadlineEn} />
      </Sequence>

      {warnings.map((w, i) => {
        const keys = ['warning1', 'warning2', 'warning3'] as const;
        const key = keys[i];
        return (
          <Sequence
            key={`w${i}`}
            from={T[key].from}
            durationInFrames={T[key].dur}
            premountFor={s(0.5)}
          >
            <SplitCard n={w.n} color={w.color} title={w.title} desc={w.desc} label={w.label} icon={w.icon} titleEn={w.titleEn} />
          </Sequence>
        );
      })}

      <Sequence from={T.pivot.from} durationInFrames={T.pivot.dur} premountFor={s(0.5)}>
        <PunchLineBoxScene text={props.pivotHeadline} textEn={props.pivotHeadlineEn} />
      </Sequence>

      {/* Benefit 1-3: GlassCard 詳細價值 */}
      {benefits.map((b, i) => {
        const keys = ['benefit1', 'benefit2', 'benefit3'] as const;
        const key = keys[i];
        return (
          <Sequence
            key={`b${i}`}
            from={T[key].from}
            durationInFrames={T[key].dur}
            premountFor={s(0.5)}
          >
            <HonestCard n={b.n} color={b.color} title={b.title} desc={b.desc} label={b.label} icon={b.icon} titleEn={b.titleEn} />
          </Sequence>
        );
      })}

      <Sequence from={T.climax.from} durationInFrames={T.climax.dur} premountFor={s(0.5)}>
        <ClimaxScene label={props.climaxLabel} headline={props.climaxHeadline} headlineEn={props.climaxHeadlineEn} />
      </Sequence>

      <Sequence from={T.cta.from} durationInFrames={T.cta.dur} premountFor={s(0.5)}>
        <CTAScene headline={props.ctaHeadline} contact={props.ctaContact} tags={props.ctaTags} headlineEn={props.ctaHeadlineEn} />
      </Sequence>
    </AbsoluteFill>
  );
};
