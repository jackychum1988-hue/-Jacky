// overlay 组件库统一导出
export {
  useOverlayAnimation,
  useTypewriterProgress,
  positionToStyle,
  hexToRgb,
  hexToRgba,
  textDepth,
  textGlow,
  V,
  C,
  F,
  EN_RATIO,
  enFontSize,
  splitByHighlights,
  breathingScale,
  idleFloat,
  settleBounce,
  RADIUS,
  SAFE_ZONE,
  SAFE_MAX_WIDTH,
  SAFE_MAX_WIDTH_WIDE,
  popScaleValue,
  reservedPadding,
  EMPHASIS_CONFIGS,
} from './animation';
export type {
  OverlayElementBase,
  OverlayTiming,
  AnimationType,
  Position9,
  AnimationPhase,
  HighlightWord,
  TextSegment,
  EmphasisLevel,
  EmphasisConfig,
} from './animation';

export { KeywordTag } from './KeywordTag';
export { PriceBadge } from './PriceBadge';
export { DataPanel } from './DataPanel';
export { MetricCard } from './MetricCard';
export { QuoteBar } from './QuoteBar';
export { Spotlight } from './Spotlight';
export { ArrowPointer } from './ArrowPointer';
export { IconBounce } from './IconBounce';
export { HookCard } from './HookCard';
export { PriceRevealCard } from './PriceRevealCard';
export { WarningCard } from './WarningCard';
export { BenefitCard } from './BenefitCard';
export { ClimaxCard } from './ClimaxCard';
export { CTACard } from './CTACard';
export { DataComparisonCard } from './DataComparisonCard';
export { TimelineCard } from './TimelineCard';
export { TestimonialCard } from './TestimonialCard';
export { LocationCard } from './LocationCard';
export { QACard } from './QACard';
export { ChecklistCard } from './ChecklistCard';
export { RevealCard } from './RevealCard';
export { StatCard } from './StatCard';
export { ProcessCard } from './ProcessCard';
export { FeatureGrid } from './FeatureGrid';
export { EndCard } from './EndCard';
export { AmenityCard } from './AmenityCard';
export type { AmenityItem } from './AmenityCard';
export { AppleHeroCard } from './AppleHeroCard';
export { AppleFeatureCard } from './AppleFeatureCard';
export { AppleMetricCard } from './AppleMetricCard';
export { AppleCTACard } from './AppleCTACard';
export { RankingBarChart } from './RankingBarChart';
export { TrendLineChart } from './TrendLineChart';
export { RankingChangeList } from './RankingChangeList';
export { CalculationCard } from './CalculationCard';
export { RevealMythCard } from './RevealMythCard';
export { CountUpSummaryCard } from './CountUpSummaryCard';
export { SplitSceneCard } from './SplitSceneCard';
export { OverlayDataSourceCard } from './OverlayDataSourceCard';
export { OverlayComparisonCards } from './OverlayComparisonCards';
export { TollCostComparison } from './TollCostComparison';
export { DonutChart } from './DonutChart';
export { NameBadgeCloud } from './NameBadgeCloud';
export { ICON_MAP } from './iconMap';

import type React from 'react';
import { KeywordTag } from './KeywordTag';
import { PriceBadge } from './PriceBadge';
import { DataPanel } from './DataPanel';
import { MetricCard } from './MetricCard';
import { QuoteBar } from './QuoteBar';
import { Spotlight } from './Spotlight';
import { ArrowPointer } from './ArrowPointer';
import { IconBounce } from './IconBounce';
import { HookCard } from './HookCard';
import { PriceRevealCard } from './PriceRevealCard';
import { WarningCard } from './WarningCard';
import { BenefitCard } from './BenefitCard';
import { ClimaxCard } from './ClimaxCard';
import { CTACard } from './CTACard';
import { DataComparisonCard } from './DataComparisonCard';
import { TimelineCard } from './TimelineCard';
import { TestimonialCard } from './TestimonialCard';
import { LocationCard } from './LocationCard';
import { QACard } from './QACard';
import { ChecklistCard } from './ChecklistCard';
import { RevealCard } from './RevealCard';
import { StatCard } from './StatCard';
import { ProcessCard } from './ProcessCard';
import { FeatureGrid } from './FeatureGrid';
import { EndCard } from './EndCard';
import { AmenityCard } from './AmenityCard';
import { AppleHeroCard } from './AppleHeroCard';
import { AppleFeatureCard } from './AppleFeatureCard';
import { AppleMetricCard } from './AppleMetricCard';
import { AppleCTACard } from './AppleCTACard';
import { RankingBarChart } from './RankingBarChart';
import { TrendLineChart } from './TrendLineChart';
import { RankingChangeList } from './RankingChangeList';
import { CalculationCard } from './CalculationCard';
import { RevealMythCard } from './RevealMythCard';
import { CountUpSummaryCard } from './CountUpSummaryCard';
import { SplitSceneCard } from './SplitSceneCard';
import { OverlayDataSourceCard } from './OverlayDataSourceCard';
import { OverlayComparisonCards } from './OverlayComparisonCards';
import { TollCostComparison } from './TollCostComparison';
import { DonutChart } from './DonutChart';
import { NameBadgeCloud } from './NameBadgeCloud';

// type → component 映射表，供 PipOverlay JSON 驱动使用
export const overlayComponentMap: Record<string, React.FC<any>> = {
  KeywordTag,
  PriceBadge,
  DataPanel,
  MetricCard,
  QuoteBar,
  Spotlight,
  ArrowPointer,
  IconBounce,
  HookCard,
  PriceRevealCard,
  WarningCard,
  BenefitCard,
  ClimaxCard,
  CTACard,
  DataComparisonCard,
  TimelineCard,
  TestimonialCard,
  LocationCard,
  QACard,
  ChecklistCard,
  RevealCard,
  StatCard,
  ProcessCard,
  FeatureGrid,
  EndCard,
  AmenityCard,
  AppleHeroCard,
  AppleFeatureCard,
  AppleMetricCard,
  AppleCTACard,
  RankingBarChart,
  TrendLineChart,
  RankingChangeList,
  CalculationCard,
  RevealMythCard,
  CountUpSummaryCard,
  SplitSceneCard,
  OverlayDataSourceCard,
  OverlayComparisonCards,
  TollCostComparison,
  DonutChart,
  NameBadgeCloud,
};
