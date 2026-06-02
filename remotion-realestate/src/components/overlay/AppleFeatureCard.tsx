// AppleFeatureCard — Apple 风格特性展示卡
// 图标 + 特性名 + 描述，毛玻璃底 + 大量留白 + 逐个慢呼吸入场
// 复用：Apple 风格 Feature / Benefit 展示

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';

interface AppleFeatureCardProps extends OverlayElementBase {
  icon?: string;
  title: string;
  desc: string;
  enTitle?: string;
  enDesc?: string;
}

const A = {
  bg: 'rgba(255,255,255,0.03)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  text: '#F5F5F7',
  textSecondary: 'rgba(255,255,255,0.56)',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
  fontEn: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
};

export const AppleFeatureCard: React.FC<AppleFeatureCardProps> = ({
  icon,
  title,
  desc,
  enTitle,
  enDesc,
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

  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 32, stiffness: 65, mass: 1.5 },
  });
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);

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
          maxWidth: 780,
        }}
      >
        <div
          style={{
            padding: '64px 60px',
            backgroundColor: A.bg,
            borderRadius: 24,
            border: A.border,
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 56px rgba(0,0,0,0.45)',
            opacity: cardOpacity,
            transform: `translateY(${cardY}px)`,
          }}
        >
          {icon && ICON_MAP[icon] && (
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.createElement(ICON_MAP[icon], { size: 32, color: '#F5F5F7', strokeWidth: 1.5 })}
              </div>
            </div>
          )}
          <h2
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: A.text,
              fontFamily: A.font,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              margin: '0 0 14px 0',
            }}
          >
            {title}
          </h2>
          {enTitle && (
            <p
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: A.textSecondary,
                fontFamily: A.fontEn,
                letterSpacing: '0.02em',
                lineHeight: 1.3,
                margin: '0 0 24px 0',
              }}
            >
              {enTitle}
            </p>
          )}
          <p
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: A.textSecondary,
              fontFamily: A.font,
              letterSpacing: '-0.01em',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {desc}
          </p>
          {enDesc && (
            <p
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.4)',
                fontFamily: A.fontEn,
                letterSpacing: '0.02em',
                lineHeight: 1.4,
                margin: '18px 0 0 0',
              }}
            >
              {enDesc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
