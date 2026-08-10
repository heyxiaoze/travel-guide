import { useEffect, useRef, useState } from "react";

/**
 * 数字滚动增长动画（参考 animata.design 的 count-up 效果）。
 * 组件进入视口（或挂载时为可见状态）后，从 0 缓动到 target。
 * 尊重 prefers-reduced-motion：直接显示终值，不做动画。
 */
export function useCountUp(
  target: number,
  { duration = 1400 }: { duration?: number } = {}
): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(target * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}
