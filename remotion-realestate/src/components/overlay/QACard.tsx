// QACard — 问答卡 (zhuzige)
// Q: 问句 + A: 答句分层，一问一答节奏
// 复用: 答疑/科普场景 ("港人买房能用港元贷款吗？")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, textGlow, breathingScale, enFontSize, OverlayElementBase } from './animation';
import { ColoredAmbience } from './ColoredAmbience';

interface QACardProps extends OverlayElementBase {
  label?: string;
  question: string;
  answer: string;
  enQuestion?: string;
  enAnswer?: string;
  color?: string;
}

export const QACard: React.FC<QACardProps> = ({
  label, question, answer, enQuestion, enAnswer,
  color = '#1A56DB',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);

  const qSpring = spring({ frame: localFrame, fps, config: { damping: 28, stiffness: 70, mass: 1.3 } });
  const aSpring = spring({ frame: Math.max(0, localFrame - 20), fps, config: { damping: 26, stiffness: 70, mass: 1.3 } });

  const qY = interpolate(qSpring, [0, 1], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aY = interpolate(aSpring, [0, 1], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, maxWidth: 880 }}>
        <ColoredAmbience color={color} />
        {/* Label: 彩色小字标注，统一卡片开头格式 */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textGlow(color, 0.3), margin: '0 0 16px 0',
            opacity: qSpring, transform: `translateY(${qY}px)`,
          }}>
            {label}
          </p>
        )}
        {/* Q: 问句 */}
        <div style={{
          opacity: qSpring, transform: `translateY(${qY}px)`,
          display: 'flex', gap: 18, alignItems: 'flex-start',
          marginBottom: 32,
        }}>
          <span style={{
            fontSize: 44, fontWeight: 900, color, fontFamily: F.display,
            lineHeight: 1, textShadow: textGlow(color, 0.3),
          }}>Q</span>
          <div>
            <p style={{ fontSize: 36, fontWeight: 700, color: C.text, fontFamily: F.text, lineHeight: 1.4, margin: 0, transform: `scale(${breathingScale(frame)})` }}>{question}</p>
            {enQuestion && <p style={{ fontSize: enFontSize(36), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '8px 0 0 0' }}>{enQuestion}</p>}
          </div>
        </div>

        {/* A: 答句 */}
        <div style={{
          opacity: aSpring, transform: `translateY(${aY}px)`,
          display: 'flex', gap: 18, alignItems: 'flex-start',
          padding: '28px 32px',
          backgroundColor: 'transparent',
          borderRadius: 14,
          border: `1px solid ${hexToRgba(color, 0.25)}`,
        }}>
          <span style={{
            fontSize: 44, fontWeight: 900, color: '#10B981', fontFamily: F.display,
            lineHeight: 1, textShadow: textGlow('#10B981', 0.3),
          }}>A</span>
          <div>
            <p style={{ fontSize: 28, fontWeight: 500, color: C.text, fontFamily: F.text, lineHeight: 1.55, margin: 0 }}>{answer}</p>
            {enAnswer && <p style={{ fontSize: enFontSize(28), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '8px 0 0 0' }}>{enAnswer}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
