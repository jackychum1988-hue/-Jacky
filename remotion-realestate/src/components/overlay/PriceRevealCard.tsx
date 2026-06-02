// PriceRevealCard — 价格揭示卡片
// 四幕叙事: Setup(蓄力) → Tease(暗示) → Reveal(爆发) → Settle(沉淀)
// 数字滚动 + 光环爆发 + 光扫 + 透明底

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';

interface PriceRevealCardProps extends OverlayElementBase {
  tag: string;
  subtitle: string;
  priceLabel: string;
  priceValue: string;
  priceUnit: string;
  enTag?: string;
  enSubtitle?: string;
  color?: string;
}

const SPRING = {
  cardEnter:   { damping: 35, stiffness: 75, mass: 2.0 },
  heavyReveal: { damping: 30, stiffness: 70, mass: 2.5 },
  glowDelay:   { damping: 35, stiffness: 70, mass: 2.0 },
  settleSlow:  { damping: 40, stiffness: 50, mass: 3.0 },
  ringBurst:   { damping: 25, stiffness: 80, mass: 0.8 },
};

export const PriceRevealCard: React.FC<PriceRevealCardProps> = ({
  tag,
  subtitle,
  priceLabel,
  priceValue,
  priceUnit,
  enTag,
  enSubtitle,
  color = '#F5A623',
  enterAt,
  exitAt,
  animation,
  position,
  offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);

  const cr = parseInt(color.slice(1, 3), 16);
  const cg = parseInt(color.slice(3, 5), 16);
  const cb = parseInt(color.slice(5, 7), 16);
  const rgba = (a: number) => `rgba(${cr},${cg},${cb},${a})`;

  const sanitizedPrice = priceValue.replace(/[^\d.]/g, '');
  const numericValue = parseFloat(sanitizedPrice) || 0;

  // Act 1: Setup — Tag 弧线入场
  const tagSpring = spring({ frame: localFrame, fps, config: SPRING.cardEnter });
  const tagArcY = interpolate(tagSpring, [0, 0.5, 1], [-24, 4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tagScale = interpolate(tagSpring, [0, 0.25, 1], [1.04, 0.97, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tagOpacity = interpolate(localFrame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tagGlowBoost = interpolate(localFrame - 12, [0, 10], [0.4, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Act 2: Tease — Subtitle 淡入
  const subOpacity = interpolate(localFrame - 12, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subScale = interpolate(localFrame - 12, [0, 18], [0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bgExpandSpring = spring({ frame: Math.max(0, localFrame - 18), fps, config: SPRING.glowDelay });
  const bgGlowAlpha = interpolate(bgExpandSpring, [0, 1], [0.06, 0.22], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Act 3: Reveal — 光环爆发
  const ringSpring = spring({ frame: Math.max(0, localFrame - 22), fps, config: SPRING.ringBurst });
  const ringScale = interpolate(ringSpring, [0, 1], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ringOpacity = interpolate(ringSpring, [0, 0.35, 1], [0.85, 0.45, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Act 3: Reveal — 卡片弹入
  const cardSpring = spring({ frame: Math.max(0, localFrame - 22), fps, config: SPRING.cardEnter });
  const cardArcY = interpolate(cardSpring, [0, 0.5, 1], [-36, 10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = interpolate(cardSpring, [0, 0.25, 1], [0.3, 1.08, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardOpacity = interpolate(cardSpring, [0, 0.3, 1], [0, 0.55, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Act 3: Reveal — 光扫
  const fastSweep = interpolate(localFrame - 25, [0, 30], [-100, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slowSweep = ((localFrame - 60) * 1.2) % 320 - 100;
  const effectiveSweep = localFrame < 60 ? fastSweep : slowSweep;
  const sweepVisible = localFrame > 25;

  // Act 3: Reveal — 数字滚动 (从高往低滚)
  const numberSpring = spring({ frame: Math.max(0, localFrame - 28), fps, config: SPRING.heavyReveal });
  const startPrice = Math.max(numericValue * 3, 50);
  const displayPrice = interpolate(numberSpring, [0, 1], [startPrice, numericValue], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const numberScale = interpolate(numberSpring, [0, 0.25, 1], [0.7, 1.06, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Act 3: Reveal — 文字光晕渐亮
  const glowSpring = spring({ frame: Math.max(0, localFrame - 32), fps, config: SPRING.glowDelay });
  const priceGlowRadius = interpolate(glowSpring, [0, 1], [24, 84], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const priceGlowAlpha = interpolate(glowSpring, [0, 1], [0.25, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const settledGlow = Math.sin(localFrame * 0.03) * 0.07 + 0.93;
  const breatheBlend = interpolate(glowSpring, [0.65, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const finalGlowAlpha = priceGlowAlpha * (1 - breatheBlend + breatheBlend * settledGlow);

  // Act 4: Settle
  const numberBreathe = 1 + Math.sin(localFrame * 0.045) * 0.018;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: posStyle.display,
        justifyContent: posStyle.justifyContent,
        alignItems: posStyle.alignItems,
        padding: posStyle.padding,
        transform: posStyle.transform,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          opacity: anim.opacity,
          transform: anim.transform,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* 光环爆发 */}
        <div
          style={{
            position: 'absolute',
            width: 220, height: 220,
            top: 80, left: 0,
            borderRadius: '50%',
            border: `3px solid ${rgba(ringOpacity)}`,
            boxShadow: [
              `0 0 ${80 * ringOpacity}px ${rgba(0.6 * ringOpacity)}`,
              `0 0 ${180 * ringOpacity}px ${rgba(0.2 * ringOpacity)}`,
            ].join(','),
            transform: `scale(${ringScale})`,
            opacity: ringOpacity > 0.02 ? 1 : 0,
            pointerEvents: 'none',
          }}
        />

        {/* Tag — 弧线入场 */}
        <p
          style={{
            fontSize: 54,
            fontWeight: 700,
            color,
            fontFamily: F.display,
            letterSpacing: '0.1em',
            lineHeight: 1.3,
            textShadow: `0 0 ${28 + bgExpandSpring * 20}px ${rgba(tagGlowBoost)}`,
            margin: 0,
            opacity: tagOpacity,
            transform: `translateY(${tagArcY}px) scale(${tagScale})`,
            zIndex: 1,
          }}
        >
          {tag}
          {enTag && (
            <span style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.textSecondary,
              fontFamily: F.text,
              letterSpacing: '0.04em',
              marginLeft: 16,
              textShadow: 'none',
            }}>
              {enTag}
            </span>
          )}
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: C.text,
            fontFamily: F.text,
            letterSpacing: '0.04em',
            lineHeight: 1.3,
            textShadow: `0 0 20px ${rgba(0.25 * bgExpandSpring)}`,
            margin: '14px 0 0 0',
            opacity: subOpacity,
            transform: `scale(${subScale})`,
            zIndex: 1,
          }}
        >
          {subtitle}
        </p>
        {enSubtitle && (
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: C.textSecondary,
              fontFamily: F.text,
              letterSpacing: '0.03em',
              lineHeight: 1.4,
              textShadow: `0 0 16px ${rgba(0.18)}`,
              margin: '10px 0 0 0',
              opacity: subOpacity,
              transform: `scale(${subScale})`,
              zIndex: 1,
            }}
          >
            {enSubtitle}
          </p>
        )}

        {/* 价格卡片 — 透明底 + 金色边框 + 光扫 */}
        <div
          style={{
            marginTop: 40,
            opacity: cardOpacity,
            transform: `translateY(${cardArcY}px) scale(${cardScale})`,
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {sweepVisible && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
              <div
                style={{
                  position: 'absolute', top: 0, bottom: 0,
                  width: '55%',
                  left: `${effectiveSweep}%`,
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    rgba(255,255,255,0) 35%,
                    rgba(255,255,255,0.07) 47%,
                    rgba(255,255,255,0.1) 50%,
                    rgba(255,255,255,0.07) 53%,
                    rgba(255,255,255,0) 65%,
                    transparent 100%
                  )`,
                }}
              />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 24,
              padding: '36px 64px',
              backgroundColor: 'transparent',
              borderRadius: 24,
              border: `1.5px solid ${rgba(0.48)}`,
              boxShadow: [
                `0 0 48px ${rgba(0.25)}`,
                `0 0 96px ${rgba(0.1)}`,
                `inset 0 1px 0 ${rgba(0.12)}`,
              ].join(','),
              position: 'relative',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                color,
                fontFamily: F.display,
                letterSpacing: '0.06em',
                textShadow: `0 0 16px ${rgba(0.45)}`,
                transform: `scale(${0.9 + cardSpring * 0.1})`,
              }}
            >
              {priceLabel}
            </span>

            <span
              style={{
                fontSize: 160,
                fontWeight: 900,
                color: C.text,
                fontFamily: F.mono,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                transform: `scale(${numberScale * numberBreathe})`,
                textShadow: [
                  `0 0 ${priceGlowRadius}px ${rgba(0.9 * finalGlowAlpha)}`,
                  `0 0 ${priceGlowRadius * 2}px ${rgba(0.3 * finalGlowAlpha)}`,
                  `0 0 ${priceGlowRadius * 0.5}px rgba(255,255,255,0.15)`,
                  `0 4px 14px rgba(0,0,0,0.5)`,
                ].join(','),
              }}
            >
              {displayPrice.toFixed(1)}
            </span>

            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: C.text,
                fontFamily: F.display,
                textShadow: `0 0 28px ${rgba(0.45 * (0.9 + cardSpring * 0.1))}`,
                transform: `scale(${0.9 + cardSpring * 0.1})`,
              }}
            >
              {priceUnit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
