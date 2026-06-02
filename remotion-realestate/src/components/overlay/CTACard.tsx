// CTACard — GlassCard + WhatsApp 联系卡 (zhuzige)
// 上: GlassCard 标题 / 下: WhatsApp 号码卡 + 标签
// 复用: CTA 场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, textGlow, breathingScale, OverlayElementBase } from './animation';
import { GlassCard } from '../new/GlassCard';
import { ColoredAmbience } from './ColoredAmbience';

interface CTACardProps extends OverlayElementBase {
  headline: string;
  enHeadline?: string;
  contact: string;
  enLabel?: string;
  color?: string;
  tags?: string[];
}

export const CTACard: React.FC<CTACardProps> = ({
  headline,
  enHeadline,
  contact,
  enLabel,
  color = '#F5A623',
  tags,
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
  const contactSpring = spring({
    frame: Math.max(0, localFrame - 24),
    fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });
  const contactOpacity = interpolate(localFrame - 24, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const TS = '0 2px 10px rgba(0,0,0,0.5)';

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
      <div style={{ opacity: anim.opacity, maxWidth: 880 }}>
        <ColoredAmbience color={color} />
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={0.2}
          transparentBg
          padding="36px 48px"
          borderRadius={16}
          maxWidth={880}
        >
          <h2
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: C.text,
              fontFamily: F.display,
              lineHeight: 1.3,
              textShadow: textGlow(color, 0.4),
              margin: 0,
              transform: `scale(${breathingScale(frame)})`,
            }}
          >
            {headline}
          </h2>
          {enHeadline && (
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
              {enHeadline}
            </p>
          )}
        </GlassCard>

        <div
          style={{
            marginTop: 32,
            padding: '36px 56px',
            backgroundColor: 'transparent',
            borderRadius: 16,
            border: `2.5px solid ${hexToRgba(color, 0.7)}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            opacity: contactOpacity,
            transform: `scale(${0.93 + contactSpring * 0.07})`,
          }}
        >
          {enLabel && (
            <p
              style={{
                fontSize: 22,
                fontFamily: F.text,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                marginBottom: 12,
                textShadow: TS,
              }}
            >
              {enLabel}
            </p>
          )}
          <p
            style={{
              fontSize: 60,
              fontFamily: F.mono,
              fontWeight: 700,
              color: C.text,
              letterSpacing: '0.05em',
              transform: `scale(${1 + Math.sin(frame * 0.1) * 0.025})`,
              textShadow: textGlow(color, 0.35),
              margin: 0,
            }}
          >
            {contact}
          </p>
        </div>

        {tags && tags.length > 0 && (
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              opacity: interpolate(frame - enterAt - 30, [0, 15], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {tags.map((tag, ti) => (
              <span
                key={ti}
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: C.textTertiary,
                  fontFamily: F.text,
                  padding: '8px 18px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
