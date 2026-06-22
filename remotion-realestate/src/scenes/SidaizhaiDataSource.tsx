// SidaizhaiDataSource — 四代住宅视频数据来源卡片
// 5项数据 · 逐项弹簧入场 · 5秒150帧 · 透明底ProRes 4444 alpha
// 参考: CityPriceDataSource.tsx, DataSourceCard.tsx

import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion';

const DATA_ITEMS = [
  {
    title: '4.30新政满月数据',
    value: '住宅网签6,886套 · 好房子196套 · 同比+127.9% · 占全市成交额16%',
    unit: '',
    source: '中山住建局 2026年5月',
    color: '#FF4136',
  },
  {
    title: '中山楼市的拐点来了吗？',
    value: '深度分析四代住宅成交结构、港澳客占比、土地供应转向',
    unit: '',
    source: '南方日报 2026-06-12',
    color: '#1A56DB',
  },
  {
    title: '中山集中挂牌6宗宅地',
    value: '227亩 · 石岐/东区/火炬/小榄 · 全部四代住宅试点',
    unit: '',
    source: '观点网 2026-06-01',
    color: '#10B981',
  },
  {
    title: '「以旧换新」公积金贷款上浮',
    value: '卖旧买新公积金贷款额度上浮 · 四代宅优先适用',
    unit: '',
    source: '中山公积金中心 2026-06-18',
    color: '#F5A623',
  },
  {
    title: '四代住宅项目专题',
    value: '鑫洋·御宸 / 香山颂 / 江山和鸣 / 保利琅悦 / 春风里',
    unit: '',
    source: '项目数据库 · 实地调研',
    color: '#8B5CF6',
  },
];

const hexToRgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

// Apple-style breathing spring config
const ITEM_SPRING = { damping: 24, stiffness: 80, mass: 1.0 };
const VALUE_SPRING = { damping: 26, stiffness: 70, mass: 1.2 };

export const SidaizhaiDataSource: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Title fade in: frames 0-15
  const titleFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [0, 15], [-20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle fade in: frames 5-20
  const subFade = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 40px 36px',
          backgroundColor: 'rgba(10,8,6,0.45)',
          borderRadius: 18,
          border: '1px solid rgba(200,160,82,0.15)',
          maxWidth: 980,
          width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ opacity: titleFade, transform: `translateY(${titleY}px)` }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#C8A052',
              fontFamily: 'Georgia, "PingFang SC", serif',
              margin: '0 0 4px 0',
              letterSpacing: '0.03em',
            }}
          >
            四代住宅 · 数据来源
          </h2>
        </div>
        <p
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            margin: '0 0 24px 0',
            opacity: subFade,
          }}
        >
          中山4.30新政满月 · 四代宅成交 & 土地供应 · 项目数据库
        </p>

        {/* Items — staggered spring entry */}
        {DATA_ITEMS.map((item, i) => {
          const itemDelay = 10 + i * 10; // stagger 10f per item
          const itemFrame = Math.max(0, frame - itemDelay);
          const itemSpring = spring({
            frame: itemFrame,
            fps,
            config: ITEM_SPRING,
          });
          const itemX = interpolate(itemSpring, [0, 1], [-40, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const itemOpacity = itemSpring;

          // Value spring: slightly delayed after item
          const valueDelay = itemDelay + 4;
          const valueFrame = Math.max(0, frame - valueDelay);
          const valueSpring = spring({
            frame: valueFrame,
            fps,
            config: VALUE_SPRING,
          });

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 0',
                borderBottom:
                  i < DATA_ITEMS.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: hexToRgba(item.color, 0.85),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#1A1815',
                    fontFamily: '"SF Mono", "JetBrains Mono", monospace',
                  }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: item.color,
                      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.title}
                  </span>
                  {item.unit ? (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.3)',
                        fontFamily: '"SF Mono", "JetBrains Mono", monospace',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.unit}
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: '#F5F0E8',
                    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                    lineHeight: 1.5,
                    marginBottom: 3,
                    opacity: valueSpring,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: '"SF Mono", "JetBrains Mono", "PingFang SC", monospace',
                    lineHeight: 1.4,
                    opacity: valueSpring,
                  }}
                >
                  {item.source}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
