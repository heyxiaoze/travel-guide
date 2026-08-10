/**
 * Free image host registry.
 *
 * We use LoremFlickr (https://loremflickr.com) — a free, hotlinkable image host
 * that returns Creative-Commons photos by keyword, no API key required.
 * The `lock` parameter pins a stable image per keyword so banners don't change
 * on every reload.
 *
 * Swap the `lf()` helper for any other free host (e.g. picsum, unsplash source)
 * without touching the components.
 */
const lf = (w: number, h: number, tags: string, lock: number) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

export interface GuideImageSet {
  /** Single cover image (used on guide cards). */
  cover: string;
  /** Multiple images -> rendered as a swipeable banner. */
  banner: string[];
}

export const GUIDE_IMAGES: Record<string, GuideImageSet> = {
  "qinggan-2026": {
    cover: lf(800, 450, "qinghai,lake", 11),
    banner: [
      lf(1600, 800, "qinghai,lake", 21),
      lf(1600, 800, "qinghai,grassland", 22),
      lf(1600, 800, "salt,lake", 23),
      lf(1600, 800, "road,trip", 24),
      lf(1600, 800, "grassland,sheep", 25),
    ],
  },
  "chuanyu-2026": {
    cover: lf(800, 450, "chongqing", 31),
    banner: [
      lf(1600, 800, "chongqing", 41),
      lf(1600, 800, "chongqing,night", 42),
      lf(1600, 800, "sichuan,mountain", 43),
      lf(1600, 800, "panda", 44),
      lf(1600, 800, "china,food", 45),
    ],
  },
};

/** Home hero banner (general travel imagery). */
export const HOME_BANNER: string[] = [
  lf(1600, 800, "travel,landscape", 51),
  lf(1600, 800, "mountain,lake", 52),
  lf(1600, 800, "roadtrip", 53),
  lf(1600, 800, "camping", 54),
  lf(1600, 800, "lake,sunset", 55),
];

export function guideCover(id: string): string | undefined {
  return GUIDE_IMAGES[id]?.cover;
}

export function guideBanner(id: string): string[] {
  return GUIDE_IMAGES[id]?.banner ?? [];
}
