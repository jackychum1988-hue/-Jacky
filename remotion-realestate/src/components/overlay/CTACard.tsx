// CTACard — GlassCard + WhatsApp 联系卡 (zhuzige)
// v15: Full animation upgrade — icon bounce, title entrance, contact staging, exit choreography

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, textDepth, breathingScale, idleFloat, RADIUS, OverlayElementBase } from './animation';
import { GlassCard } from '../new/GlassCard';
import { ICON_MAP } from './iconMap';

interface CTACardProps extends OverlayElementBase {
  icon?: string;
  headline: string;
  enHeadline?: string;
  contact: string;
  enLabel?: string;
  color?: string;
  tags?: string[];
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

export const CTACard: React.FC<CTACardProps> = ({
  icon, headline,
  enHeadline,
  contact,
  enLabel,
  color = '#F5A623',
  tags,
  disableBreathing = false,
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

  // Icon bounce — frame 0, matches HookCard timing
  const iconSpring = spring({
    frame: Math.max(0, localFrame - 2),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });
  const iconScale = isExiting
    ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(iconSpring, [0, 1], [0, 1.2]);
  const iconFinalScale = isExiting ? iconScale : (iconScale > 1 ? 1 + (iconScale - 1) * 0.3 : iconScale);

  // Title entrance — frame 8, letter-spacing breath + fade
  const titleSpring = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });
  const titleLetterSpacing = isExiting
    ? interpolate(exitP, [0.3, 0.7], [-0.02, 0.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(titleSpring, [0, 1], [0.06, -0.02]);
  const titleOpacity = isExiting
    ? interpolate(exitP, [0.3, 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(titleSpring, [0, 1], [0, 1]);

  // Contact card — frame 20 (was 24), scale + fade entrance
  const contactSpring = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });
  const contactOpacity = isExiting
    ? interpolate(exitP, [0.1, 0.45], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(localFrame - 20, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contactScale = isExiting
    ? interpolate(exitP, [0, 0.4], [1, 0.93], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : (0.93 + contactSpring * 0.07);

  // Tags — frame 28, fade entrance
  const tagsOpacity = isExiting
    ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(localFrame - 28, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Phone number breathing — uses localFrame for consistent phase
  const phoneBreathing = 1 + Math.sin(localFrame * 0.1) * 0.025;

  // Idle floating + container breathing
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.2, 0.026);
  const cardBreath = disableBreathing ? 1 : breathingScale(frame);

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
        overflow: 'hidden',
      }}
    >
      <div style={{ opacity: anim.opacity, maxWidth: posStyle.maxWidth, width: '100%', transform: `translateY(${floatY}px)` }}>
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={0.2}
          transparentBg
          disableEntryAnimation
          padding="36px 48px"
          borderRadius={16}
          maxWidth={880}
        >
          {/* Icon with bounce (matches HookCard style) */}
          {icon && ICON_MAP[icon] && (
            <div style={{
              marginBottom: 16, textAlign: 'center',
              opacity: isExiting ? interpolate(exitP, [0.5, 0.8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : iconSpring,
              transform: `scale(${iconFinalScale})`,
            }}>
              {React.createElement(ICON_MAP[icon], { size: 56, color, strokeWidth: 2.5 })}
            </div>
          )}
          {/* Title with letter-spacing breath + entrance fade */}
          <h2
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: C.text,
              fontFamily: F.display,
              lineHeight: 1.3,
              letterSpacing: `${titleLetterSpacing.toFixed(3)}em`,
              textShadow: textDepth(0.4),
              margin: 0,
              opacity: titleOpacity,
              transform: `scale(${disableBreathing ? 1 : breathingScale(frame)})`,
            }}
          >
            {headline}
          </h2>
          {enHeadline && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '10px 0 0 0',
                opacity: titleOpacity,
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
            borderRadius: RADIUS.contact,
            border: `1px solid ${hexToRgba(color, 0.20)}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            opacity: contactOpacity,
            transform: `scale(${contactScale * cardBreath})`,
          }}
        >
          {enLabel && (
            <p
              style={{
                fontSize: 22,
                fontFamily: F.text,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
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
              transform: `scale(${phoneBreathing})`,
              textShadow: textDepth(0.35),
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
              opacity: tagsOpacity,
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
