// TestimonialCard — 引用证言卡 (zhuzige)
// 大引号 + 倾斜引用文字 + 署名
// 复用: 客户证言/案例场景 ("上个月陈生买了，他说...")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, enFontSize, OverlayElementBase } from './animation';

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

  const quoteSpring = spring({ frame: localFrame, fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  const nameSpring = spring({ frame: Math.max(0, localFrame - 12), fps, config: { damping: 18, stiffness: 100, mass: 0.7 } });

  const quoteY = interpolate(quoteSpring, [0, 1], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const enSize = enFontSize(28);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, maxWidth: 880 }}>
        {/* 大引号 */}
        <div style={{
          opacity: quoteSpring, transform: `translateY(${quoteY}px)`,
          fontSize: 96, fontWeight: 900, color, fontFamily: F.display,
          lineHeight: 0.7, marginBottom: 8,
          textShadow: `0 0 32px ${hexToRgba(color, 0.4)}`,
        }}>
          &ldquo;
        </div>

        {/* 引用文字 */}
        <p style={{
          opacity: quoteSpring, transform: `translateY(${quoteY}px)`,
          fontSize: 36, fontWeight: 500, color: C.text, fontFamily: F.text,
          fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px 0',
          textShadow: `0 0 20px ${hexToRgba(color, 0.25)}`,
          paddingLeft: 8,
        }}>
          {quote}
        </p>

        {enQuote && (
          <p style={{
            opacity: quoteSpring, transform: `translateY(${quoteY}px)`,
            fontSize: enFontSize(36), fontWeight: 400, color: 'rgba(255,255,255,0.6)',
            fontFamily: F.text, fontStyle: 'italic',
            letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 24px 0',
            paddingLeft: 8,
          }}>
            {enQuote}
          </p>
        )}

        {/* 署名 */}
        <div style={{
          opacity: nameSpring,
          transform: `scale(${0.9 + nameSpring * 0.1})`,
          display: 'flex', alignItems: 'baseline', gap: 12,
          paddingLeft: 8,
          borderLeft: `3px solid ${hexToRgba(color, 0.6)}`,
        }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: F.text }}>{name}</span>
          {enName && <span style={{ fontSize: enSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em' }}>{enName}</span>}
          {role && <span style={{ fontSize: 24, fontWeight: 400, color: C.textSecondary, fontFamily: F.text }}>{role}</span>}
          {enRole && <span style={{ fontSize: enFontSize(24), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em' }}>{enRole}</span>}
        </div>
      </div>
    </div>
  );
};
