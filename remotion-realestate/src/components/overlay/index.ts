// overlay 组件库统一导出
export { useOverlayAnimation, useTypewriterProgress, positionToStyle, hexToRgb } from './animation';
export type { OverlayElementBase, OverlayTiming, AnimationType, Position9 } from './animation';

export { KeywordTag } from './KeywordTag';
export { PriceBadge } from './PriceBadge';
export { DataPanel } from './DataPanel';
export { MetricCard } from './MetricCard';
export { QuoteBar } from './QuoteBar';
export { Spotlight } from './Spotlight';
export { ArrowPointer } from './ArrowPointer';
export { IconBounce } from './IconBounce';

import type React from 'react';
import { KeywordTag } from './KeywordTag';
import { PriceBadge } from './PriceBadge';
import { DataPanel } from './DataPanel';
import { MetricCard } from './MetricCard';
import { QuoteBar } from './QuoteBar';
import { Spotlight } from './Spotlight';
import { ArrowPointer } from './ArrowPointer';
import { IconBounce } from './IconBounce';

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
};
