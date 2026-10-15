import { useEffect, useState } from 'react';

// One place decides which layout to use, and everything (CSS classes and the
// board's rotation) follows it. It listens for changes, so rotating a phone
// re-lays the screen straight away.
const PORTRAIT = '(orientation: portrait)';
const COMPACT = '(orientation: landscape) and (max-height: 540px)';

export function currentLayout() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'wide';
  if (window.matchMedia(PORTRAIT).matches) return 'portrait';
  if (window.matchMedia(COMPACT).matches) return 'compact';
  return 'wide';
}

export function useLayout() {
  const [layout, setLayout] = useState(currentLayout);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const update = () => setLayout(currentLayout());
    const queries = [window.matchMedia(PORTRAIT), window.matchMedia(COMPACT)];
    for (const q of queries) q.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      for (const q of queries) q.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return layout;
}
