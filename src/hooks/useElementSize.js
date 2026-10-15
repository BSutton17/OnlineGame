import { useEffect, useRef, useState } from 'react';

// The width and height an element currently has on screen.
export function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof ResizeObserver === 'undefined') {
      // Older browsers: measure on window resize instead.
      const measure = () => {
        const { width, height } = el.getBoundingClientRect();
        setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
      };
      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}
