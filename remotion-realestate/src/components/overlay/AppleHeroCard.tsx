// AppleHeroCard — Apple 风格大标题卡
// 极简：单行大标题 + 可选的副标题，大量留白 + 慢呼吸弹簧
// 复用：Apple 风格 Hook / 开场

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, OverlayElementBase } from './animation';

interface AppleHeroCardProps extends OverlayElementBase {
  headline: string;
  subtitle?: string;
  enHeadline?: string;
}

// Apple 设计 tokens
const A = {
  bg: 'rgba(255,255,255,0.03)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  text: '#F5F5F7',
  textSecondary: 'rgba(255,255,255,0.56)',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
  fontEn: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
};

export const AppleHeroCard: React.FC<AppleHeroCardProps> = ({
  headline,
  subtitle,
  enHeadline,
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

  const s = spring({
    frame: localFrame,
    fps,
    config: { damping: 30, stiffness: 70, mass: 1.5 },
  });
  const cardScale = interpolate(s, [0, 1], [0.97, 1]);
  const cardOpacity = interpolate(s, [0, 1], [0, 1]);

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
          transform: `scale(${cardScale})`,
          maxWidth: 780,
          padding: '72px 64px',
          backgroundColor: A.bg,
          borderRadius: 28,
          border: A.border,
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
          boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 56px rgba(0,0,0,0.45)',
          opacity: cardOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: A.text,
            fontFamily: A.font,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {headline}
        </h1>
        {enHeadline && (
          <p
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: A.textSecondary,
              fontFamily: A.fontEn,
              letterSpacing: '0.02em',
              lineHeight: 1.35,
              margin: '20px 0 0 0',
            }}
          >
            {enHeadline}
          </p>
        )}
        {subtitle && (
          <p
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: A.textSecondary,
              fontFamily: A.font,
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
              margin: enHeadline ? '36px 0 0 0' : '28px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
