// remotion-realestate/src/components/new/IconCloud/projectData.ts

export interface ProjectData {
  id: number;
  name: string;
  district: string;
  tag: string;
  imageUrl: string;
}

// 18 个中山在售楼盘，分三层轨道
// 内层(6): 核心热门盘，中层(6): 四代宅+改善盘，外层(6): 坦洲三乡+公寓
export const PROJECTS: ProjectData[] = [
  // ===== 内层轨道 (6) — 市中心核心热门盘 =====
  { id: 1, name: '江山和鸣', district: '石岐', tag: '四代宅·使用率145%', imageUrl: '' },
  { id: 2, name: '保利琅悦', district: '東區', tag: '四代奢宅標杆', imageUrl: '' },
  { id: 3, name: '囍滙·Central Peak', district: '東區', tag: '豪宅·203-316㎡', imageUrl: '' },
  { id: 4, name: '御宸', district: '石岐', tag: '四代宅·容積率1.99', imageUrl: '' },
  { id: 5, name: '建华龙湖·香山颂', district: '石岐', tag: '2025銷冠·四代宅', imageUrl: '' },
  { id: 6, name: '遠洋天著', district: '南區', tag: '鴻蒙智慧大平層', imageUrl: '' },

  // ===== 中层轨道 (6) — 市区改善盘 =====
  { id: 7, name: '中山108天寓', district: '東區', tag: '住宅+公寓', imageUrl: '' },
  { id: 8, name: '華潤仁恒公園四季2期', district: '西區', tag: '住宅·95-142㎡', imageUrl: '' },
  { id: 9, name: '幸福匯', district: '西區', tag: '岐江現房', imageUrl: '' },
  { id: 10, name: '展睿·江樾灣', district: '石岐', tag: '現房·性價比之王', imageUrl: '' },
  { id: 11, name: '錦繡海灣城', district: '翠亨', tag: '濱海萬畝大盤', imageUrl: '' },
  { id: 12, name: '華發觀山水', district: '三鄉', tag: '山景大盤', imageUrl: '' },

  // ===== 外层轨道 (6) — 坦洲三乡港人热门 + 公寓 =====
  { id: 13, name: '佳境康城', district: '坦洲', tag: '港資住宅', imageUrl: '' },
  { id: 14, name: '錦繡國際花城', district: '坦洲', tag: '湖景住宅', imageUrl: '' },
  { id: 15, name: '雅居樂·萬象郡', district: '三鄉', tag: '成熟社區', imageUrl: '' },
  { id: 16, name: '中澳春城', district: '坦洲', tag: '坦洲熱搜TOP1', imageUrl: '' },
  { id: 17, name: '港航匯', district: '市區', tag: '精裝公寓·21.8萬起', imageUrl: '' },
  { id: 18, name: '海雅繽紛城', district: '南頭', tag: '商辦綜合體', imageUrl: '' },
];

// 轨道层级索引
export const LAYERS = {
  inner: [0, 1, 2, 3, 4, 5],     // PROJECTS indices
  middle: [6, 7, 8, 9, 10, 11],
  outer: [12, 13, 14, 15, 16, 17],
};

export const LAYER_CONFIG = [
  { name: 'inner', radius: 3.2, cardWidth: 1.2, cardHeight: 0.8, speedMultiplier: 1.0, yRange: [-0.6, 0.6] as [number, number] },
  { name: 'middle', radius: 5.0, cardWidth: 0.9, cardHeight: 0.6, speedMultiplier: 1.3, yRange: [-1.2, 1.2] as [number, number] },
  { name: 'outer', radius: 6.8, cardWidth: 0.7, cardHeight: 0.47, speedMultiplier: 1.6, yRange: [-1.8, 1.8] as [number, number] },
];
