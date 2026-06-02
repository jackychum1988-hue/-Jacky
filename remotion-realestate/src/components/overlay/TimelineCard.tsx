// TimelineCard — 纵向步骤条 (zhuzige)
// 左侧序号圆圈 + 连接线 + 右侧文字
// 复用: 流程/步骤场景 ("买房五步", "看房必查")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, enFontSize, OverlayElementBase } from './animation';

interface Step {
  label: string;
  enLabel?: string;
  desc?: string;
  enDesc?: string;
}

interface TimelineCardProps extends OverlayElementBase {
  title?: string;
  enTitle?: string;
  steps: Step[];
  color?: string;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  title, enTitle, steps,
  color = '#1A56DB',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);
  const enTSize = enFontSize(28);
  const enDSize = enFontSize(24);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, maxWidth: 880 }}>
        {title && (
          <h2 style={{ fontSize: 44, fontWeight: 800, color, fontFamily: F.display, lineHeight: 1.2, margin: '0 0 8px 0', textShadow: `0 0 24px ${hexToRgba(color, 0.4)}` }}>{title}</h2>
        )}
        {enTitle && (
          <p style={{ fontSize: enFontSize(44), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 32px 0' }}>{enTitle}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => {
            const delay = i * 8;
            const stepFrame = Math.max(0, localFrame - delay);
            const stepSpring = spring({ frame: stepFrame, fps, config: { damping: 18, stiffness: 100, mass: 0.9 } });
            const stepX = interpolate(stepSpring, [0, 1], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const stepOpacity = interpolate(stepFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const isLast = i === steps.length - 1;

            return (
              <div key={i} style={{ display: 'flex', gap: 24, opacity: stepOpacity, transform: `translateX(${stepX}px)` }}>
                {/* 左侧：圆圈 + 连接线 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 48 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    backgroundColor: hexToRgba(color, 0.25),
                    border: `2px solid ${hexToRgba(color, 0.6)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 16px ${hexToRgba(color, 0.3)}`,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F.mono }}>{i + 1}</span>
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 40,
                      backgroundColor: hexToRgba(color, 0.4),
                      boxShadow: `0 0 6px ${hexToRgba(color, 0.2)}`,
                    }} />
                  )}
                </div>

                {/* 右侧：文字 */}
                <div style={{ paddingBottom: isLast ? 0 : 32, flex: 1 }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: F.text, margin: '0 0 4px 0', lineHeight: 1.3 }}>{step.label}</p>
                  {step.enLabel && <p style={{ fontSize: enTSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 6px 0' }}>{step.enLabel}</p>}
                  {step.desc && <p style={{ fontSize: 24, fontWeight: 400, color: C.textSecondary, fontFamily: F.text, lineHeight: 1.5, margin: 0 }}>{step.desc}</p>}
                  {step.enDesc && <p style={{ fontSize: enDSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '4px 0 0 0' }}>{step.enDesc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
