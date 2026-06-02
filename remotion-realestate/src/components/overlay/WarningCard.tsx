// WarningCard — SplitCard + GlassCard 模式 (zhuzige)
// NumberBadge + 彩色标题 + 白色描述 + 中英对照
// 全部包裹在透明 GlassCard 内
// 复用: Warning 1/2/3 三个场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textGlow, breathingScale, hexToRgba, OverlayElementBase } from './animation';
import { NumberBadge } from '../new/NumberBadge';
import { GlassCard } from '../new/GlassCard';
import { ICON_MAP } from './iconMap';
import { ColoredAmbience } from './ColoredAmbience';

interface WarningCardProps extends OverlayElementBase {
  label?: string;
  n: number;
  title: string;
  desc: string;
  enTitle?: string;
  enDesc?: string;
  icon?: string;
  color?: string;
  bullets?: string[];
}

export const WarningCard: React.FC<WarningCardProps> = ({
  label,
  n,
  title,
  desc,
  enTitle,
  enDesc,
  icon,
  color = '#FF4136',
  bullets,
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
  const slideSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 30, stiffness: 65, mass: 1.5 },
  });
  const slideX = interpolate(slideSpring, [0, 1], [80, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          transform: `translateX(${slideX}px)`,
          width: '90%',
          maxWidth: 880,
        }}
      >
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={0.2}
          transparentBg
          showOuterGlow={false}
          padding="40px 48px 36px 56px"
          maxWidth={880}
        >
          <ColoredAmbience color={color} />
          {/* Label: 彩色小字标注 */}
          {label && (
            <p style={{
              fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
              letterSpacing: '0.08em', lineHeight: 1.3,
              textShadow: textGlow(color, 0.3), margin: '0 0 16px 0',
            }}>
              {label}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <NumberBadge number={n} color={color} size={64} fontSize={40} />
            {icon && ICON_MAP[icon] && React.createElement(ICON_MAP[icon], { size: 48, color: '#FFFFFF', strokeWidth: 2 })}
          </div>
          <h2
            style={{
              fontSize: 44,
              fontWeight: 800,
              color,
              fontFamily: F.display,
              textShadow: textGlow(color, 0.35),
              margin: '0 0 8px 0',
              lineHeight: 1.2,
              transform: `scale(${breathingScale(frame)})`,
            }}
          >
            {title}
          </h2>
          {enTitle && (
            <p
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '0 0 16px 0',
              }}
            >
              {enTitle}
            </p>
          )}
          <p
            style={{
              fontSize: 28,
              color: C.textSecondary,
              fontFamily: F.text,
              fontWeight: 500,
              lineHeight: 1.55,
              textShadow: textGlow(color, 0.2),
              margin: 0,
            }}
          >
            {desc}
          </p>
          {enDesc && (
            <p
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '10px 0 0 0',
              }}
            >
              {enDesc}
            </p>
          )}
          {bullets && bullets.length > 0 && (
            <ul style={{ margin: '16px 0 0 0', padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bullets.map((b, bi) => {
                const bulletFrame = Math.max(0, frame - enterAt - 20 - bi * 6);
                const bulletOpacity = interpolate(bulletFrame, [0, 14], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <li
                    key={bi}
                    style={{
                      fontSize: 24,
                      color: C.textSecondary,
                      fontFamily: F.text,
                      lineHeight: 1.5,
                      opacity: bulletOpacity,
                    }}
                  >
                    {b}
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
