// 脚本模板预设 — 不同口播类型的默认元素序列
// 每种模板提供默认的 element 数组，可直接用于 PipOverlay JSON 配置

import { V } from './animation';

// ====== Types ======

export type TemplateType = 'sales' | 'educational' | 'story' | 'contrast' | 'guide';

export interface PipElement {
  type: string;
  enterAt: number;
  exitAt: number;
  animation: 'spring';
  position: 'center';
  props: Record<string, unknown>;
}

export interface TemplateConfig {
  name: string;
  description: string;
  totalFrames: number;
  fps: number;
  colorFlow: string[];
  elements: PipElement[];
}

// ====== Timing Helpers ======

const STEP = 120; // frames per card (≈4s at 30fps — 呼吸感)
const BREATHER = 20; // extra gap after section breaks (≈0.67s empty screen)

/**
 * Build a sequence of elements with breathing room between sections.
 * @param breathers — indices after which to insert a breathing gap (group→group transitions)
 */
function buildSequence(
  fps: number,
  slots: Array<{ type: string; props: Record<string, unknown> }>,
  breathers: number[] = [],
): PipElement[] {
  let offset = 0;
  return slots.map((slot, i) => {
    const enterAt = i * STEP + offset;
    const isLast = i === slots.length - 1;
    // Last card stays on screen for extra time; others yield to next card with a small overlap
    const exitAt = isLast ? enterAt + STEP + 60 : (i + 1) * STEP + offset - 8;
    if (breathers.includes(i)) offset += BREATHER;
    return {
      type: slot.type,
      enterAt,
      exitAt,
      animation: 'spring' as const,
      position: 'center' as const,
      props: slot.props,
    };
  });
}

/** Calculate total frames for a sequence */
function calcTotal(slotsLength: number, breathers: number[]): number {
  return slotsLength * STEP + breathers.length * BREATHER + 60;
}

// ====== Templates ======

const FPS = 30;

/**
 * 销售型 — 痛→警→转→利→高→CTA（11 场景标准流）
 * 适用：房产推销、产品种草、优惠推广
 */
export const SALES_TEMPLATE: TemplateConfig = {
  name: '销售型',
  description: '痛点→警告→[呼吸]→转折→利益→[呼吸]→高潮→[呼吸]→CTA',
  totalFrames: calcTotal(11, [4, 8, 9]),
  fps: FPS,
  colorFlow: [V[2], V[1], V[0], V[2], V[4], V[5], V[1], V[3], V[4], V[0], V[1]],
  elements: buildSequence(FPS, [
    { type: 'HookCard', props: { label: '替换为痛点标签', headline: '替换为冲击句', color: V[2] } },
    { type: 'PriceRevealCard', props: { tag: '替换为标签', subtitle: '替换为副标', priceLabel: '总价', priceValue: '21.8', priceUnit: '万', color: V[1] } },
    { type: 'WarningCard', props: { n: 1, title: '替换为警告标题', desc: '替换为描述', color: V[0] } },
    { type: 'WarningCard', props: { n: 2, title: '替换为警告标题', desc: '替换为描述', color: V[3] } },
    { type: 'WarningCard', props: { n: 3, title: '替换为警告标题', desc: '替换为描述', color: V[4] } },
    { type: 'HookCard', props: { label: '转折标签', headline: '转折冲 击句', color: V[5] } },
    { type: 'BenefitCard', props: { title: '替换为利益标题', desc: '替换为描述', color: V[1] } },
    { type: 'BenefitCard', props: { title: '替换为利益标题', desc: '替换为描述', color: V[3] } },
    { type: 'BenefitCard', props: { title: '替换为利益标题', desc: '替换为描述', color: V[4] } },
    { type: 'ClimaxCard', props: { text: '替换为金句', color: V[0] } },
    { type: 'CTACard', props: { headline: '替换为行动号召', contact: '+852 XXXX XXXX', color: V[1] } },
  ], [4, 8, 9]),
};

/**
 * 教育型 — 悬念→拆解×N→总结→CTA（知识点递进流）
 * 适用：法律科普、税费讲解、买房攻略、知识分享
 */
export const EDUCATIONAL_TEMPLATE: TemplateConfig = {
  name: '教育型',
  description: '悬念钩子→多段拆解→[呼吸]→总结→[呼吸]→CTA',
  totalFrames: calcTotal(8, [4, 6]),
  fps: FPS,
  colorFlow: [V[2], V[0], V[2], V[4], V[5], V[3], V[1]],
  elements: buildSequence(FPS, [
    { type: 'HookCard', props: { label: '你有没有想过…', headline: '替换为悬念句', color: V[2] } },
    { type: 'QACard', props: { question: '替换为问题', answer: '替换为答案', color: V[0] } },
    { type: 'WarningCard', props: { n: 1, title: '陷阱一', desc: '替换为描述', color: V[2] } },
    { type: 'WarningCard', props: { n: 2, title: '陷阱二', desc: '替换为描述', color: V[3] } },
    { type: 'WarningCard', props: { n: 3, title: '陷阱三', desc: '替换为描述', color: V[4] } },
    { type: 'ChecklistCard', props: { title: '记住这三样', items: [{ label: '第一件事' }, { label: '第二件事' }, { label: '第三件事' }], color: V[5] } },
    { type: 'ClimaxCard', props: { text: '替换为总结金句', color: V[0] } },
    { type: 'CTACard', props: { headline: '替换为行动号召', contact: '+852 XXXX XXXX', color: V[1] } },
  ], [4, 6]),
};

/**
 * 故事型 — 场景→冲突→情感→见证→价值→CTA（叙事流）
 * 适用：客户案例、个人故事、情景短剧
 */
export const STORY_TEMPLATE: TemplateConfig = {
  name: '故事型',
  description: '场景→冲突→[呼吸]→见证→变化→[呼吸]→CTA 叙事流',
  totalFrames: calcTotal(6, [1, 4]),
  fps: FPS,
  colorFlow: [V[2], V[0], V[5], V[1], V[3], V[1]],
  elements: buildSequence(FPS, [
    { type: 'HookCard', props: { label: '场景代入', headline: '替换为场景句', color: V[2] } },
    { type: 'WarningCard', props: { n: 1, title: '冲突/痛点', desc: '替换为描述', color: V[0] } },
    { type: 'TestimonialCard', props: { quote: '客户原话引用', name: '客户名', role: '客户身份', color: V[1] } },
    { type: 'DataComparisonCard', props: { leftLabel: '之前', leftValue: 'X', rightLabel: '之后', rightValue: 'Y', delta: '改变', color: V[1] } },
    { type: 'BenefitCard', props: { title: '为什么值得', desc: '替换为描述', color: V[3] } },
    { type: 'CTACard', props: { headline: '替换为行动号召', contact: '+852 XXXX XXXX', color: V[1] } },
  ], [1, 4]),
};

/**
 * 对比型 — 左右对比→数据→利益→高潮→CTA（PK说服流）
 * 适用：双盘对比、香港vs中山、前后变化
 */
export const CONTRAST_TEMPLATE: TemplateConfig = {
  name: '对比型',
  description: '左右对比→数据冲击→[呼吸]→利益→[呼吸]→高潮→CTA',
  totalFrames: calcTotal(7, [2, 5]),
  fps: FPS,
  colorFlow: [V[2], V[1], V[0], V[5], V[3], V[0], V[1]],
  elements: buildSequence(FPS, [
    { type: 'HookCard', props: { label: '两组选择', headline: '替换为对比冲击句', color: V[2] } },
    { type: 'DataComparisonCard', props: { leftLabel: '选项A', leftValue: 'X', rightLabel: '选项B', rightValue: 'Y', delta: '差距', color: V[1] } },
    { type: 'WarningCard', props: { n: 1, title: '选错的代价', desc: '替换为描述', color: V[0] } },
    { type: 'StatCard', props: { stats: [{ value: '21.8', label: '总价(万)' }, { value: '33', label: '面积(㎡)' }, { value: '1h', label: '车程' }], color: V[1] } },
    { type: 'BenefitCard', props: { title: '为什么选这个', desc: '替换为描述', color: V[3] } },
    { type: 'ClimaxCard', props: { text: '替换为选择金句', color: V[0] } },
    { type: 'CTACard', props: { headline: '替换为行动号召', contact: '+852 XXXX XXXX', color: V[1] } },
  ], [2, 5]),
};

/**
 * 攻略型 — 问题→流程→清单→位置→CTA（实用步骤流）
 * 适用：买房攻略、操作指南、避坑手册
 */
export const GUIDE_TEMPLATE: TemplateConfig = {
  name: '攻略型',
  description: '问题钩子→[呼吸]→流程→[呼吸]→清单→位置→CTA',
  totalFrames: calcTotal(6, [1, 3]),
  fps: FPS,
  colorFlow: [V[2], V[0], V[1], V[3], V[5], V[1]],
  elements: buildSequence(FPS, [
    { type: 'HookCard', props: { label: '买房前必看', headline: '替换为攻略标题', color: V[2] } },
    { type: 'QACard', props: { question: '第一步做什么？', answer: '替换为关键答案', color: V[0] } },
    { type: 'ProcessCard', props: { title: '完整流程', steps: [{ label: '第一步', status: 'done' as const }, { label: '第二步', status: 'active' as const }, { label: '第三步', status: 'pending' as const }], color: V[1] } },
    { type: 'ChecklistCard', props: { title: '必备清单', items: [{ label: '第一项' }, { label: '第二项' }, { label: '第三项' }], color: V[3] } },
    { type: 'LocationCard', props: { from: '香港', to: '中山', duration: '1小时', color: V[5] } },
    { type: 'CTACard', props: { headline: '替换为行动号召', contact: '+852 XXXX XXXX', color: V[1] } },
  ], [1, 3]),
};

// ====== Template Map ======

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  sales: SALES_TEMPLATE,
  educational: EDUCATIONAL_TEMPLATE,
  story: STORY_TEMPLATE,
  contrast: CONTRAST_TEMPLATE,
  guide: GUIDE_TEMPLATE,
};

/**
 * 快捷构建：从模板类型 + 自定义覆盖生成 PipOverlay defaultProps
 *
 * @example
 * const props = buildTemplateProps('educational', {
 *   elements: [
 *     // 可覆盖或新增个别卡片
 *   ],
 * });
 */
export function buildTemplateProps(
  type: TemplateType,
  overrides?: Partial<TemplateConfig>,
): TemplateConfig {
  const base = TEMPLATES[type];
  return { ...base, ...overrides, elements: overrides?.elements ?? base.elements };
}
