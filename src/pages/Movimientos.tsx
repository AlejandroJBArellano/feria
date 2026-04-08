import type { ReactElement } from 'react';
import { IonIcon, IonPage } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import { useMemo } from 'react';
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
  const summary = useMemo(() => summarizeMovements(DUMMY_MOVEMENTS), []);
  const grouped = useMemo(() => groupByDate(DUMMY_MOVEMENTS), []);

  return (
    <IonPage className="movimientos-page">
      <FeriaAppShell contentClassName="movimientos-content">
        <div className="movimientos-body ion-padding">
          <div className="movimientos-ai-strip">
            <IonIcon icon={sparklesOutline} aria-hidden />
            <span>Resumen asistido · datos de demostración</span>
          </div>

          <div className="movimientos-insight">
            <p className="movimientos-insight__text">
              Esta semana tus gastos en <strong>transporte</strong> están un{' '}
              <strong>12% por debajo</strong> de tu media habitual (demo).
            </p>
          </div>

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

          {Array.from(grouped.entries()).map(([date, rows]) => (
            <section key={date}>
              <h3 className="movimientos-date-heading">{formatDayHeading(date)}</h3>
              <ul className="movimientos-list">
                {rows.map((row) => (
                  <MovementCard key={row.id} row={row} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Movimientos;
