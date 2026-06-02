// LocationCard — 区位路线卡 (zhuzige)
// 起点图标 → 路线 → 终点图标 + 时间标注
// 复用: 交通/区位场景 ("深中通道30分钟到前海")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, enFontSize, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';

interface LocationCardProps extends OverlayElementBase {
  from: string;
  to: string;
  enFrom?: string;
  enTo?: string;
  duration: string;
  enDuration?: string;
  via?: string;
  enVia?: string;
  icon?: string;
  color?: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  from, to, enFrom, enTo,
  duration, enDuration, via, enVia,
  icon, color = '#10B981',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);

  const cardSpring = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 85, mass: 1.1 } });
  const lineGrow = spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
  const viaSpring = spring({ frame: Math.max(0, localFrame - 16), fps, config: { damping: 16, stiffness: 100, mass: 0.7 } });

  const cardY = interpolate(cardSpring, [0, 1], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const enSize = enFontSize(24);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{
        opacity: anim.opacity, transform: `translateY(${cardY}px)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        maxWidth: 880,
      }}>
        {/* 起点 + 终点 横排 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* 起点 */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            {icon && ICON_MAP[icon] && (
              <div style={{ marginBottom: 8 }}>
                {React.createElement(ICON_MAP[icon], { size: 40, color, strokeWidth: 2 })}
              </div>
            )}
            <p style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: F.text, margin: 0 }}>{from}</p>
            {enFrom && <p style={{ fontSize: enSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '2px 0 0 0' }}>{enFrom}</p>}
          </div>

          {/* 路线 + 时间 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {/* 左端点 */}
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.6)}`, flexShrink: 0 }} />
              {/* 线条 */}
              <div style={{
                flex: 1, height: 3,
                background: `linear-gradient(to right, ${color}, ${hexToRgba(color, 0.3)})`,
                transform: `scaleX(${lineGrow})`, transformOrigin: 'left center',
                boxShadow: `0 0 8px ${hexToRgba(color, 0.4)}`,
              }} />
              {/* 右端点 */}
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.6)}`, flexShrink: 0 }} />
            </div>
            {/* 时间标注 */}
            <p style={{
              fontSize: 20, fontWeight: 600, color, fontFamily: F.mono,
              margin: '10px 0 0 0', opacity: viaSpring,
              textShadow: `0 0 12px ${hexToRgba(color, 0.35)}`,
            }}>{duration}</p>
            {enDuration && (
              <p style={{ fontSize: enFontSize(20), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '4px 0 0 0', opacity: viaSpring }}>{enDuration}</p>
            )}
            {via && (
              <p style={{ fontSize: enSize, fontWeight: 400, color: C.textSecondary, fontFamily: F.text, margin: '8px 0 0 0', opacity: viaSpring }}>{via}</p>
            )}
            {enVia && (
              <p style={{ fontSize: enFontSize(24), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '2px 0 0 0', opacity: viaSpring }}>{enVia}</p>
            )}
          </div>

          {/* 终点 */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            {icon && ICON_MAP[icon] && (
              <div style={{ marginBottom: 8 }}>
                {React.createElement(ICON_MAP[icon], { size: 40, color: '#FFFFFF', strokeWidth: 2 })}
              </div>
            )}
            <p style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: F.text, margin: 0 }}>{to}</p>
            {enTo && <p style={{ fontSize: enSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '2px 0 0 0' }}>{enTo}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
