// ICON_MAP — 82 SVG icon lookup
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
  // 片头标识图标
  ChineseRoof, LocationHome, KeyDoor, Bridge, ShieldCheck, GrowthHouse, HeartHome,
  // 通用高频图标
  Phone, Mail, Bell, Car, Bus, Plane, Walk, Globe, Sun, Camera,
  Video, Music, CreditCard, Calculator, Percent, Trophy, Crown, Diamond,
  Lightbulb, Target, Map, Gift, Eye, Flag, Compass, Palette, Coffee,
  Umbrella, Wifi, Mic, Document, Briefcase, Shield, Pool, Dumbbell,
  Elevator, Stroller, Hospital, ShoppingBasket, Park, ThumbsUp, Construction, Rocket,
  // v15 房产口播高频图标
  Contract, Receipt, Mortgage, WaterDrop, PowerMeter, GasStove, Hammer, Stamp, Villa,
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
  // 片头标识
  chineseRoof: ChineseRoof, locationHome: LocationHome, keyDoor: KeyDoor,
  bridge: Bridge, shieldCheck: ShieldCheck, growthHouse: GrowthHouse, heartHome: HeartHome,
  // 通用高频
  phone: Phone, mail: Mail, bell: Bell, car: Car, bus: Bus,
  plane: Plane, walk: Walk, globe: Globe, sun: Sun, camera: Camera,
  video: Video, music: Music, creditCard: CreditCard, calculator: Calculator,
  percent: Percent, trophy: Trophy, crown: Crown, diamond: Diamond,
  lightbulb: Lightbulb, target: Target, map: Map, gift: Gift, eye: Eye,
  flag: Flag, compass: Compass, palette: Palette, coffee: Coffee,
  umbrella: Umbrella, wifi: Wifi, mic: Mic, document: Document,
  briefcase: Briefcase, shield: Shield, pool: Pool, dumbbell: Dumbbell,
  elevator: Elevator, stroller: Stroller, hospital: Hospital,
  shoppingBasket: ShoppingBasket, park: Park, thumbsUp: ThumbsUp,
  construction: Construction, rocket: Rocket,
  // v15 房产口播高频
  contract: Contract, receipt: Receipt, mortgage: Mortgage,
  waterDrop: WaterDrop, powerMeter: PowerMeter, gasStove: GasStove,
  hammer: Hammer, stamp: Stamp, villa: Villa,
};
