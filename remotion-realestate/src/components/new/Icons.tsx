// Icons.tsx - 专业图标库
// 基于 Heroicons (MIT License) 和 Lucide (ISC License)
// 开源免费商用

import React from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// 电脑/显示器
export const Computer: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

// 机器人/AI
export const Bot: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"></path>
    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
    <path d="M2 14h2"></path>
    <path d="M20 14h2"></path>
    <path d="M15 13v2"></path>
    <path d="M9 13v2"></path>
  </svg>
);

// Linux/Tux 风格的企鹅简化版
export const Penguin: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="7" ry="9"></ellipse>
    <path d="M12 8v8"></path>
    <path d="M9 12h6"></path>
    <circle cx="10" cy="9" r="1" fill={color}></circle>
    <circle cx="14" cy="9" r="1" fill={color}></circle>
    <path d="M8 18c0 2 2 3 4 3s4-1 4-3"></path>
  </svg>
);

// 闪电/速度
export const Zap: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

// 锁/安全
export const Lock: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// 工具/设置
export const Wrench: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

// 图表/数据
export const BarChart: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

// 云端
export const Cloud: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3 0 1.7 1.3 3 3 3h11c1.7 0 3-1.3 3-3z"></path>
    <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5c-.4 0-.8.1-1.2.2-.7-2.4-2.9-4.2-5.5-4.2-3.2 0-5.8 2.4-6 5.6-.4-.1-.8-.1-1.2-.1-2.5 0-4.6 2.1-4.6 4.6"></path>
  </svg>
);

// 代码
export const Code: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

// 终端
export const Terminal: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

// 列表
export const List: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// 对勾/完成
export const Check: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// 星标
export const Star: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

// 数据库
export const Database: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

// 网络/连接
export const Network: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <circle cx="5" cy="5" r="2"></circle>
    <circle cx="19" cy="5" r="2"></circle>
    <circle cx="5" cy="19" r="2"></circle>
    <circle cx="19" cy="19" r="2"></circle>
    <line x1="12" y1="9" x2="5" y2="7"></line>
    <line x1="12" y1="9" x2="19" y2="7"></line>
    <line x1="12" y1="15" x2="5" y2="17"></line>
    <line x1="12" y1="15" x2="19" y2="17"></line>
  </svg>
);

// 齿轮/设置
export const Settings: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// 箭头右
export const ArrowRight: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// 播放
export const Play: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// 下载
export const Download: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// 上传
export const Upload: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

// 搜索
export const Search: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// 消息/聊天
export const Message: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// 用户
export const User: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// 文件
export const File: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

// 文件夹
export const Folder: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

// 日历
export const Calendar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// 时钟
export const Clock: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

// 刷新/同步
export const Refresh: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

// 垃圾桶/删除
export const Trash: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

// 编辑
export const Edit: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

// 复制
export const Copy: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// 链接
export const Link: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

// 外部链接
export const ExternalLink: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

// 信息
export const Info: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// 警告
export const Alert: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// 帮助
export const Help: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// 书签
export const Bookmark: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

// 心形/收藏
export const Heart: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

// 分享
export const Share: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

// 更多菜单
export const More: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

// 菜单
export const Menu: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

// 关闭/X
export const Close: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// 加号
export const Plus: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// 减号
export const Minus: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// 检查/双对勾
export const CheckDouble: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
    <polyline points="15 6 4 17 4 12" opacity="0.5"></polyline>
  </svg>
);

// ====== 房产专用图标 ======

// 房子
export const Home: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// 公寓/楼盘
export const Building: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="1"></rect>
    <line x1="9" y1="6" x2="9" y2="10"></line>
    <line x1="15" y1="6" x2="15" y2="10"></line>
    <line x1="9" y1="14" x2="9" y2="18"></line>
    <line x1="15" y1="14" x2="15" y2="18"></line>
    <line x1="4" y1="22" x2="20" y2="22"></line>
  </svg>
);

// 高楼层/塔楼
export const Tower: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="20" rx="1"></rect>
    {[5, 8, 11, 14, 17].map(y => [
      <line key={`l-${y}`} x1="10" y1={y} x2="11" y2={y}></line>,
      <line key={`r-${y}`} x1="13" y1={y} x2="14" y2={y}></line>,
    ]).flat()}
  </svg>
);

// 地图定位
export const MapPin: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

// 面积/尺
export const Ruler: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="6" rx="1"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="7" y1="5" x2="7" y2="7"></line>
    <line x1="11" y1="5" x2="11" y2="7"></line>
    <line x1="15" y1="5" x2="15" y2="7"></line>
  </svg>
);

// 卧室
export const Bed: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"></path>
    <path d="M2 8h18a2 2 0 0 1 2 2v4H2V8z"></path>
    <path d="M22 4v16"></path>
    <path d="M6 12v2"></path>
    <path d="M18 12v2"></path>
  </svg>
);

// 浴室
export const Bath: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"></path>
    <path d="M6 12V6a4 4 0 0 1 4-4h0a3 3 0 0 1 3 3v1"></path>
  </svg>
);

// 停车位
export const Parking: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path>
  </svg>
);

// 绿化/园林
export const Tree: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22v-7"></path>
    <path d="M8 15l4-13 4 13"></path>
    <path d="M6 11l6-7 6 7"></path>
  </svg>
);

// 地铁/MTR
export const Train: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2"></rect>
    <line x1="4" y1="11" x2="20" y2="11"></line>
    <line x1="4" y1="19" x2="20" y2="19"></line>
    <circle cx="8" cy="7" r="1"></circle>
    <circle cx="16" cy="7" r="1"></circle>
    <line x1="8" y1="15" x2="8" y2="15.01"></line>
    <line x1="16" y1="15" x2="16" y2="15.01"></line>
  </svg>
);

// 学校/学区
export const School: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v10M2 10l10-7 10 7-10 7-10-7z"></path>
    <path d="M6 12v6a4 4 0 0 0 8 0v-6"></path>
  </svg>
);

// 购物/商场
export const Shopping: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

// 钥匙/收楼
export const Key: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
  </svg>
);

// 港币/金钱
export const Currency: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

// 投资回报
export const Trending: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

// 景观/视野
export const View: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  </svg>
);

// 火焰/明火煮食
export const Flame: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.55 1-6 .5.92 1.22 2 1.5 3 .5 1.38 1.5 2 1.5 3a2.5 2.5 0 0 0 2.5 2.5c1.5 0 2.5-1 2.5-2.5 0-1-.5-2-1-3 1.5 1.25 4 4 4 7a6 6 0 0 1-11.4 3"/>
  </svg>
);

// 海景
export const Waves: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6c2 2 4-2 6 0s4-2 6 0 4-2 6 0"></path>
    <path d="M2 12c2 2 4-2 6 0s4-2 6 0 4-2 6 0"></path>
    <path d="M2 18c2 2 4-2 6 0s4-2 6 0 4-2 6 0"></path>
  </svg>
);

// ====== 片头标识图标 (Opening Identity Icons) ======

// 中式屋檐 — 中山在地文化、园林项目
export const ChineseRoof: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 16L12 6l10 10"></path>
    <path d="M6 16v4h12v-4"></path>
    <line x1="9" y1="18" x2="15" y2="18" opacity="0.5"></line>
    <circle cx="12" cy="4" r="1.5" fill={color}></circle>
  </svg>
);

// 定位选房 — 区域分析、楼盘地图
export const LocationHome: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c0 0 8-6 8-11a8 8 0 0 0-16 0c0 5 8 11 8 11z"></path>
    <circle cx="12" cy="11" r="2.5"></circle>
    <polyline points="10.5 10 12 11.5 14 9.5" strokeWidth={strokeWidth * 0.85}></polyline>
  </svg>
);

// 钥匙入户 — 交房、收楼、验房
export const KeyDoor: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="9" r="4"></circle>
    <circle cx="16" cy="9" r="1.5" fill={color} opacity="0.4"></circle>
    <line x1="16" y1="12" x2="16" y2="14"></line>
    <rect x="13" y="14" width="6" height="2" rx="0.5"></rect>
    <rect x="4" y="6" width="8" height="12" rx="1.5"></rect>
    <circle cx="8" cy="12" r="1" fill={color}></circle>
  </svg>
);

// 港珠澳大桥 — 双城连接、交通优势
export const Bridge: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14L12 7l10 7"></path>
    <line x1="12" y1="7" x2="12" y2="4"></line>
    <line x1="8" y1="14" x2="8" y2="10" opacity="0.5"></line>
    <line x1="16" y1="14" x2="16" y2="10" opacity="0.5"></line>
    <path d="M4 17h16"></path>
    <path d="M6 19h4M14 19h4" opacity="0.4"></path>
  </svg>
);

// 验房保障 — 产权核实、品质承诺
export const ShieldCheck: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l9 4v5.5c0 5-4 9-9 11-5-2-9-6-9-11V6l9-4z"></path>
    <polyline points="8 12 11 14.5 16 9.5"></polyline>
  </svg>
);

// 资产增值 — 投资回报、升值分析
export const GrowthHouse: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 20V11l7-7 7 7v9h-5v-5h-4v5H5z"></path>
    <polyline points="17 8 19 6 21 8"></polyline>
    <line x1="19" y1="6" x2="19" y2="12"></line>
    <path d="M16 10l2.5-2.5L21 10" opacity="0.4"></path>
  </svg>
);

// 理想之家 — 生活方式、家庭置业
export const HeartHome: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10l8-6 8 6v10h-5v-7H9v7H4z"></path>
    <path d="M17 6c0-.8.6-2.5 2-2.5s2 1.7 2 2.5c0 1.5-2 3.5-2 3.5s-2-2-2-3.5z" fill={color} opacity="0.35"></path>
    <rect x="10" y="15" width="4" height="5"></rect>
  </svg>
);

// ====== 通用高频图标 (General Purpose Icons) ======

// 电话
export const Phone: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

// 邮件
export const Mail: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <polyline points="22 4 12 13 2 4"></polyline>
  </svg>
);

// 铃铛/通知
export const Bell: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

// 汽车/港车北上
export const Car: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.2c-.5-.4-1.2-.8-1.8-.8H12c-.6 0-1.3.4-1.8.8C9.3 8.6 8 10 8 10s-2.7.6-4.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path>
    <circle cx="7" cy="17" r="2"></circle>
    <circle cx="17" cy="17" r="2"></circle>
  </svg>
);

// 巴士/公交
export const Bus: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="14" rx="2"></rect>
    <line x1="6" y1="4" x2="18" y2="4"></line>
    <line x1="6" y1="2" x2="18" y2="2"></line>
    <line x1="6" y1="20" x2="6" y2="22"></line>
    <line x1="18" y1="20" x2="18" y2="22"></line>
    <line x1="6" y1="14" x2="14" y2="14"></line>
    <circle cx="7" cy="18" r="1"></circle>
    <circle cx="17" cy="18" r="1"></circle>
  </svg>
);

// 飞机/机场
export const Plane: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1 .7l-.6 1.8c-.1.4.1.9.5 1.1L13 13l-3 3-2.5.7-.7 2 3.5 1.5 2.5 3.5 2-.7.7-2.5 3-3 3.1 9.3c.2.4.7.6 1.1.5l1.8-.6c.5-.1.8-.5.7-1z"></path>
  </svg>
);

// 步行
export const Walk: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13" cy="4" r="2"></circle>
    <path d="m8 22 1-7 3-2"></path>
    <path d="m15 13 2 2v7"></path>
    <path d="m5 10 3 3 2-1"></path>
  </svg>
);

// 地球/国际
export const Globe: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

// 太阳/日照/朝向
export const Sun: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

// 相机
export const Camera: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

// 视频/播放器
export const Video: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2"></rect>
    <polygon points="10 8 16 12 10 16 10 8" fill={color}></polygon>
  </svg>
);

// 音乐
export const Music: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

// 信用卡/支付
export const CreditCard: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
    <line x1="4" y1="16" x2="8" y2="16"></line>
    <line x1="12" y1="16" x2="16" y2="16"></line>
  </svg>
);

// 计算器/月供
export const Calculator: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="8" y1="10" x2="8" y2="10.01"></line>
    <line x1="12" y1="10" x2="12" y2="10.01"></line>
    <line x1="16" y1="10" x2="16" y2="10.01"></line>
    <line x1="8" y1="14" x2="8" y2="14.01"></line>
    <line x1="12" y1="14" x2="12" y2="14.01"></line>
    <line x1="16" y1="14" x2="16" y2="14.01"></line>
    <line x1="8" y1="18" x2="16" y2="18"></line>
  </svg>
);

// 百分比/利率
export const Percent: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19"></line>
    <circle cx="6.5" cy="6.5" r="2.5"></circle>
    <circle cx="17.5" cy="17.5" r="2.5"></circle>
  </svg>
);

// 奖杯/奖项
export const Trophy: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"></path>
    <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"></path>
    <path d="M6 3h12v7a6 6 0 0 1-12 0V3z"></path>
    <path d="M12 16v4"></path>
    <path d="M8 20h8"></path>
  </svg>
);

// 皇冠/豪宅标识
export const Crown: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6h20l-2.5 10h-15L2 6z"></path>
    <path d="M6 6l2-4h8l2 4"></path>
    <circle cx="12" cy="6" r="1" fill={color}></circle>
    <circle cx="6" cy="6" r="1" fill={color}></circle>
    <circle cx="18" cy="6" r="1" fill={color}></circle>
  </svg>
);

// 钻石/品质
export const Diamond: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 9l10 13L22 9l-10-7z"></path>
    <path d="M2 9h20"></path>
    <path d="M12 22V9"></path>
  </svg>
);

// 灯泡/灵感/提示
export const Lightbulb: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
  </svg>
);

// 靶心/精准/目标
export const Target: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

// 地图
export const Map: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

// 礼物/优惠/赠送
export const Gift: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="2"></rect>
    <path d="M12 8V21"></path>
    <path d="M19 8H5"></path>
    <path d="M12 3C10 3 7 3 7 5.5S10 8 12 8c2 0 5 0 5-2.5S14 3 12 3z"></path>
  </svg>
);

// 眼睛/视野/景观
export const Eye: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// 旗帜/标记/里程碑
export const Flag: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);

// 指南针/方向/朝向
export const Compass: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} opacity="0.3"></polygon>
  </svg>
);

// 调色板/装修设计
export const Palette: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2" fill={color} opacity="0.3"></circle>
    <circle cx="17.5" cy="10.5" r="2" fill={color} opacity="0.3"></circle>
    <circle cx="8.5" cy="7.5" r="2" fill={color} opacity="0.3"></circle>
    <circle cx="6.5" cy="12.5" r="2" fill={color} opacity="0.3"></circle>
    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2 2 0 0 0 2-2c0-.52-.2-1.02-.59-1.41-.39-.39-.59-.89-.59-1.41 0-.55.22-1.05.59-1.41.37-.39.59-.89.59-1.41V14c0-1.1.9-2 2-2h2.53c3.59 0 6.47-3.01 6.47-6.66C22.53 3.26 17.96 2 12 2z"></path>
  </svg>
);

// 咖啡/生活品质
export const Coffee: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
    <line x1="6" y1="1" x2="6" y2="4"></line>
    <line x1="10" y1="1" x2="10" y2="4"></line>
    <line x1="14" y1="1" x2="14" y2="4"></line>
  </svg>
);

// 雨伞/保障
export const Umbrella: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"></path>
  </svg>
);

// Wifi/智能家居
export const Wifi: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <circle cx="12" cy="20" r="1" fill={color}></circle>
  </svg>
);

// 麦克风/播客
export const Mic: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

// 文档/合同
export const Document: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

// 公文包/工作
export const Briefcase: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="13" rx="2"></rect>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
    <line x1="12" y1="12" x2="12" y2="12.01"></line>
  </svg>
);

// 盾牌/安全保障
export const Shield: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

// 泳池/会所设施
export const Pool: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20c2-2 4 2 6 0s4 2 6 0 4 2 6 0"></path>
    <path d="M2 16c2-2 4 2 6 0s4 2 6 0 4 2 6 0"></path>
    <rect x="4" y="4" width="16" height="8" rx="2"></rect>
    <line x1="9" y1="4" x2="9" y2="2"></line>
    <line x1="15" y1="4" x2="15" y2="2"></line>
  </svg>
);

// 健身房
export const Dumbbell: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11v11H6.5z"></path>
    <path d="M3 8.5h3.5v7H3z"></path>
    <path d="M17.5 8.5H21v7h-3.5z"></path>
  </svg>
);

// 电梯
export const Elevator: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"></rect>
    <polyline points="15 6 12 3 9 6"></polyline>
    <polyline points="9 18 12 21 15 18"></polyline>
    <line x1="12" y1="3" x2="12" y2="21"></line>
  </svg>
);

// 婴儿车/幼儿园/亲子
export const Stroller: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="17" cy="20" r="2"></circle>
    <circle cx="7" cy="20" r="2"></circle>
    <path d="M16 18H9"></path>
    <path d="M10 10h5l5 8H7l2-4"></path>
    <path d="M15 8V4l3 2"></path>
  </svg>
);

// 医院/医疗配套
export const Hospital: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

// 菜篮/超市/生活配套
export const ShoppingBasket: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9h20l-2 12H4L2 9z"></path>
    <path d="M16 9V6a4 4 0 0 0-8 0v3"></path>
    <circle cx="9" cy="15" r="1" fill={color}></circle>
    <circle cx="15" cy="15" r="1" fill={color}></circle>
  </svg>
);

// 公园/休闲
export const Park: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 21h10"></path>
    <path d="M12 21V11"></path>
    <path d="M8 11c-3 0-5-4-3-7 0 3 2 4 4 3"></path>
    <path d="M16 11c3 0 5-4 3-7 0 3-2 4-4 3"></path>
    <path d="M9 8c-1-3 2-6 3-3 .5-1.5 4-1 3 3"></path>
  </svg>
);

// 赞/好评
export const ThumbsUp: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path>
  </svg>
);

// 建筑工地/在建
export const Construction: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2"></rect>
    <line x1="6" y1="8" x2="12" y2="8"></line>
    <line x1="18" y1="8" x2="18" y2="8.01"></line>
    <line x1="6" y1="13" x2="6" y2="13.01"></line>
    <line x1="12" y1="13" x2="12" y2="13.01"></line>
    <line x1="18" y1="13" x2="18" y2="13.01"></line>
    <line x1="6" y1="18" x2="12" y2="18"></line>
    <line x1="18" y1="18" x2="18" y2="18.01"></line>
  </svg>
);

// 火箭/速度/升值快
export const Rocket: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
  </svg>
);

// ====== 房产口播高频图标 (v15) ======

// 合同/签约 — 双合同陷阱、购房合同
export const Contract: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="8" y1="16" x2="16" y2="16"></line>
    <circle cx="17" cy="17" r="3" fill={color} opacity="0.25"></circle>
    <path d="M16 18l1.5 1.5 2.5-2.5" strokeWidth={strokeWidth * 0.7}></path>
  </svg>
);

// 税单/契税 — 税费计算、增值税
export const Receipt: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="18" height="20" rx="2"></rect>
    <line x1="7" y1="7" x2="17" y2="7"></line>
    <line x1="7" y1="11" x2="17" y2="11"></line>
    <line x1="7" y1="15" x2="13" y2="15"></line>
    <circle cx="17" cy="16" r="3" opacity="0.6"></circle>
    <line x1="17" y1="14.5" x2="17" y2="17.5"></line>
    <line x1="14.5" y1="16" x2="19.5" y2="16"></line>
  </svg>
);

// 按揭/贷款 — 月供计算、银行借贷
export const Mortgage: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
    <circle cx="12" cy="10" r="3" opacity="0.5"></circle>
    <line x1="12" y1="7" x2="12" y2="13"></line>
    <line x1="9" y1="10" x2="15" y2="10"></line>
  </svg>
);

// 水费/水龙头 — 用水成本
export const WaterDrop: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5s-5 7-5 11a5 5 0 0 0 10 0c0-4-5-11-5-11z"></path>
    <path d="M7 14.5c0 2.76 2.24 5 5 5s5-2.24 5-5" opacity="0.4"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);

// 电费/电表 — 阶梯电价、电费
export const PowerMeter: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"></rect>
    <polyline points="12 7 8 11 12 11 10 16 16 11 12 11 14 7"></polyline>
    <line x1="4" y1="9" x2="2" y2="9" opacity="0.3"></line>
    <line x1="4" y1="13" x2="2" y2="13" opacity="0.3"></line>
    <line x1="4" y1="17" x2="2" y2="17" opacity="0.3"></line>
  </svg>
);

// 燃气灶 — 燃气费用
export const GasStove: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1"></rect>
    <circle cx="8" cy="10" r="2.5"></circle>
    <circle cx="16" cy="10" r="2.5"></circle>
    <circle cx="8" cy="10" r="1" fill={color} opacity="0.4"></circle>
    <circle cx="16" cy="10" r="1" fill={color} opacity="0.4"></circle>
    <line x1="3" y1="12" x2="3" y2="18"></line>
    <line x1="21" y1="12" x2="21" y2="18"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

// 装修/锤子 — 装修成本、毛坯vs精装
export const Hammer: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12l-8.37 8.37a2.12 2.12 0 0 1-3-3L12 9"></path>
    <path d="M15 12l4-4a2 2 0 0 0 0-2.83l-.17-.17a2 2 0 0 0-2.83 0L12 9"></path>
    <line x1="2" y1="22" x2="5" y2="19"></line>
  </svg>
);

// 公章/红印 — 法律效力、合同保障
export const Stamp: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="9"></circle>
    <circle cx="12" cy="13" r="5.5" opacity="0.5"></circle>
    <path d="M7 13h10" opacity="0.4"></path>
    <path d="M9 9l1.5 8h3L15 9" opacity="0.5"></path>
  </svg>
);

// 别墅 — 别墅项目、低密度
export const Villa: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"></path>
    <path d="M4 21V10l6-5 6 5v11"></path>
    <rect x="7" y="12" width="10" height="9" opacity="0.3"></rect>
    <polyline points="7 12 12 8 17 12"></polyline>
    <line x1="10" y1="14" x2="10" y2="16"></line>
    <line x1="14" y1="14" x2="14" y2="16"></line>
    <path d="M12 8V5"></path>
  </svg>
);

