// BeforeAfterCard — 改造对比卡 (v1)
// 结构: 标签 → Before面板(灰调/划线) → 分隔线扫过 → After面板(彩色高亮)
// 适用于: 装修前后、改造前后、政策前后、升级前后

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface BeforeAfterSide {
  title: string;
  items: string[];
  enTitle?: string;
}

interface BeforeAfterCardProps extends OverlayElementBase {
  label?: string;
  before: BeforeAfterSide;
  after: BeforeAfterSide;
  color?: string;
  disableBreathing?: boolean;
}

export const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({
  label,
  before,
  after,
  color = '#F5A623',
  disableBreathing = false,
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

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Before panel: 4-16f, always visible ──
  const beforeSpring = spring({ frame: Math.max(0, localFrame - 4), fps, config: { damping: 20, stiffness: 85, mass: 1.1 } });
  const beforeOpacity = isExiting ? interpolate(exitP, [0.2, 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(beforeSpring, [0, 1], [0, 1]);

  // ── Reveal divider: 16-32f sweeps across ──
  const revealProgress = isExiting
    ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(localFrame, [16, 32], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── After panel: revealed after divider passes ──
  const afterSpring = spring({ frame: Math.max(0, localFrame - 20), fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
  const afterOpacity = isExiting ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(afterSpring, [0, 1], [0, 1]);

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  const renderSide = (side: BeforeAfterSide, isBefore: boolean, totalItems: number) => (
    <div style={{ flex: 1, padding: isBefore ? '0 24px 0 0' : '0 0 0 24px', textAlign: isBefore ? 'right' : 'left' }}>
      {/* Title */}
      <div style={{
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: isBefore ? 'rgba(255,255,255,0.05)' : hexToRgba(color, 0.12),
        borderRadius: RADIUS.tag,
        border: `1px solid ${isBefore ? 'rgba(255,255,255,0.1)' : hexToRgba(color, 0.3)}`,
        marginBottom: 12,
      }}>
        <span style={{
          fontSize: 24, fontWeight: 700,
          color: isBefore ? 'rgba(255,255,255,0.45)' : color,
          fontFamily: F.text,
          textDecoration: isBefore ? 'line-through' : 'none',
        }}>
          {isBefore ? 'Before' : 'After'}：{side.title}
        </span>
      </div>

      {side.enTitle && (
        <p style={{ fontSize: enFontSize(24), fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontFamily: F.text, letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
          {side.enTitle}
        </p>
      )}

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {side.items.map((item, ii) => {
          const iDelay = (isBefore ? 8 : 20) + ii * 6;
          const iFrame = Math.max(0, localFrame - iDelay);
          const iOpacity = interpolate(iFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const revI = totalItems - 1 - ii;
          const iExit = isExiting ? interpolate(exitP, [(isBefore ? 1 : 0) * 0.03 + revI * 0.03, (isBefore ? 1 : 0) * 0.03 + revI * 0.03 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

          return (
            <div key={ii} style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              flexDirection: isBefore ? 'row-reverse' : 'row',
              opacity: iOpacity * iExit,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                backgroundColor: isBefore ? 'rgba(255,255,255,0.3)' : color,
                flexShrink: 0, marginTop: 7,
                boxShadow: isBefore ? undefined : `0 0 6px ${hexToRgba(color, 0.5)}`,
              }} />
              <span style={{
                fontSize: 22,
                color: isBefore ? 'rgba(255,255,255,0.4)' : C.textSecondary,
                fontFamily: F.text,
                lineHeight: 1.5,
                textDecoration: isBefore ? 'line-through' : 'none',
              }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const maxItems = Math.max(before.items.length, after.items.length);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <div style={{
        opacity: anim.opacity,
        transform: `translateY(${floatY}px)`,
        maxWidth: posStyle.maxWidth ?? 880,
        width: '100%',
        padding: '36px 36px 32px 44px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.35)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.15)}, 0 0 72px ${hexToRgba(color, 0.05)}, inset 0 1px 0 ${hexToRgba(color, 0.1)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 20px 0', textAlign: 'center', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        {/* Before + After with animated reveal divider */}
        <div style={{ position: 'relative' }}>
          {/* Before panel (always behind, dim) */}
          <div style={{ opacity: beforeOpacity }}>
            {renderSide(before, true, maxItems)}
          </div>

          {/* After panel (revealed via clip-path) */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: `inset(0 ${(100 - revealProgress).toFixed(1)}% 0 0)`,
          }}>
            <div style={{ opacity: afterOpacity }}>
              {renderSide(after, false, maxItems)}
            </div>
          </div>

          {/* Reveal divider line */}
          <div style={{
            position: 'absolute',
            left: `${revealProgress}%`,
            top: 0, bottom: 0,
            width: 3,
            background: `linear-gradient(to bottom, transparent, ${hexToRgba(color, 0.7)} 20%, ${color} 50%, ${hexToRgba(color, 0.7)} 80%, transparent)`,
            boxShadow: `0 0 16px ${hexToRgba(color, 0.5)}`,
            borderRadius: 2,
            opacity: revealProgress > 5 && revealProgress < 95 ? 1 : 0,
          }} />
        </div>
      </div>
    </div>
  );
};
