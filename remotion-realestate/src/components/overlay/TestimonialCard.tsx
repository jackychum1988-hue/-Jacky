// TestimonialCard — 引用证言卡 (zhuzige)
// v11: Full animation upgrade — Apple springs, idle breathing, exit choreography, staggered entrance
// 大引号 + 引用文字 + 署名

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, textDepth, breathingScale, idleFloat, enFontSize, OverlayElementBase } from './animation';

interface TestimonialCardProps extends OverlayElementBase {
  quote: string;
  enQuote?: string;
  name: string;
  enName?: string;
  role?: string;
  enRole?: string;
  color?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote, enQuote, name, enName, role, enRole,
  color = '#F5A623',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  // ── Apple breathing springs ──
  // Quote mark: enters first, big impact
  const quoteMarkSpring = spring({
    frame: localFrame, fps,
    config: { damping: 26, stiffness: 70, mass: 1.2 },
  });
  const quoteMarkScale = isExiting
    ? interpolate(exitP, [0.35, 0.7], [1, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(quoteMarkSpring, [0, 1], [0.6, 1]);
  const quoteMarkOpacity = isExiting
    ? interpolate(exitP, [0.3, 0.65], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : quoteMarkSpring;

  // Quote text: enters 6f after mark
  const quoteSpring = spring({
    frame: Math.max(0, localFrame - 6), fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });
  const quoteY = isExiting
    ? interpolate(exitP, [0.15, 0.5], [0, 24], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(quoteSpring, [0, 1], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const quoteOpacity = isExiting
    ? interpolate(exitP, [0.15, 0.45], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : quoteSpring;

  // Name section: enters 16f after container, exits last
  const nameSpring = spring({
    frame: Math.max(0, localFrame - 16), fps,
    config: { damping: 30, stiffness: 65, mass: 1.5 },
  });
  const nameOpacity = isExiting
    ? interpolate(exitP, [0.5, 0.8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : nameSpring;
  const nameX = isExiting
    ? interpolate(exitP, [0.5, 0.8], [0, 16], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(nameSpring, [0, 1], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Left border draw-in (height expand on entry, collapse on exit)
  const borderSpring = spring({
    frame: Math.max(0, localFrame - 18), fps,
    config: { damping: 30, stiffness: 65, mass: 1.5 },
  });
  const borderHeight = isExiting
    ? interpolate(exitP, [0.55, 0.85], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(borderSpring, [0, 1], [0, 100]);

  // ── Idle breathing ──
  const floatY = idleFloat(frame, 1.4, 0.025);
  const quoteBreath = breathingScale(frame);

  // Quote mark glow breathing
  const markGlow = 1 + Math.sin(frame * 0.045) * 0.12;

  const enSize = enFontSize(28);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        opacity: anim.opacity,
        maxWidth: posStyle.maxWidth,
        width: '100%',
        transform: `translateY(${floatY}px)`,
      }}>
        {/* 大引号 — enters with scale bounce */}
        <div style={{
          opacity: quoteMarkOpacity,
          transform: `scale(${quoteMarkScale})`,
          fontSize: 96, fontWeight: 900, color, fontFamily: F.display,
          lineHeight: 0.7, marginBottom: 8,
          textShadow: `0 0 ${Math.round(32 * markGlow)}px ${hexToRgba(color, 0.4 * markGlow)}, 0 0 ${Math.round(64 * markGlow)}px ${hexToRgba(color, 0.15 * markGlow)}`,
        }}>
          &ldquo;
        </div>

        {/* 引用文字 — slide-up + idle scale breathing */}
        <p style={{
          opacity: quoteOpacity, transform: `translateY(${quoteY}px) scale(${quoteBreath})`,
          fontSize: 36, fontWeight: 500, color: C.text, fontFamily: F.text,
          fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px 0',
          textShadow: `0 0 20px ${hexToRgba(color, 0.2)}`,
          paddingLeft: 8,
        }}>
          {quote}
        </p>

        {enQuote && (
          <p style={{
            opacity: quoteOpacity, transform: `translateY(${quoteY}px)`,
            fontSize: enFontSize(36), fontWeight: 400, color: 'rgba(255,255,255,0.5)',
            fontFamily: F.text, fontStyle: 'italic',
            letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 24px 0',
            paddingLeft: 8,
          }}>
            {enQuote}
          </p>
        )}

        {/* 署名 — slide-in + border draw */}
        <div style={{
          opacity: nameOpacity,
          transform: `translateX(${nameX}px)`,
          display: 'flex', alignItems: 'baseline', gap: 12,
          paddingLeft: 8,
          position: 'relative',
        }}>
          {/* Animated left border */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: 3,
            height: `${borderHeight}%`,
            backgroundColor: hexToRgba(color, 0.5),
            borderRadius: 2,
          }} />
          <span style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: F.text, textShadow: textDepth(0.2) }}>{name}</span>
          {enName && <span style={{ fontSize: enSize, fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em' }}>{enName}</span>}
          {role && <span style={{ fontSize: 24, fontWeight: 400, color: C.textSecondary, fontFamily: F.text }}>{role}</span>}
          {enRole && <span style={{ fontSize: enFontSize(24), fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em' }}>{enRole}</span>}
        </div>
      </div>
    </div>
  );
};
