import { useState } from 'react';
import type { ViewMode } from '@/types';

const STORAGE_KEY = 'tv-shows:series-view-mode';

function readMode(): ViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'cards' || stored === 'list') return stored;
  } catch {
    // SSR guard
  }
  return 'cards';
}

export function useSeriesViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setModeState] = useState<ViewMode>(readMode);

  function setMode(newMode: ViewMode) {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // no-op
    }
    setModeState(newMode);
  }

  return [mode, setMode];
}
