// BenefitCard — GlassCard 模式 (zhuzige)
// GlassCard + 左侧色条光流 + 中英对照标题/描述
// 复用: Benefit 1/2/3 三个场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase } from './animation';
import { GlassCard } from '../new/GlassCard';
import { ICON_MAP } from './iconMap';

interface BenefitCardProps extends OverlayElementBase {
  title: string;
  desc: string;
  enTitle?: string;
  enDesc?: string;
  icon?: string;
  color?: string;
  highlight?: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  title,
  desc,
  enTitle,
  enDesc,
  icon,
  color = '#F5A623',
  highlight,
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
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  const slideSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 90, mass: 1.2 },
  });
  const slideX = isExiting
    ? interpolate(exitP, [0, 1], [0, -120], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(slideSpring, [0, 1], [120, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Exit: title+desc+highlight fade before card slides out
  const exitContentOpacity = isExiting ? interpolate(exitP, [0, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

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
      <div style={{ opacity: anim.opacity * exitContentOpacity, transform: `translateX(${slideX}px)` }}>
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={0.65}
          transparentBg
          showOuterGlow={false}
          disableEntryAnimation
          padding="44px 48px 40px 56px"
          maxWidth={880}
        >
          {icon && ICON_MAP[icon] && (
            <div style={{ marginBottom: 20 }}>
              {React.createElement(ICON_MAP[icon], { size: 48, color: '#FFFFFF', strokeWidth: 2 })}
            </div>
          )}
          <h2
            style={{
              fontSize: 44,
              fontWeight: 800,
              color,
              fontFamily: F.display,
              letterSpacing: '-0.5px',
              lineHeight: 1.25,
              marginBottom: 18,
              textShadow: textDepth(0.5),
            }}
          >
            {title}
          </h2>
          {enTitle && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '0 0 14px 0',
              }}
            >
              {enTitle}
            </p>
          )}
          {highlight && (
            <p
              style={{
                fontSize: 56,
                fontWeight: 900,
                color,
                fontFamily: F.mono,
                lineHeight: 1.1,
                margin: '0 0 18px 0',
                textShadow: `0 0 36px ${hexToRgba(color, 0.6)}`,
              }}
            >
              {highlight}
            </p>
          )}
          <p
            style={{
              fontSize: 28,
              color: C.textSecondary,
              fontFamily: F.text,
              lineHeight: 1.55,
              textShadow: `0 0 20px ${hexToRgba(color, 0.55)}, 0 0 40px ${hexToRgba(color, 0.22)}`,
              margin: 0,
            }}
          >
            {desc}
          </p>
          {enDesc && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '10px 0 0 0',
              }}
            >
              {enDesc}
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
