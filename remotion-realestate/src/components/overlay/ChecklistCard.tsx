// ChecklistCard — 清单勾选卡 (zhuzige)
// 标题 + 逐条 checkbox 列表 + 入场时依次勾出动效
// 复用: 清单/注意事项场景 ("看房必查5样")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, textGlow, breathingScale, enFontSize, OverlayElementBase } from './animation';

interface ChecklistItem {
  label: string;
  enLabel?: string;
}

interface ChecklistCardProps extends OverlayElementBase {
  label?: string;
  title?: string;
  enTitle?: string;
  items: ChecklistItem[];
  color?: string;
}

// SVG checkmark icon rendered inline
const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChecklistCard: React.FC<ChecklistCardProps> = ({
  label, title, enTitle, items,
  color = '#10B981',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);
  const enTSize = enFontSize(28);
  const enISize = enFontSize(26);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, maxWidth: 880 }}>
        {/* Label: 彩色小字标注 */}
        {label && (
          <p style={{ fontSize: 30, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', lineHeight: 1.3, textShadow: textGlow(color, 0.3), margin: '0 0 12px 0' }}>{label}</p>
        )}
        {title && (
          <h2 style={{ fontSize: 44, fontWeight: 800, color, fontFamily: F.display, lineHeight: 1.2, margin: '0 0 8px 0', textShadow: textGlow(color, 0.25), transform: `scale(${breathingScale(frame)})` }}>{title}</h2>
        )}
        {enTitle && (
          <p style={{ fontSize: enFontSize(44), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 28px 0' }}>{enTitle}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {items.map((item, i) => {
            const delay = i * 10;
            const itemFrame = Math.max(0, localFrame - delay);
            const itemSpring = spring({ frame: itemFrame, fps, config: { damping: 30, stiffness: 70, mass: 1.3 } });
            const itemX = interpolate(itemSpring, [0, 1], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const itemOpacity = interpolate(itemFrame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            // Checkmark draw: appears after item slide-in
            const checkFrame = Math.max(0, localFrame - delay - 12);
            const checkProgress = spring({ frame: checkFrame, fps, config: { damping: 26, stiffness: 70, mass: 1.3 } });

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 20,
                opacity: itemOpacity, transform: `translateX(${itemX}px)`,
              }}>
                {/* Checkbox */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  backgroundColor: hexToRgba(color, checkProgress > 0.15 ? 0.2 : 0.06),
                  border: `2px solid ${hexToRgba(color, 0.3 + checkProgress * 0.5)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 2,
                  boxShadow: 'none',
                }}>
                  <div style={{ opacity: checkProgress, transform: `scale(${checkProgress})` }}>
                    <CheckIcon size={22} color={color} />
                  </div>
                </div>

                {/* Label */}
                <div>
                  <p style={{ fontSize: 28, fontWeight: 600, color: C.text, fontFamily: F.text, lineHeight: 1.4, margin: 0 }}>{item.label}</p>
                  {item.enLabel && (
                    <p style={{ fontSize: enISize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '4px 0 0 0' }}>{item.enLabel}</p>
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
