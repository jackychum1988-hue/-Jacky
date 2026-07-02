// RedBlackCard — 红黑榜卡 (v1)
// 结构: 标签 → 左面板(绿/推荐) vs 右面板(红/避开) + 中间竖线
// 适用于: 推荐vs不推荐、值得买vs避开、优缺点对比

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface RedBlackSide {
  label: string;
  items: string[];
  enLabel?: string;
}

interface RedBlackCardProps extends OverlayElementBase {
  label?: string;
  good: RedBlackSide;
  bad: RedBlackSide;
  goodColor?: string;
  badColor?: string;
  disableBreathing?: boolean;
}

export const RedBlackCard: React.FC<RedBlackCardProps> = ({
  label,
  good,
  bad,
  goodColor = '#10B981',
  badColor = '#FF4136',
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

  // ── Left panel: 4-16f slide from left ──
  const leftSpring = spring({ frame: Math.max(0, localFrame - 4), fps, config: { damping: 20, stiffness: 85, mass: 1.1 } });
  const leftX = isExiting ? interpolate(exitP, [0.1, 0.5], [0, -100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(leftSpring, [0, 1], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leftOpacity = isExiting ? interpolate(exitP, [0.1, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(leftSpring, [0, 1], [0, 1]);

  // ── Right panel: 16-28f slide from right ──
  const rightSpring = spring({ frame: Math.max(0, localFrame - 16), fps, config: { damping: 18, stiffness: 90, mass: 1.0 } });
  const rightX = isExiting ? interpolate(exitP, [0, 0.35], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(rightSpring, [0, 1], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightOpacity = isExiting ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(rightSpring, [0, 1], [0, 1]);

  // ── Divider: 10-22f draw ──
  const divSpring = spring({ frame: Math.max(0, localFrame - 10), fps, config: { damping: 12, stiffness: 130, mass: 0.6 } });
  const divHeight = isExiting ? interpolate(exitP, [0, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(divSpring, [0, 1], [0, 1]);

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  const renderSide = (side: RedBlackSide, sideColor: string, isGood: boolean) => {
    const panelX = isGood ? leftX : rightX;
    const panelOpacity = isGood ? leftOpacity : rightOpacity;

    return (
      <div style={{
        flex: 1,
        transform: `translateX(${panelX}px)`,
        opacity: panelOpacity,
        padding: isGood ? '0 24px 0 0' : '0 0 0 24px',
        textAlign: isGood ? 'right' : 'left',
      }}>
        {/* Header badge */}
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          backgroundColor: hexToRgba(sideColor, 0.12),
          borderRadius: RADIUS.tag,
          border: `1px solid ${hexToRgba(sideColor, 0.3)}`,
          marginBottom: 16,
        }}>
          <span style={{
            fontSize: 24, fontWeight: 700, color: sideColor,
            fontFamily: F.text, letterSpacing: '0.06em',
          }}>
            {isGood ? '✅ ' : '❌ '}{side.label}
          </span>
        </div>

        {side.enLabel && (
          <p style={{ fontSize: enFontSize(24), fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
            {side.enLabel}
          </p>
        )}

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {side.items.map((item, ii) => {
            const iDelay = (isGood ? 8 : 20) + ii * 6;
            const iFrame = Math.max(0, localFrame - iDelay);
            const iOpacity = interpolate(iFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const revI = side.items.length - 1 - ii;
            const iExit = isExiting ? interpolate(exitP, [(isGood ? 1 : 0) * 0.03 + revI * 0.03, (isGood ? 1 : 0) * 0.03 + revI * 0.03 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

            return (
              <div key={ii} style={{
                display: 'flex', alignItems: 'baseline', gap: 8,
                flexDirection: isGood ? 'row-reverse' : 'row',
                opacity: iOpacity * iExit,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  backgroundColor: sideColor, flexShrink: 0, marginTop: 7,
                  boxShadow: `0 0 6px ${hexToRgba(sideColor, 0.5)}`,
                }} />
                <span style={{ fontSize: 22, color: C.textSecondary, fontFamily: F.text, lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
        border: `1.5px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 0 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color: C.text, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 20px 0', textAlign: 'center', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        {/* Panels + Divider */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Left (Good) */}
          {renderSide(good, goodColor, true)}

          {/* Divider */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: 20, flexShrink: 0,
            justifyContent: 'center',
          }}>
            <div style={{
              width: 2,
              height: `${divHeight * 100}%`,
              background: `linear-gradient(to bottom, ${hexToRgba(goodColor, 0.5)}, ${hexToRgba(badColor, 0.3)}, ${hexToRgba(badColor, 0.5)})`,
              borderRadius: 1,
            }} />
          </div>

          {/* Right (Bad) */}
          {renderSide(bad, badColor, false)}
        </div>
      </div>
    </div>
  );
};
