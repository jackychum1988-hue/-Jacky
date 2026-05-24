// remotion-realestate/src/components/new/IconCloud/projectData.ts

export interface ProjectData {
  id: number;
  name: string;
  district: string;
  tag: string;
  imageUrl: string;
}

// 按区域生成 SVG 渐变占位图 data URI（科技感配色）
function districtGradient(district: string): [string, string] {
  const palettes: Record<string, [string, string]> = {
    '東區':   ['#b8d4e8', '#8ab8d8'],  // 蓝 — 高端商务
    '石岐':   ['#d4c8a8', '#c8a878'],  // 暖金 — 历史底蕴
    '西區':   ['#a8d4c8', '#78b8a8'],  // 青绿 — 岐江生态
    '南區':   ['#a8c8b8', '#78a898'],  // 翠绿 — 生态宜居
    '翠亨':   ['#98b8d8', '#6898c0'],  // 深蓝 — 滨海湾区
    '三鄉':   ['#b8c8a0', '#90a878'],  // 草绿 — 山景自然
    '坦洲':   ['#c0b8d0', '#a098b8'],  // 淡紫 — 珠海门户
    '市區':   ['#b0c0d0', '#88a0b8'],  // 灰蓝 — 城市地标
    '南頭':   ['#b0b8c8', '#8898b0'],  // 银灰 — 产城融合
    '火炬':   ['#d8b8a8', '#c89878'],  // 暖橙 — 高新活力
    '古鎮':   ['#c8d0b8', '#a0b090'],  // 橄榄 — 灯都产业
    '港口':   ['#b8c8d0', '#90a8b8'],  // 蓝灰 — 港口新城
  };
  return palettes[district] || ['#b8c4d4', '#90a8c0'];
}

function makeDataUri(name: string, district: string): string {
  const [c1, c2] = districtGradient(district);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="176" viewBox="0 0 400 176">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:${c1};stop-opacity:0.7"/>
    <stop offset="100%" style="stop-color:${c2};stop-opacity:0.35"/>
  </linearGradient></defs>
  <rect width="400" height="176" rx="14" fill="url(#g)"/>
  <text x="200" y="96" text-anchor="middle" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="20" font-weight="500" fill="rgba(44,62,80,0.45)">${name}</text>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// 38 个中山在售楼盘
export const PROJECTS: ProjectData[] = [
  // ===== 1-6 市中心核心热门盘 =====
  { id: 1,  name: '江山和鸣',            district: '石岐', tag: '四代宅·使用率145%',  imageUrl: makeDataUri('江山和鸣', '石岐') },
  { id: 2,  name: '保利琅悦',            district: '東區', tag: '四代奢宅標杆',        imageUrl: makeDataUri('保利琅悦', '東區') },
  { id: 3,  name: '囍滙·Central Peak',   district: '東區', tag: '豪宅·203-316㎡',      imageUrl: makeDataUri('囍滙·Central Peak', '東區') },
  { id: 4,  name: '御宸',               district: '石岐', tag: '四代宅·容積率1.99',   imageUrl: makeDataUri('御宸', '石岐') },
  { id: 5,  name: '建华龙湖·香山颂',      district: '石岐', tag: '2025銷冠·四代宅',    imageUrl: makeDataUri('建华龙湖·香山颂', '石岐') },
  { id: 6,  name: '遠洋天著',            district: '南區', tag: '鴻蒙智慧大平層',      imageUrl: makeDataUri('遠洋天著', '南區') },

  // ===== 7-12 市区改善盘 =====
  { id: 7,  name: '中山108天寓',          district: '東區', tag: '住宅+公寓',          imageUrl: makeDataUri('中山108天寓', '東區') },
  { id: 8,  name: '華潤仁恒公園四季2期',   district: '西區', tag: '住宅·95-142㎡',     imageUrl: makeDataUri('華潤仁恒公園四季2期', '西區') },
  { id: 9,  name: '幸福匯',              district: '西區', tag: '岐江現房',            imageUrl: makeDataUri('幸福匯', '西區') },
  { id: 10, name: '展睿·江樾灣',          district: '石岐', tag: '現房·性價比之王',    imageUrl: makeDataUri('展睿·江樾灣', '石岐') },
  { id: 11, name: '錦繡海灣城',           district: '翠亨', tag: '濱海萬畝大盤',       imageUrl: makeDataUri('錦繡海灣城', '翠亨') },
  { id: 12, name: '華發觀山水',           district: '三鄉', tag: '山景大盤',           imageUrl: makeDataUri('華發觀山水', '三鄉') },

  // ===== 13-18 坦洲三乡港人热门 + 公寓 =====
  { id: 13, name: '佳境康城',            district: '坦洲', tag: '港資住宅',            imageUrl: makeDataUri('佳境康城', '坦洲') },
  { id: 14, name: '錦繡國際花城',         district: '坦洲', tag: '湖景住宅',            imageUrl: makeDataUri('錦繡國際花城', '坦洲') },
  { id: 15, name: '雅居樂·萬象郡',        district: '三鄉', tag: '成熟社區',            imageUrl: makeDataUri('雅居樂·萬象郡', '三鄉') },
  { id: 16, name: '中澳春城',            district: '坦洲', tag: '坦洲熱搜TOP1',       imageUrl: makeDataUri('中澳春城', '坦洲') },
  { id: 17, name: '港航匯',              district: '市區', tag: '精裝公寓·21.8萬起',   imageUrl: makeDataUri('港航匯', '市區') },
  { id: 18, name: '海雅繽紛城',           district: '南頭', tag: '商辦綜合體',          imageUrl: makeDataUri('海雅繽紛城', '南頭') },

  // ===== 19-24 東區/石岐/西區/南區（新增核心城区） =====
  { id: 19, name: '保利香山瑧悦府',        district: '東區', tag: '保利高端·紫馬嶺',    imageUrl: makeDataUri('保利香山瑧悦府', '東區') },
  { id: 20, name: '朗詩金鐘湖壹號',        district: '東區', tag: '金鐘湖科技住宅',     imageUrl: makeDataUri('朗詩金鐘湖壹號', '東區') },
  { id: 21, name: '華發學府壹號',          district: '石岐', tag: '學府旁·已交房',      imageUrl: makeDataUri('華發學府壹號', '石岐') },
  { id: 22, name: '金鷹半山花園',          district: '石岐', tag: '總部經濟區高端住宅',   imageUrl: makeDataUri('金鷹半山花園', '石岐') },
  { id: 23, name: '華立富華薈',           district: '西區', tag: '富華道·65-107平',    imageUrl: makeDataUri('華立富華薈', '西區') },
  { id: 24, name: '懿臻山',              district: '南區', tag: '高端住宅·13k-17k',    imageUrl: makeDataUri('懿臻山', '南區') },

  // ===== 25-30 南區/翠亨（生態+馬鞍島新區） =====
  { id: 25, name: '碧桂園·鳳凰城',         district: '南區', tag: '大型生態社區·8k起',  imageUrl: makeDataUri('碧桂園·鳳凰城', '南區') },
  { id: 26, name: '招商臻灣府',            district: '翠亨', tag: '深中通道·79-119平',  imageUrl: makeDataUri('招商臻灣府', '翠亨') },
  { id: 27, name: '中山粵海城',            district: '翠亨', tag: '一線臨海現房',       imageUrl: makeDataUri('中山粵海城', '翠亨') },
  { id: 28, name: '中興智慧城·懿禧府',      district: '翠亨', tag: '地鐵上蓋·馬鞍島',    imageUrl: makeDataUri('中興智慧城·懿禧府', '翠亨') },
  { id: 29, name: '保利天匯·熙岸',         district: '翠亨', tag: '復式·使用率107%',    imageUrl: makeDataUri('保利天匯·熙岸', '翠亨') },
  { id: 30, name: '雅居樂灣際壹號',         district: '翠亨', tag: '灣區綜合體',         imageUrl: makeDataUri('雅居樂灣際壹號', '翠亨') },

  // ===== 31-33 火炬開發區 =====
  { id: 31, name: '御峰香林',             district: '火炬', tag: '低密改善·高得房率',   imageUrl: makeDataUri('御峰香林', '火炬') },
  { id: 32, name: '火炬建發·望江台',       district: '火炬', tag: '一線江景·7.2k起',    imageUrl: makeDataUri('火炬建發·望江台', '火炬') },
  { id: 33, name: '東方名都',             district: '火炬', tag: '東南亞園林·無邊泳池',  imageUrl: makeDataUri('東方名都', '火炬') },

  // ===== 34-35 坦洲（港人熱門） =====
  { id: 34, name: '逸駿半島',             district: '坦洲', tag: '近珠海50米·60萬平',  imageUrl: makeDataUri('逸駿半島', '坦洲') },
  { id: 35, name: '優越香格里',            district: '坦洲', tag: '大型成熟社區',        imageUrl: makeDataUri('優越香格里', '坦洲') },

  // ===== 36-38 古鎮/港口/南頭 =====
  { id: 36, name: '保利·和光塵樾',         district: '古鎮', tag: '保利高端·14.5k起',  imageUrl: makeDataUri('保利·和光塵樾', '古鎮') },
  { id: 37, name: '星晨·君悅灣',           district: '港口', tag: '近市區·8k/平',       imageUrl: makeDataUri('星晨·君悅灣', '港口') },
  { id: 38, name: '鉑灣半島',             district: '南頭', tag: '濱水住宅·2026交房',   imageUrl: makeDataUri('鉑灣半島', '南頭') },
];
