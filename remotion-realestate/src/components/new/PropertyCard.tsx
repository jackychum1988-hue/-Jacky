// PropertyCard - 房源信息卡片
// 展示楼盘核心信息：名称、价格、户型、面积、特色

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { COLORS, FONTS, SIZES } from '../../design-system/tokens';
import { SPRING_PRESETS } from '../../design-system/animations';

export interface PropertyInfo {
  /** 楼盘/房源名称 */
  name: string;
  /** 区域 */
  district?: string;
  /** 价格（万） */
  price?: number;
  /** 价格单位 */
  priceUnit?: string;
  /** 面积（平方呎） */
  area?: string;
  /** 户型 */
  layout?: string;
  /** 标签 */
  tags?: string[];
  /** 亮点 */
  highlights?: string[];
}

interface PropertyCardProps {
  property: PropertyInfo;
  /** 序号（用于多卡片的错开） */
  index?: number;
  startDelay?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  index = 0,
  startDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const actualDelay = startDelay + index * 12;

  const cardProgress = spring({
    frame: frame - actualDelay,
    fps,
    config: SPRING_PRESETS.heavy,
  });

  const cardOpacity = interpolate(frame - actualDelay, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const infoOpacity = interpolate(frame - actualDelay - 15, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        backgroundColor: COLORS.backgroundElevated,
        borderRadius: SIZES.radius.xl,
        border: `1px solid ${COLORS.backgroundSecondary}`,
        padding: `${SIZES.spacing.xl}px`,
        minWidth: 360,
        maxWidth: 500,
        opacity: cardOpacity,
        transform: `translateY(${(1 - cardProgress) * 40}px) scale(${0.92 + cardProgress * 0.08})`,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* 区域标签 */}
      {property.district && (
        <div
          style={{
            display: 'inline-block',
            padding: `${SIZES.spacing.xs}px ${SIZES.spacing.sm}px`,
            backgroundColor: `${COLORS.primary}20`,
            borderRadius: SIZES.radius.sm,
            marginBottom: SIZES.spacing.md,
            opacity: infoOpacity,
          }}
        >
          <span
            style={{
              fontSize: SIZES.caption,
              fontFamily: FONTS.text,
              color: COLORS.primary,
              fontWeight: 500,
            }}
          >
            {property.district}
          </span>
        </div>
      )}

      {/* 楼盘名称 */}
      <h3
        style={{
          fontSize: SIZES.h3,
          fontFamily: FONTS.display,
          fontWeight: 700,
          color: COLORS.text,
          margin: 0,
          marginBottom: SIZES.spacing.md,
          letterSpacing: '-0.02em',
          opacity: infoOpacity,
        }}
      >
        {property.name}
      </h3>

      {/* 价格 + 面积 + 户型 */}
      <div
        style={{
          display: 'flex',
          gap: SIZES.spacing.lg,
          marginBottom: SIZES.spacing.lg,
          opacity: infoOpacity,
        }}
      >
        {property.price !== undefined && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: SIZES.body, color: COLORS.primary, fontWeight: 600 }}>
              HK${property.price.toLocaleString('zh-HK')}
            </span>
            {property.priceUnit && (
              <span style={{ fontSize: SIZES.caption, color: COLORS.textSecondary }}>
                {property.priceUnit}
              </span>
            )}
          </div>
        )}
        {property.area && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: SIZES.body, color: COLORS.text, fontWeight: 600 }}>
              {property.area}
            </span>
            <span style={{ fontSize: SIZES.caption, color: COLORS.textSecondary }}>
              呎
            </span>
          </div>
        )}
        {property.layout && (
          <div>
            <span style={{ fontSize: SIZES.body, color: COLORS.text }}>
              {property.layout}
            </span>
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <div
        style={{
          width: '100%',
          height: 1,
          background: `linear-gradient(90deg, ${COLORS.backgroundSecondary}, transparent)`,
          marginBottom: SIZES.spacing.lg,
          opacity: infoOpacity,
        }}
      />

      {/* 标签 */}
      {property.tags && property.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: SIZES.spacing.sm,
            flexWrap: 'wrap',
            marginBottom: property.highlights ? SIZES.spacing.md : 0,
            opacity: infoOpacity,
          }}
        >
          {property.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: `${SIZES.spacing.xs}px ${SIZES.spacing.md}px`,
                backgroundColor: COLORS.backgroundSecondary,
                borderRadius: SIZES.radius.sm,
                fontSize: SIZES.caption,
                fontFamily: FONTS.text,
                color: COLORS.textSecondary,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 亮点列表 */}
      {property.highlights && property.highlights.length > 0 && (
        <div style={{ opacity: infoOpacity }}>
          {property.highlights.map((h, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SIZES.spacing.sm,
                marginBottom: SIZES.spacing.xs,
              }}
            >
              <span style={{ color: COLORS.success, fontSize: SIZES.body }}>+</span>
              <span
                style={{
                  fontSize: SIZES.body,
                  fontFamily: FONTS.text,
                  color: COLORS.textSecondary,
                }}
              >
                {h}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
