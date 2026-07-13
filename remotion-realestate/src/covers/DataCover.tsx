// remotion-realestate/src/covers/DataCover.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';

const SHADOW = '0 8px 36px rgba(0,0,0,0.95)';

export const DataCover: React.FC<DataCoverProps> = ({
  series,
  episodeNumber,
  title,
  leftLabel,
  leftValue,
  leftSub,
  rightLabel,
  rightValue,
  rightSub,
  insight,
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
              fontSize: 156,
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
                  <span style={{ color: i === lastIdx ? color : '#FFFFFF' }}>{line}</span>
                </React.Fragment>
              ));
            })()}
          </h1>
        </div>
        {/* Top zone fade-out */}
        <div
          style={{
            height: 48,
            marginTop: 36,
            background: `linear-gradient(180deg, transparent 0%, ${color}0d 100%)`,
            pointerEvents: 'none' as const,
          }}
        />
      </div>

      {/* ====== BOTTOM ZONE: VS Comparison + Insight ====== */}
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
            <div style={{ textAlign: 'right' }}>
              {/* Top gradient line */}
              <div
                style={{
                  width: '100%',
                  height: 5,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  marginBottom: 28,
                }}
              />

              {/* VS Comparison row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 36,
                  justifyContent: 'flex-end',
                  marginBottom: 28,
                }}
              >
                {/* Left (old/worse) */}
                <div>
                  <div
                    style={{
                      fontSize: 52,
                      color: '#FFFFFFA0',
                      marginBottom: 12,
                      fontWeight: 900,
                      textShadow: SHADOW,
                    }}
                  >
                    {leftLabel}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 132,
                      color: '#00D4FF',
                      fontWeight: 900,
                      textShadow: SHADOW,
                    }}
                  >
                    {leftValue}
                  </div>
                  {leftSub && (
                    <div
                      style={{
                        fontSize: 40,
                        color: '#FFFFFF88',
                        fontWeight: 900,
                        textShadow: SHADOW,
                      }}
                    >
                      {leftSub}
                    </div>
                  )}
                </div>

                {/* VS badge — glowing circle */}
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: `${color}22`,
                    border: `3px solid ${color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 24px ${color}33, 0 0 48px ${color}18`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 48,
                      color,
                      fontWeight: 900,
                    }}
                  >
                    VS
                  </span>
                </div>

                {/* Right (new/better) */}
                <div>
                  <div
                    style={{
                      fontSize: 52,
                      color: '#FFFFFFA0',
                      marginBottom: 12,
                      fontWeight: 900,
                      textShadow: SHADOW,
                    }}
                  >
                    {rightLabel}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 132,
                      color,
                      fontWeight: 900,
                      textShadow: SHADOW,
                    }}
                  >
                    {rightValue}
                  </div>
                  {rightSub && (
                    <div
                      style={{
                        fontSize: 40,
                        color: '#FFFFFF88',
                        fontWeight: 900,
                        textShadow: SHADOW,
                      }}
                    >
                      {rightSub}
                    </div>
                  )}
                </div>
              </div>

              {/* Insight */}
              <div
                style={{
                  fontSize: 72,
                  color: '#FFFFFF',
                  fontWeight: 900,
                  textShadow: SHADOW,
                }}
              >
                {insight}
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
