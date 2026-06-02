// AppleCTACard — Apple 风格行动号召卡
// 极简 CTA 按钮式设计 + 毛玻璃底 + 慢呼吸弹性
// 复用：Apple 风格结尾 / 联系方式

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, OverlayElementBase } from './animation';

interface AppleCTACardProps extends OverlayElementBase {
  headline: string;
  enHeadline?: string;
  contact?: string;
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

export const AppleCTACard: React.FC<AppleCTACardProps> = ({
  headline,
  enHeadline,
  contact,
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

  const contactSpring = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: { damping: 28, stiffness: 60, mass: 1.2 },
  });
  const contactOpacity = interpolate(contactSpring, [0, 1], [0, 1]);
  const contactY = interpolate(contactSpring, [0, 1], [24, 0]);

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
            borderRadius: 28,
            border: A.border,
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 56px rgba(0,0,0,0.45)',
            opacity: cardOpacity,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: A.text,
              fontFamily: A.font,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {headline}
          </h2>
          {enHeadline && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: A.textSecondary,
                fontFamily: A.fontEn,
                letterSpacing: '0.02em',
                margin: '16px 0 0 0',
              }}
            >
              {enHeadline}
            </p>
          )}

          {contact && (
            <div
              style={{
                marginTop: 40,
                padding: '32px 48px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 18,
                border: '0.5px solid rgba(255,255,255,0.14)',
                opacity: contactOpacity,
                transform: `translateY(${contactY}px)`,
              }}
            >
              {enLabel && (
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: A.fontEn,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    margin: '0 0 10px 0',
                  }}
                >
                  {enLabel}
                </p>
              )}
              <p
                style={{
                  fontSize: 52,
                  fontWeight: 400,
                  color: A.text,
                  fontFamily: A.fontMono,
                  letterSpacing: '0.04em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {contact}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
