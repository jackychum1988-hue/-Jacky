// ScoreCard — 标签打分卡 (v1)
// 结构: 标签 → 多行评分（图标 + 维度名 + 评分条 + 数值）
// 适用于: 楼盘评分、产品测评、多维度对比

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';
import { ICON_MAP } from './iconMap';

interface ScoreItem {
  name: string;
  score: number; // 0-10
  maxScore?: number; // default 10
  enName?: string;
  icon?: string;
}

interface ScoreCardProps extends OverlayElementBase {
  label?: string;
  scores: ScoreItem[];
  color?: string;
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  scores,
  color = '#10B981',
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

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Color helper based on score
  const scoreColor = (s: number): string => {
    if (s >= 8) return V_SCORE.high;
    if (s >= 5) return V_SCORE.mid;
    return V_SCORE.low;
  };
  const V_SCORE = { high: '#10B981', mid: '#F5A623', low: '#FF4136' };

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
        padding: '36px 44px 32px 52px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `
          0 0 32px ${hexToRgba(color, 0.18)},
          0 0 72px ${hexToRgba(color, 0.06)},
          inset 0 1px 0 ${hexToRgba(color, 0.15)},
          inset 0 -1px 0 rgba(0,0,0,0.3)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Left accent bar */}
        <div style={{
          position: 'absolute',
          left: 0, top: 9, bottom: 9,
          width: 5, borderRadius: '0 9px 9px 0',
          backgroundColor: color,
          boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}, 0 0 18px ${hexToRgba(color, 0.2)}`,
        }} />

        {/* Label */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textDepth(0.3), margin: '0 0 24px 0',
            opacity: labelOpacity * labelExit,
          }}>
            {label}
          </p>
        )}

        {/* Score rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {scores.map((item, si) => {
            const rowDelay = 6 + si * 8;
            const rowFrame = Math.max(0, localFrame - rowDelay);
            const rowSpring = spring({ frame: rowFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
            const rowOpacity = isExiting
              ? interpolate(exitP, [(scores.length - 1 - si) * 0.04, (scores.length - 1 - si) * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(rowSpring, [0, 1], [0, 1]);
            const rowSlideX = isExiting
              ? interpolate(exitP, [(scores.length - 1 - si) * 0.04, (scores.length - 1 - si) * 0.04 + 0.2], [0, -30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(rowSpring, [0, 1], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            // Bar animation (delayed 4f after row appears)
            const barDelay = rowDelay + 4;
            const barFrame = Math.max(0, localFrame - barDelay);
            const barSpringVal = spring({ frame: barFrame, fps, config: { damping: 12, stiffness: 100, mass: 0.8 } });
            const maxScore = item.maxScore ?? 10;
            const barPercent = (item.score / maxScore) * 100;
            const barWidth = isExiting
              ? interpolate(exitP, [(scores.length - 1 - si) * 0.03, (scores.length - 1 - si) * 0.03 + 0.18], [barPercent, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(barSpringVal, [0, 1], [0, barPercent]);

            // Count-up number
            const countDelay = barDelay + 2;
            const countFrame = Math.max(0, localFrame - countDelay);
            const countSpring = spring({ frame: countFrame, fps, config: { damping: 10, stiffness: 80, mass: 0.6 } });
            const displayScore = isExiting
              ? interpolate(exitP, [0, 0.3], [item.score, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(countSpring, [0, 1], [0, item.score]);

            const sColor = scoreColor(item.score);

            return (
              <div key={si} style={{
                opacity: rowOpacity,
                transform: `translateX(${rowSlideX}px)`,
              }}>
                {/* Name + icon row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {item.icon && ICON_MAP[item.icon] && (
                    <div style={{ opacity: 1 }}>
                      {React.createElement(ICON_MAP[item.icon], { size: 28, color: sColor, strokeWidth: 2 })}
                    </div>
                  )}
                  <span style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: C.text,
                    fontFamily: F.text,
                    lineHeight: 1.2,
                    flex: 1,
                    textShadow: textDepth(0.15),
                  }}>
                    {item.name}
                  </span>
                  {item.enName && (
                    <span style={{
                      fontSize: 20,
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: F.text,
                      letterSpacing: '0.1em',
                    }}>
                      {item.enName}
                    </span>
                  )}
                  {/* Numeric score */}
                  <span style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: sColor,
                    fontFamily: F.mono,
                    minWidth: 40,
                    textAlign: 'right',
                    textShadow: `0 0 12px ${hexToRgba(sColor, 0.4)}`,
                  }}>
                    {displayScore.toFixed(1)}
                  </span>
                </div>

                {/* Score bar */}
                <div style={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    borderRadius: 5,
                    background: `linear-gradient(to right, ${hexToRgba(sColor, 0.5)}, ${sColor})`,
                    boxShadow: `0 0 16px ${hexToRgba(sColor, 0.5)}`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
