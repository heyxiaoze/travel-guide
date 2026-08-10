export interface Place {
  name: string;
  copy?: string;
  sub?: string;
}

export interface DayItem {
  time?: string;
  s?: string;
  place?: Place;
  tags?: string[];
  note?: string;
}

export interface DayBlock {
  t: "day";
  no: string;
  date?: string;
  km?: string;
  title: string;
  items: DayItem[];
  sleep?: Place;
  eat?: Place[];
  note?: string;
}

export interface TextBlock {
  t: "text";
  s: string | string[];
}

export interface CalloutBlock {
  t: "callout";
  tone?: "info" | "warn" | "tip";
  title?: string;
  s: string;
}

export interface PlaceBlock {
  t: "place";
  name: string;
  copy?: string;
  sub?: string;
}

export interface PlacesBlock {
  t: "places";
  items: Place[];
}

export interface PointsBlock {
  t: "points";
  items: { k: string; v: string }[];
}

export interface ChecklistBlock {
  t: "checklist";
  groups?: { title?: string; items: string[] }[];
}

export interface TableBlock {
  t: "table";
  head: string[];
  rows: string[][];
}

export interface FoodItem {
  name: string;
  addr?: string;
  price?: string;
  src?: string;
  note?: string;
}

export interface FoodBlock {
  t: "food";
  city: string;
  flag?: string;
  items: FoodItem[];
}

export interface BudgetCell {
  k: string;
  v: string;
  n?: string;
}

export interface BudgetBlock {
  t: "budget";
  cells: BudgetCell[];
}

export interface SummaryBlock {
  t: "summary";
  rows: { k: string; v: string }[];
}

export interface GalleryItem {
  label?: string;
  title?: string;
  gradient?: string;
  src?: string;
}

export interface GalleryBlock {
  t: "gallery";
  caption?: string;
  items: GalleryItem[];
}

export type Block =
  | TextBlock
  | CalloutBlock
  | PlaceBlock
  | PlacesBlock
  | PointsBlock
  | ChecklistBlock
  | TableBlock
  | DayBlock
  | FoodBlock
  | BudgetBlock
  | SummaryBlock
  | GalleryBlock;

export interface Section {
  title: string;
  icon?: string;
  lead?: string;
  blocks: Block[];
}

export interface Fact {
  i?: string;
  k: string;
  v: string;
}

export interface Guide {
  id: string;
  updatedAt?: string;
  /** 出行形式，可多选：如 ["自驾", "公共交通"]。缺省时由 guide-filters 推断。 */
  modes?: string[];
  /** 本篇攻略去过的城市数（不含常住地，由作者维护）。用于首页统计。 */
  cities?: number;
  title: string;
  subtitle?: string;
  emoji?: string;
  color?: string;
  breadcrumb?: string[];
  badge?: string;
  facts?: Fact[];
  meta?: string[];
  sections: Section[];
}
