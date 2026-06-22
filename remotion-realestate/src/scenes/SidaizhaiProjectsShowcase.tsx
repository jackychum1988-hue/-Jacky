// SidaizhaiProjectsShowcase — 四代宅热销战绩展示
// 1个主角（江山和鸣）+ 3个配角（香山颂/保利琅悦/鑫洋御宸）
// 7秒210帧 · 透明底ProRes 4444 alpha

import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion';

// ====== 项目数据 ======
const HERO = {
  name: '城建绿城·江山和鸣',
  metrics: [
    { label: '1个钟', value: '100+套', desc: '要摇号先买到' },
    { label: '成交额', value: '3亿', desc: '' },
    { label: '备案价最高', value: '2.79万/㎡', desc: '两万几蚊一平方喎，要抢' },
    { label: '港澳客占比', value: '20%', desc: '' },
  ],
  color: '#FF4136',
};

const SUPPORTING = [
  {
    name: '建华龙湖·香山颂',
    metric: '468→剩几套',
    detail: '尾货阶段 · 买少见少',
    color: '#8B5CF6',
  },
  {
    name: '东区保利琅悦',
    metric: '2.52亿/月',
    detail: '3月单月销售额',
    color: '#F5A623',
  },
  {
    name: '鑫洋御宸',
    metric: '119㎡卖晒',
    detail: '清盘阶段 · 153/179㎡可选',
    color: '#10B981',
  },
];

// ====== 工具函数 ======
const hexToRgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

// Apple breathing springs
const SPRING_HERO = { damping: 22, stiffness: 85, mass: 1.0 };
const SPRING_METRIC = { damping: 26, stiffness: 70, mass: 1.2 };
const SPRING_SUPPORT = { damping: 24, stiffness: 80, mass: 1.0 };

export const SidaizhaiProjectsShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // ── Title: 0-15f slide down + fade ──
  const titleFade = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 15], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Subtitle: 5-18f fade
  const subFade = interpolate(frame, [6, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Hero card: 10-30f spring in ──
  const heroFrame = Math.max(0, frame - 10);
  const heroSpring = spring({ frame: heroFrame, fps, config: SPRING_HERO });
  const heroOpacity = heroSpring;
  const heroScale = interpolate(heroSpring, [0, 1], [0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Hero metrics: staggered within hero ──
  const heroMetrics = HERO.metrics.map((_, i) => {
    const delay = 20 + i * 8;
    const mFrame = Math.max(0, frame - delay);
    const s = spring({ frame: mFrame, fps, config: SPRING_METRIC });
    return {
      opacity: s,
      x: interpolate(s, [0, 1], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    };
  });

  // ── Divider: 36-48f draw ──
  const dividerWidth = interpolate(frame, [36, 52], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Supporting label: 44-58f ──
  const supportLabelFade = interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Supporting cards: 52+ staggered ──
  const supportCards = SUPPORTING.map((_, i) => {
    const delay = 52 + i * 12;
    const sFrame = Math.max(0, frame - delay);
    const s = spring({ frame: sFrame, fps, config: SPRING_SUPPORT });
    return {
      opacity: s,
      x: interpolate(s, [0, 1], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 50px',
      }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column',
        maxWidth: 920, width: '100%',
        gap: 0,
      }}>
        {/* ====== Title ====== */}
        <div style={{
          opacity: titleFade, transform: `translateY(${titleY}px)`,
          marginBottom: 4,
        }}>
          <h2 style={{
            fontSize: 38,
            fontWeight: 700,
            color: '#C8A052',
            fontFamily: 'Georgia, "PingFang SC", serif',
            letterSpacing: '0.04em',
            margin: '0 0 4px 0',
            textShadow: '0 0 30px rgba(200,160,82,0.3)',
          }}>
            四代宅热销战绩
          </h2>
        </div>
        <p style={{
          fontSize: 20,
          color: 'rgba(255,255,255,0.35)',
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
          margin: '0 0 28px 0',
          opacity: subFade,
        }}>
          中山4.30新政后 · 四个指标盘真实成交数据
        </p>

        {/* ====== Hero Card: 江山和鸣 ====== */}
        <div style={{
          opacity: heroOpacity,
          transform: `scale(${heroScale})`,
          padding: '28px 32px 24px',
          backgroundColor: 'rgba(10,8,6,0.55)',
          borderRadius: 18,
          border: `1.5px solid ${hexToRgba(HERO.color, 0.35)}`,
          boxShadow: `0 0 48px ${hexToRgba(HERO.color, 0.1)}, inset 0 1px 0 ${hexToRgba(HERO.color, 0.08)}`,
          marginBottom: 24,
        }}>
          {/* Hero title row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: HERO.color,
              boxShadow: `0 0 12px ${hexToRgba(HERO.color, 0.7)}`,
            }} />
            <span style={{
              fontSize: 28, fontWeight: 800, color: HERO.color,
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              letterSpacing: '0.02em',
            }}>
              {HERO.name}
            </span>
            <span style={{
              fontSize: 16, fontWeight: 600, color: HERO.color,
              fontFamily: '"PingFang SC", sans-serif',
              backgroundColor: hexToRgba(HERO.color, 0.15),
              padding: '3px 10px', borderRadius: 6,
              letterSpacing: '0.05em',
            }}>
              主角
            </span>
          </div>

          {/* Hero 4-column metrics grid */}
          <div style={{
            display: 'flex', gap: 16,
          }}>
            {HERO.metrics.map((m, i) => (
              <div key={i} style={{
                flex: 1,
                opacity: heroMetrics[i].opacity,
                transform: `translateX(${heroMetrics[i].x}px)`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: '"PingFang SC", sans-serif',
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                }}>
                  {m.label}
                </span>
                <span style={{
                  fontSize: 28, fontWeight: 900,
                  color: HERO.color,
                  fontFamily: '"SF Mono", "JetBrains Mono", monospace',
                  lineHeight: 1,
                  textShadow: `0 0 24px ${hexToRgba(HERO.color, 0.4)}`,
                }}>
                  {m.value}
                </span>
                {m.desc ? (
                  <span style={{
                    fontSize: 13, fontWeight: 500,
                    color: '#F5F0E8',
                    fontFamily: '"PingFang SC", sans-serif',
                    marginTop: 4,
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}>
                    {m.desc}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* ====== Divider ====== */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 20,
          opacity: dividerWidth > 0 ? 1 : 0,
        }}>
          <div style={{
            flex: 1, height: 1,
            background: `linear-gradient(to right, transparent, rgba(200,160,82,${0.3 * (dividerWidth / 100)}), rgba(200,160,82,0.3))`,
            transform: `scaleX(${dividerWidth / 100})`,
            transformOrigin: 'left',
          }} />
          <span style={{
            fontSize: 18, fontWeight: 600,
            color: 'rgba(200,160,82,0.6)',
            fontFamily: 'Georgia, "PingFang SC", serif',
            letterSpacing: '0.08em',
            opacity: supportLabelFade,
          }}>
            同场对比
          </span>
          <div style={{
            flex: 1, height: 1,
            background: `linear-gradient(to left, transparent, rgba(200,160,82,${0.3 * (dividerWidth / 100)}), rgba(200,160,82,0.3))`,
            transform: `scaleX(${dividerWidth / 100})`,
            transformOrigin: 'right',
          }} />
        </div>

        {/* ====== Supporting 3 cards ====== */}
        <div style={{
          display: 'flex', gap: 14,
        }}>
          {SUPPORTING.map((proj, i) => (
            <div key={i} style={{
              flex: 1,
              opacity: supportCards[i].opacity,
              transform: `translateX(${supportCards[i].x}px)`,
              padding: '18px 16px 16px',
              backgroundColor: 'rgba(10,8,6,0.4)',
              borderRadius: 14,
              border: `1px solid ${hexToRgba(proj.color, 0.2)}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Color dot + name */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: proj.color,
                  boxShadow: `0 0 10px ${hexToRgba(proj.color, 0.5)}`,
                }} />
                <span style={{
                  fontSize: 17, fontWeight: 700, color: proj.color,
                  fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                  letterSpacing: '0.02em',
                }}>
                  {proj.name}
                </span>
              </div>
              {/* Big metric */}
              <span style={{
                fontSize: 28, fontWeight: 900,
                color: proj.color,
                fontFamily: '"SF Mono", "JetBrains Mono", monospace',
                marginBottom: 6,
                textShadow: `0 0 20px ${hexToRgba(proj.color, 0.35)}`,
              }}>
                {proj.metric}
              </span>
              {/* Detail */}
              <span style={{
                fontSize: 14, fontWeight: 400,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: '"PingFang SC", sans-serif',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {proj.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
