/**
 * Demo movements for Movimientos screen — replace with API later.
 */

export type MovementKind = 'ingreso' | 'gasto';

export type DummyMovement = {
  id: string;
  kind: MovementKind;
  /** Positive number; sign implied by kind */
  amount: number;
  concept: string;
  category: string;
  /** ISO date yyyy-mm-dd */
  date: string;
  /** Optional one-liner suggesting AI classification (demo copy) */
  aiHint?: string;
};

export const DUMMY_MOVEMENTS: DummyMovement[] = [
  {
    id: 'm1',
    kind: 'gasto',
    amount: 189.5,
    concept: 'Supermercado',
    category: 'Comida',
    date: '2026-04-07',
    aiHint: 'Clasificado como gasto esencial',
  },
  {
    id: 'm2',
    kind: 'gasto',
    amount: 45.0,
    concept: 'Metro / movilidad',
    category: 'Transporte',
    date: '2026-04-07',
    aiHint: 'Patrón recurrente entre semana',
  },
  {
    id: 'm3',
    kind: 'ingreso',
    amount: 18500.0,
    concept: 'Nómina abril',
    category: 'Salario',
    date: '2026-04-05',
  },
  {
    id: 'm4',
    kind: 'gasto',
    amount: 349.0,
    concept: 'Streaming y apps',
    category: 'Servicios',
    date: '2026-04-05',
    aiHint: 'Suscripciones agrupadas',
  },
  {
    id: 'm5',
    kind: 'gasto',
    amount: 520.0,
    concept: 'Cena con equipo',
    category: 'Ocio',
    date: '2026-04-04',
  },
  {
    id: 'm6',
    kind: 'ingreso',
    amount: 3200.0,
    concept: 'Proyecto freelance',
    category: 'Freelance',
    date: '2026-04-03',
  },
  {
    id: 'm7',
    kind: 'gasto',
    amount: 1200.0,
    concept: 'Renta abril',
    category: 'Vivienda',
    date: '2026-04-02',
  },
  {
    id: 'm8',
    kind: 'gasto',
    amount: 89.0,
    concept: 'Farmacia',
    category: 'Salud',
    date: '2026-04-01',
  },
];

export function summarizeMovements(rows: DummyMovement[]): {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
} {
  let totalIngresos = 0;
  let totalGastos = 0;
  for (const r of rows) {
    if (r.kind === 'ingreso') {
      totalIngresos += r.amount;
    } else {
      totalGastos += r.amount;
    }
  }
  return { totalIngresos, totalGastos, balance: totalIngresos - totalGastos };
}

/** Group by ISO date descending */
export function groupByDate(rows: DummyMovement[]): Map<string, DummyMovement[]> {
  const sorted = [...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const map = new Map<string, DummyMovement[]>();
  for (const r of sorted) {
    const list = map.get(r.date);
    if (list) {
      list.push(r);
    } else {
      map.set(r.date, [r]);
    }
  }
  return map;
}
