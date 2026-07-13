// remotion-realestate/src/covers/types.ts
// 封面类型定义 — 四系列共用接口

export type SeriesType = 'sundip' | 'data' | 'opinion' | 'warning';

export interface CoverBaseProps {
  /** 系列类型 */
  series: SeriesType;
  /** 集数 */
  episodeNumber: number;
}

export interface SundipCoverProps extends CoverBaseProps {
  series: 'sundip';
  /** 核心价格数字，如 "21.8" */
  highlightNumber: string;
  /** 价格单位，如 "万" */
  highlightUnit?: string;
  /** 价格下方短描述 */
  highlightLabel: string;
  /** 楼盘名称 */
  propertyName: string;
  /** 卖点标签 (3-4个) */
  tags: string[];
}

export interface DataCoverProps extends CoverBaseProps {
  series: 'data';
  /** 对比标题，如 "香港 vs 中山 买楼成本大对比" */
  title: string;
  /** 左侧数据 */
  leftLabel: string;
  leftValue: string;
  leftSub?: string;
  /** 右侧数据 */
  rightLabel: string;
  rightValue: string;
  rightSub?: string;
  /** 底部洞察文案 */
  insight: string;
}

export interface OpinionCoverProps extends CoverBaseProps {
  series: 'opinion';
  /** 观点标题 */
  title: string;
  /** 钩子副标题 */
  hook: string;
}

export interface WarningCoverProps extends CoverBaseProps {
  series: 'warning';
  /** 警告标题 */
  title: string;
  /** 情绪钩子，显示在要点上方（可选） */
  hook?: string;
  /** 问题条目 (3-5条) */
  items: string[];
}

export type CoverProps =
  | SundipCoverProps
  | DataCoverProps
  | OpinionCoverProps
  | WarningCoverProps;
