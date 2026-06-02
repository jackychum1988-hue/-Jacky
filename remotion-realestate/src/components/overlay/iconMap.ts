// ICON_MAP — 63 SVG icon lookup
// 用于 overlay 卡片组件的 icon prop (string → React component)
import React from 'react';
import {
  Computer, Bot, Penguin, Zap, Lock, Wrench, BarChart, Cloud,
  Code, Terminal, List, Check, Star, Database, Network, Settings,
  ArrowRight, Play, Download, Upload, Search, Message, User,
  File, Folder, Calendar, Clock, Refresh, Trash, Edit, Copy,
  Link, ExternalLink, Info, Alert, Help, Bookmark, Heart, Share,
  More, Menu, Close, Plus, Minus, CheckDouble,
  Home, Building, Tower, MapPin, Ruler, Bed, Bath, Parking,
  Tree, Train, School, Shopping, Key, Currency, Trending, View,
  Flame, Waves,
} from '../new/Icons';

type IconComponent = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

export const ICON_MAP: Record<string, IconComponent> = {
  computer: Computer, bot: Bot, penguin: Penguin, zap: Zap,
  lock: Lock, wrench: Wrench, barChart: BarChart, cloud: Cloud,
  code: Code, terminal: Terminal, list: List, check: Check,
  star: Star, database: Database, network: Network, settings: Settings,
  arrowRight: ArrowRight, play: Play, download: Download, upload: Upload,
  search: Search, message: Message, user: User,
  file: File, folder: Folder, calendar: Calendar, clock: Clock,
  refresh: Refresh, trash: Trash, edit: Edit, copy: Copy,
  link: Link, externalLink: ExternalLink, info: Info, alert: Alert,
  help: Help, bookmark: Bookmark, heart: Heart, share: Share,
  more: More, menu: Menu, close: Close, plus: Plus,
  minus: Minus, checkDouble: CheckDouble,
  home: Home, building: Building, tower: Tower, mapPin: MapPin,
  ruler: Ruler, bed: Bed, bath: Bath, parking: Parking,
  tree: Tree, train: Train, school: School, shopping: Shopping,
  key: Key, currency: Currency, trending: Trending, view: View,
  flame: Flame, waves: Waves,
};
