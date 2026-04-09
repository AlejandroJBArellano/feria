const STORAGE_KEY = 'feria_logros_visit_snapshot_v1';

export type StoredVisitMetrics = {
  clarityScore: number;
  controlScore: number;
  unlockedCount: number;
};

export type VisitDeltas = {
  clarityDelta: number;
  controlDelta: number;
  unlockedDelta: number;
};

export function readVisitSnapshot(): StoredVisitMetrics | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof o.clarityScore !== 'number' ||
      typeof o.controlScore !== 'number' ||
      typeof o.unlockedCount !== 'number'
    ) {
      return null;
    }
    return {
      clarityScore: o.clarityScore,
      controlScore: o.controlScore,
      unlockedCount: o.unlockedCount,
    };
  } catch {
    return null;
  }
}

export function persistVisitSnapshot(m: StoredVisitMetrics): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    /* quota / private mode */
  }
}

export function computeVisitDeltas(
  current: StoredVisitMetrics,
  prev: StoredVisitMetrics | null
): VisitDeltas | null {
  if (!prev) {
    return null;
  }
  return {
    clarityDelta: current.clarityScore - prev.clarityScore,
    controlDelta: current.controlScore - prev.controlScore,
    unlockedDelta: current.unlockedCount - prev.unlockedCount,
  };
}
