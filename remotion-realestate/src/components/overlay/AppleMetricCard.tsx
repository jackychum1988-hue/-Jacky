// AppleMetricCard — Apple 风格数据指标卡
// 巨大数字 + 极小标签，毛玻璃底 + 极致留白 + 慢呼吸淡入
// 复用：Apple 风格关键数据展示（总价/面积/容积率）

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, OverlayElementBase } from './animation';

interface AppleMetricCardProps extends OverlayElementBase {
  value: string;
  unit?: string;
  label: string;
  enLabel?: string;
}

const A = {
  bg: 'rgba(255,255,255,0.03)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  text: '#F5F5F7',
  textSecondary: 'rgba(255,255,255,0.56)',
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
  fontEn: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
  fontMono: '"SF Mono", "JetBrains Mono", monospace',
};

export const AppleMetricCard: React.FC<AppleMetricCardProps> = ({
  value,
  unit,
  label,
  enLabel,
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
    config: { damping: 30, stiffness: 70, mass: 1.5 },
  });
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const numSpring = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 28, stiffness: 60, mass: 1.2 },
  });
  const numScale = interpolate(numSpring, [0, 1], [0.95, 1]);
  const numOpacity = interpolate(numSpring, [0, 1], [0, 1]);

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
            padding: '72px 64px',
            backgroundColor: A.bg,
            borderRadius: 28,
            border: A.border,
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 56px rgba(0,0,0,0.45)',
            opacity: cardOpacity,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 14,
              opacity: numOpacity,
              transform: `scale(${numScale})`,
            }}
          >
            <span
              style={{
                fontSize: 130,
                fontWeight: 300,
                color: A.text,
                fontFamily: A.fontMono,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {value}
            </span>
            {unit && (
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 300,
                  color: A.textSecondary,
                  fontFamily: A.font,
                  letterSpacing: '-0.01em',
                }}
              >
                {unit}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: A.textSecondary,
              fontFamily: A.font,
              letterSpacing: '0.04em',
              margin: '30px 0 0 0',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </p>
          {enLabel && (
            <p
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: A.fontEn,
                letterSpacing: '0.08em',
                margin: '8px 0 0 0',
              }}
            >
              {enLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
