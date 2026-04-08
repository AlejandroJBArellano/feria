import type { ReactElement } from 'react';
import { IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonText } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listMovements, isFeriaApiConfigured } from '../api/feriaApi';
import type { ApiMovement } from '../api/feriaApi';
import {
  DUMMY_MOVEMENTS,
  type DummyMovement,
  groupByDate,
  summarizeMovements,
} from '../data/dummyMovements';
import { FeriaAppShell } from '../components/FeriaAppShell';
import './Movimientos.css';

const currencyFmt = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

function apiToDummy(m: ApiMovement): DummyMovement {
  const dateStr = m.movementDate ?? m.createdAt.slice(0, 10);
  return {
    id: m.id,
    kind: m.kind,
    amount: m.amount,
    concept: m.concept,
    category: m.category,
    date: dateStr,
  };
}

function formatDayHeading(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  const yday = new Date(today);
  yday.setDate(yday.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) {
    return 'Hoy';
  }
  if (sameDay(d, yday)) {
    return 'Ayer';
  }
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
}

function MovementCard({ row }: { row: DummyMovement }): ReactElement {
  const isGasto = row.kind === 'gasto';
  const sign = isGasto ? '−' : '+';
  const amountClass = isGasto
    ? 'movimientos-card__amount-value movimientos-card__amount-value--gasto'
    : 'movimientos-card__amount-value movimientos-card__amount-value--ingreso';

  return (
    <li className="movimientos-card">
      <div className="movimientos-card__left">
        <p className="movimientos-card__concept">{row.concept}</p>
        <div className="movimientos-card__meta">
          <span className="movimientos-card__chip">{row.category}</span>
        </div>
        {row.aiHint ? <p className="movimientos-card__hint">{row.aiHint}</p> : null}
      </div>
      <div className="movimientos-card__amount">
        <span className={amountClass}>
          {sign}
          {currencyFmt.format(row.amount)}
        </span>
        <span className="movimientos-card__kind">{isGasto ? 'Gasto' : 'Ingreso'}</span>
      </div>
    </li>
  );
}

const Movimientos: React.FC = () => {
  const [rows, setRows] = useState<DummyMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(!isFeriaApiConfigured());

  const load = useCallback(async () => {
    if (!isFeriaApiConfigured()) {
      setRows(DUMMY_MOVEMENTS);
      setDemoMode(true);
      setError(null);
      setLoading(false);
      return;
    }
    setDemoMode(false);
    setError(null);
    try {
      const apiRows = await listMovements();
      setRows(apiRows.map(apiToDummy));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los movimientos');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => summarizeMovements(rows), [rows]);
  const grouped = useMemo(() => groupByDate(rows), [rows]);

  return (
    <IonPage className="movimientos-page">
      <FeriaAppShell contentClassName="movimientos-content">
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (ev) => {
            await load();
            ev.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <div className="movimientos-body ion-padding">
          <div className="movimientos-ai-strip">
            <IonIcon icon={sparklesOutline} aria-hidden />
            <span>
              {demoMode
                ? 'Resumen asistido · datos de demostración'
                : 'Resumen asistido · tus movimientos'}
            </span>
          </div>

          {loading && (
            <div className="movimientos-loading">
              <IonSpinner name="crescent" />
            </div>
          )}

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          {!loading && !demoMode && (
            <div className="movimientos-insight">
              <p className="movimientos-insight__text">
                Lista actualizada desde la API. Tira hacia abajo para refrescar.
              </p>
            </div>
          )}

          {demoMode && !loading && (
            <div className="movimientos-insight">
              <p className="movimientos-insight__text">
                Esta semana tus gastos en <strong>transporte</strong> están un{' '}
                <strong>12% por debajo</strong> de tu media habitual (demo).
              </p>
            </div>
          )}

          <div className="movimientos-stats">
            <div className="movimientos-stat">
              <span className="movimientos-stat__label">Ingresos</span>
              <span className="movimientos-stat__value">{currencyFmt.format(summary.totalIngresos)}</span>
            </div>
            <div className="movimientos-stat">
              <span className="movimientos-stat__label">Gastos</span>
              <span className="movimientos-stat__value">{currencyFmt.format(summary.totalGastos)}</span>
            </div>
            <div className="movimientos-stat movimientos-stat--balance">
              <span className="movimientos-stat__label">Balance</span>
              <span className="movimientos-stat__value">{currencyFmt.format(summary.balance)}</span>
            </div>
          </div>

          <h2 className="movimientos-section-title">Actividad reciente</h2>

          {!loading &&
            Array.from(grouped.entries()).map(([date, dayRows]) => (
              <section key={date}>
                <h3 className="movimientos-date-heading">{formatDayHeading(date)}</h3>
                <ul className="movimientos-list">
                  {dayRows.map((row) => (
                    <MovementCard key={row.id} row={row} />
                  ))}
                </ul>
              </section>
            ))}

          {!loading && rows.length === 0 && !demoMode && !error && (
            <IonText color="medium">
              <p>No hay movimientos aún. Graba una nota en Inicio.</p>
            </IonText>
          )}
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Movimientos;
