// QACard — 问答卡 (zhuzige)
// Q: 问句 + A: 答句分层，一问一答节奏
// 复用: 答疑/科普场景 ("港人买房能用港元贷款吗？")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, textDepth, breathingScale, idleFloat, RADIUS, enFontSize, OverlayElementBase, splitByHighlights, HighlightWord, EMPHASIS_CONFIGS, popScaleValue, reservedPadding } from './animation';
import { ICON_MAP } from './iconMap';
interface QACardProps extends OverlayElementBase {
  label?: string;
  icon?: string;
  question: string;
  answer: string;
  enQuestion?: string;
  enAnswer?: string;
  color?: string;
  /** Keywords to highlight in question with kinetic pop animation */
  questionHighlights?: HighlightWord[];
  /** Keywords to highlight in answer with kinetic pop animation */
  answerHighlights?: HighlightWord[];
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

export const QACard: React.FC<QACardProps> = ({
  label, icon, question, answer, enQuestion, enAnswer,
  color = '#1A56DB',
  questionHighlights, answerHighlights,
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

  const qSpring = spring({ frame: localFrame, fps, config: { damping: 28, stiffness: 70, mass: 1.3 } });
  const aSpring = spring({ frame: Math.max(0, localFrame - 20), fps, config: { damping: 26, stiffness: 70, mass: 1.3 } });

  // Exit: A slides down first (reverses entry order), then Q
  const qY = isExiting
    ? interpolate(exitP, [0.3, 0.8], [0, 24], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(qSpring, [0, 1], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aY = isExiting
    ? interpolate(exitP, [0, 0.4], [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(aSpring, [0, 1], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const qOpacity = isExiting
    ? interpolate(exitP, [0.3, 0.7], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : qSpring;
  const aOpacity = isExiting
    ? interpolate(exitP, [0, 0.35], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : aSpring;

  const aBorderAlpha = 0.35;

  // Idle breathing — Q and A float independently (disabled when disableBreathing=true)
  const qFloatY = disableBreathing ? 0 : idleFloat(frame, 1.2, 0.022);
  const aFloatY = disableBreathing ? 0 : idleFloat(frame, 1.0, 0.028);

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
        maxWidth: posStyle.maxWidth ?? 880,
        width: '100%',
        padding: '32px 40px 28px 52px',
        backgroundColor: 'rgba(10,8,6,0.5)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.4)}`,
        boxShadow: `
          0 0 28px ${hexToRgba(color, 0.15)},
          0 0 64px ${hexToRgba(color, 0.05)},
          inset 0 1px 0 ${hexToRgba(color, 0.12)},
          inset 0 -1px 0 rgba(0,0,0,0.25)
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
        {/* Label: 彩色小字标注，统一卡片开头格式 */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textDepth(0.3), margin: '0 0 16px 0',
            opacity: qOpacity, transform: `translateY(${qY}px)`,
          }}>
            {label}
          </p>
        )}
        {icon && ICON_MAP[icon] && (
          <div style={{ marginBottom: 16, opacity: qOpacity, transform: `translateY(${qY}px)` }}>
            {React.createElement(ICON_MAP[icon], { size: 56, color, strokeWidth: 2.5 })}
          </div>
        )}
        {/* Q: 问句 */}
        <div style={{
          opacity: qOpacity, transform: `translateY(${qY + qFloatY}px)`,
          display: 'flex', gap: 18, alignItems: 'flex-start',
          marginBottom: 32,
        }}>
          <span style={{
            fontSize: 44, fontWeight: 900, color, fontFamily: F.display,
            lineHeight: 1,
            textShadow: textDepth(0.3),
          }}>Q</span>
          <div>
            <p style={{ fontSize: 44, fontWeight: 700, color: C.text, fontFamily: F.text, lineHeight: 1.4, margin: 0, transform: `scale(${disableBreathing ? 1 : breathingScale(frame)})` }}>
              {questionHighlights && questionHighlights.length > 0 ? (
                splitByHighlights(question, questionHighlights).map((seg, si) => {
                  if (seg.highlight) {
                    const emphasis = EMPHASIS_CONFIGS[seg.highlight.emphasis ?? 'pop'];
                    const hScale = seg.highlight.scale ?? emphasis.scale;
                    const hDelay = seg.highlight.delay ?? 14;
                    const hColor = seg.highlight.color || color;

                    const popSpring = spring({
                      frame: Math.max(0, localFrame - hDelay),
                      fps,
                      config: emphasis.spring,
                    });
                    const popScale = popScaleValue(popSpring, hScale);

                    const breathingGlow = emphasis === EMPHASIS_CONFIGS.pulse
                      ? emphasis.glow * (1 + Math.sin(frame * 0.06) * 0.3)
                      : emphasis.glow;

                    const exitPopScale = isExiting
                      ? interpolate(exitP, [si * 0.04, si * 0.04 + 0.1], [popScale, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                      : popScale;

                    return (
                      <span key={si} style={{
                        color: hColor,
                        transform: `scale(${exitPopScale})`,
                        display: 'inline-block',
                        padding: reservedPadding(hScale),
                        fontWeight: emphasis.weight ?? undefined,
                        textShadow: `${textDepth(0.3)}, 0 0 14px ${hexToRgba(hColor, 0.4 * breathingGlow * (isExiting ? 1 - exitP : 1))}`,
                      }}>
                        {seg.text}
                      </span>
                    );
                  }
                  return <span key={si} style={{ color: C.textSecondary }}>{seg.text}</span>;
                })
              ) : question}
            </p>
            {enQuestion && <p style={{ fontSize: enFontSize(36), fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '8px 0 0 0' }}>{enQuestion}</p>}
          </div>
        </div>

        {/* A: 答句 */}
        <div style={{
          opacity: aOpacity, transform: `translateY(${aY + aFloatY}px)`,
          display: 'flex', gap: 18, alignItems: 'flex-start',
          padding: '28px 32px',
          backgroundColor: 'transparent',
          borderRadius: RADIUS.card,
          border: `1px solid ${hexToRgba(color, aBorderAlpha)}`,
        }}>
          <span style={{
            fontSize: 44, fontWeight: 900, color, fontFamily: F.display,
            lineHeight: 1, textShadow: textDepth(0.3),
          }}>A</span>
          <div>
            <p style={{ fontSize: 36, fontWeight: 500, color: C.text, fontFamily: F.text, lineHeight: 1.55, margin: 0, transform: `scale(${disableBreathing ? 1 : breathingScale(frame)})` }}>
              {answerHighlights && answerHighlights.length > 0 ? (
                splitByHighlights(answer, answerHighlights).map((seg, si) => {
                  if (seg.highlight) {
                    const emphasis = EMPHASIS_CONFIGS[seg.highlight.emphasis ?? 'pop'];
                    const hScale = seg.highlight.scale ?? emphasis.scale;
                    const hDelay = seg.highlight.delay ?? 14;
                    const hColor = seg.highlight.color || color;

                    const popSpring = spring({
                      frame: Math.max(0, localFrame - 20 - hDelay),
                      fps,
                      config: emphasis.spring,
                    });
                    const popScale = popScaleValue(popSpring, hScale);

                    const breathingGlow = emphasis === EMPHASIS_CONFIGS.pulse
                      ? emphasis.glow * (1 + Math.sin(frame * 0.06) * 0.3)
                      : emphasis.glow;

                    const exitPopScale = isExiting
                      ? interpolate(exitP, [si * 0.03, si * 0.03 + 0.08], [popScale, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                      : popScale;

                    return (
                      <span key={si} style={{
                        color: hColor,
                        transform: `scale(${exitPopScale})`,
                        display: 'inline-block',
                        padding: reservedPadding(hScale),
                        fontWeight: emphasis.weight ?? undefined,
                        textShadow: `${textDepth(0.2)}, 0 0 12px ${hexToRgba(hColor, 0.35 * breathingGlow * (isExiting ? 1 - exitP : 1))}`,
                      }}>
                        {seg.text}
                      </span>
                    );
                  }
                  return <span key={si} style={{ color: C.textSecondary }}>{seg.text}</span>;
                })
              ) : answer}
            </p>
            {enAnswer && <p style={{ fontSize: enFontSize(28), fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '8px 0 0 0' }}>{enAnswer}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
