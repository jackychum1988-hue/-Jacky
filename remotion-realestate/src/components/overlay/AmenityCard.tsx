// AmenityCard — 周边配套列表卡 (zhuzige)
// 图标 + 名称 + 距离 + 出行方式，逐个行滑入
// 复用: 周边配套展示（学校、医院、超市、交通、公园）

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';

export interface AmenityItem {
  icon: string;
  name: string;
  enName?: string;
  distance: string;
  transport: 'walk' | 'drive';
}

interface AmenityCardProps extends OverlayElementBase {
  amenities: AmenityItem[];
  title?: string;
  enTitle?: string;
  color?: string;
}

const TRANSPORT_LABEL: Record<string, string> = {
  walk: '步行',
  drive: '驾车',
};
const TRANSPORT_EN: Record<string, string> = {
  walk: 'walk',
  drive: 'drive',
};

export const AmenityCard: React.FC<AmenityCardProps> = ({
  amenities,
  title,
  enTitle,
  color = '#10B981',
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
              margin: '0 0 28px 0',
            }}
          >
            {enTitle}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {amenities.map((item, i) => {
            const localFrame = Math.max(0, frame - enterAt - i * 10);
            const s = spring({
              frame: localFrame,
              fps,
              config: { damping: 22, stiffness: 90, mass: 1.1 },
            });
            const rowOpacity = interpolate(s, [0, 1], [0, 1]);
            const slideX = interpolate(s, [0, 1], [80, 0]);

            const isWalk = item.transport === 'walk';
            const badgeColor = isWalk ? '#10B981' : '#F5A623';

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '20px 24px',
                  backgroundColor: hexToRgba(color, 0.06),
                  borderRadius: 14,
                  border: `1px solid ${hexToRgba(color, 0.18)}`,
                  opacity: rowOpacity,
                  transform: `translateX(${slideX}px)`,
                }}
              >
                {/* 图标 */}
                {ICON_MAP[item.icon] && (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: hexToRgba(color, 0.15),
                      border: `1.5px solid ${hexToRgba(color, 0.3)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {React.createElement(ICON_MAP[item.icon], { size: 28, color: '#FFFFFF', strokeWidth: 2 })}
                  </div>
                )}

                {/* 名称 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 600,
                      color: C.text,
                      fontFamily: F.text,
                      lineHeight: 1.3,
                      display: 'block',
                    }}
                  >
                    {item.name}
                  </span>
                  {item.enName && (
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: F.text,
                        letterSpacing: '0.1em',
                        display: 'block',
                        marginTop: 2,
                      }}
                    >
                      {item.enName}
                    </span>
                  )}
                </div>

                {/* 距离 + 出行方式 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: F.mono,
                      textAlign: 'right',
                    }}
                  >
                    {item.distance}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: badgeColor,
                      fontFamily: F.text,
                      padding: '4px 10px',
                      backgroundColor: hexToRgba(badgeColor, 0.15),
                      borderRadius: 6,
                      border: `1px solid ${hexToRgba(badgeColor, 0.3)}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {TRANSPORT_LABEL[item.transport]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
