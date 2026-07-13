// remotion-realestate/src/covers/WarningCover.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { WarningCoverProps } from './types';

const SHADOW = '0 8px 36px rgba(0,0,0,0.95)';
const neonGlow = (color: string) => `0 0 18px ${color}99, 0 0 36px ${color}44`;

export const WarningCover: React.FC<WarningCoverProps> = ({
  series,
  episodeNumber,
  title,
  hook,
  items,
}) => {
  const color = SERIES_COLORS[series];

  return (
    <AbsoluteFill
      style={{ backgroundColor: 'transparent', fontFamily: FONTS.text }}
    >
      {/* ====== CENTER AMBIENT GLOW ====== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse 50% 30% at 50% 55%, ${color}0d 0%, transparent 65%)`,
          zIndex: 0,
          pointerEvents: 'none' as const,
        }}
      />

      {/* ====== MIDDLE CONNECTOR: subtle left spine ====== */}
      <div
        style={{
          position: 'absolute',
          top: '34%',
          bottom: '30%',
          left: 60,
          width: 2,
          background: `linear-gradient(180deg, ${color}00 0%, ${color}1a 25%, ${color}1a 75%, ${color}00 100%)`,
          zIndex: 0,
          pointerEvents: 'none' as const,
        }}
      />

      {/* ====== TOP ZONE: Title ====== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <div style={{ height: 6, background: color }} />
        <div style={{ padding: '50px 60px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 10,
                height: 42,
                background: color,
                borderRadius: 5,
              }}
            />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 164,
              color: '#FFFFFF',
              lineHeight: 1.02,
              fontWeight: 900,
              margin: 0,
              textShadow: SHADOW,
              letterSpacing: '-0.04em',
            }}
          >
            {(() => {
              const lines = title.split('\n');
              const lastIdx = lines.length - 1;
              return lines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  <span style={{ color: i === lastIdx ? color : '#FFFFFF' }}>
                    {line}
                  </span>
                </React.Fragment>
              ));
            })()}
          </h1>
        </div>
        {/* Top zone fade-out */}
        <div style={{
          height: 48,
          marginTop: 36,
          background: `linear-gradient(180deg, transparent 0%, ${color}0d 100%)`,
          pointerEvents: 'none' as const,
        }} />
      </div>

      {/* ====== BOTTOM ZONE: Hook + Items ====== */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        {/* Bottom zone fade-in — mirror of top fade-out */}
        <div style={{
          height: 48,
          marginBottom: 12,
          background: `linear-gradient(180deg, transparent 0%, ${color}0d 100%)`,
          pointerEvents: 'none' as const,
        }} />
        <div style={{ padding: '0 60px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 20,
            }}
          >
            <div>
              {/* Top gradient line */}
              <div
                style={{
                  width: '100%',
                  height: 5,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  marginBottom: 28,
                }}
              />

              {/* Hook */}
              {hook && (
                <>
                  <p
                    style={{
                      fontSize: 68,
                      color,
                      fontWeight: 900,
                      lineHeight: 1.2,
                      margin: 0,
                      textAlign: 'right' as const,
                      textShadow: `${SHADOW}, ${neonGlow(color)}`,
                      marginBottom: 24,
                      maxWidth: '88%',
                      marginLeft: 'auto',
                    }}
                  >
                    「{hook}」
                  </p>
                  {/* Hook divider with glow dot */}
                  <div
                    style={{
                      position: 'relative',
                      width: '55%',
                      height: 3,
                      background: `linear-gradient(90deg, transparent, ${color}55)`,
                      marginBottom: 24,
                      marginLeft: 'auto',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: neonGlow(color),
                      }}
                    />
                  </div>
                </>
              )}

              {/* Numbered Items */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  alignItems: 'flex-end',
                }}
              >
                {items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                      flexDirection: 'row-reverse',
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: neonGlow(color),
                      }}
                    >
                      <span
                        style={{
                          color: '#FFFFFF',
                          fontSize: 38,
                          fontWeight: 900,
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 72,
                        color: '#FFFFFF',
                        fontWeight: 900,
                        textShadow: SHADOW,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            height: 5,
            background: `linear-gradient(90deg, ${color}, transparent)`,
          }}
        />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
