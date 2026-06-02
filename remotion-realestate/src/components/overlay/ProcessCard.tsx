// ProcessCard — 流程步骤进度卡 (zhuzige)
// 左侧连线 + 状态标记 + 右侧标签，展示买房/操作流程
// 复用: 流程引导场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';

interface ProcessStep {
  label: string;
  enLabel?: string;
  status: 'done' | 'active' | 'pending';
}

interface ProcessCardProps extends OverlayElementBase {
  steps: ProcessStep[];
  title?: string;
  enTitle?: string;
  color?: string;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  steps,
  title,
  enTitle,
  color = '#1A56DB',
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
      <div style={{ opacity: anim.opacity, width: '90%', maxWidth: 880 }}>
        {title && (
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: C.text,
              fontFamily: F.display,
              lineHeight: 1.2,
              margin: '0 0 6px 0',
              textShadow: `0 0 24px ${hexToRgba(color, 0.4)}`,
            }}
          >
            {title}
          </h2>
        )}
        {enTitle && (
          <p
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              margin: '0 0 32px 0',
            }}
          >
            {enTitle}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => {
            const localFrame = Math.max(0, frame - enterAt - i * 12);
            const s = spring({
              frame: localFrame,
              fps,
              config: { damping: 20, stiffness: 90, mass: 1.0 },
            });
            const slideX = interpolate(s, [0, 1], [60, 0]);
            const itemOpacity = interpolate(s, [0, 1], [0, 1]);

            const isLast = i === steps.length - 1;
            const isDone = step.status === 'done';
            const isActive = step.status === 'active';
            const stepColor = isDone ? '#10B981' : isActive ? color : 'rgba(255,255,255,0.15)';
            const textColor = isDone || isActive ? C.text : 'rgba(255,255,255,0.35)';

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 0,
                  opacity: itemOpacity,
                  transform: `translateX(${slideX}px)`,
                }}
              >
                {/* 左侧：圆圈 + 连线 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 48,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isDone
                        ? hexToRgba('#10B981', 0.3)
                        : isActive
                        ? hexToRgba(color, 0.3)
                        : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${stepColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: stepColor,
                      fontFamily: F.mono,
                      boxShadow: isActive
                        ? `0 0 16px ${hexToRgba(color, 0.5)}`
                        : 'none',
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 40,
                        backgroundColor:
                          isDone ? hexToRgba('#10B981', 0.4) : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  )}
                </div>

                {/* 右侧：标签 */}
                <div
                  style={{
                    paddingBottom: isLast ? 0 : 32,
                    paddingLeft: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: isActive ? 700 : 500,
                      color: textColor,
                      fontFamily: F.text,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.label}
                  </span>
                  {step.enLabel && (
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: F.text,
                        letterSpacing: '0.1em',
                        marginTop: 4,
                      }}
                    >
                      {step.enLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
