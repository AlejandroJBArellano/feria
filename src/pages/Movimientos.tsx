import { IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonText } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApiMovement } from '../api/feriaApi';
import { getVoiceJob, isFeriaApiConfigured, listMovements } from '../api/feriaApi';
import { FeriaAppShell } from '../components/FeriaAppShell';
import {
    DUMMY_MOVEMENTS,
    type DummyMovement,
    groupByDate,
    summarizeMovements,
} from '../data/dummyMovements';
import { clearPendingVoiceJobId, getPendingVoiceJobId } from '../voice/voiceJobStorage';
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
        <span className="movimientos-card__kind">{isGasto ? 'Salida' : 'Entrada'}</span>
      </div>
    </li>
  );
}

const Movimientos: React.FC = () => {
  const [rows, setRows] = useState<DummyMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(!isFeriaApiConfigured());
  const [pendingVoiceJobId, setPendingVoiceJobId] = useState<string | null>(() => getPendingVoiceJobId());

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

  useEffect(() => {
    if (!isFeriaApiConfigured() && pendingVoiceJobId) {
      clearPendingVoiceJobId();
      setPendingVoiceJobId(null);
    }
  }, [pendingVoiceJobId]);

  useEffect(() => {
    if (!pendingVoiceJobId || !isFeriaApiConfigured()) {
      return;
    }

    let cancelled = false;
    const delay = (ms: number) => new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

    const pollVoiceJob = async () => {
      try {
        let attempts = 0;
        while (!cancelled && attempts < 180) {
          attempts += 1;
          try {
            const job = await getVoiceJob(pendingVoiceJobId);
            setError(null);
            if (job.status === 'completed') {
              for (let attempt = 0; attempt < 4 && !cancelled; attempt += 1) {
                await load();
                if (attempt < 3) {
                  await delay(1500);
                }
              }
              clearPendingVoiceJobId();
              setPendingVoiceJobId(null);
              return;
            }
            if (job.status === 'failed') {
              clearPendingVoiceJobId();
              setPendingVoiceJobId(null);
              setError(job.error || 'No se pudo procesar el audio');
              return;
            }
          } catch (e) {
            if (!cancelled) {
              setError(e instanceof Error ? e.message : 'No se pudo consultar el estado del audio');
            }
          }
          await delay(2000);
        }

        if (!cancelled) {
          clearPendingVoiceJobId();
          setPendingVoiceJobId(null);
          setError('El procesamiento tardó demasiado. Intenta grabar de nuevo.');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudo consultar el estado del audio');
        }
      }
    };

    void pollVoiceJob();

    return () => {
      cancelled = true;
    };
  }, [load, pendingVoiceJobId]);

  const summary = useMemo(() => summarizeMovements(rows), [rows]);
  const grouped = useMemo(() => groupByDate(rows), [rows]);
  const isProcessingVoice = Boolean(pendingVoiceJobId);

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
          <div className="movimientos-grid-col-summary">
            <div className="movimientos-ai-strip">
              <span aria-hidden="true" style={{ fontSize: '1.2rem'}}>✨</span>
              <span>
                {isProcessingVoice
                  ? 'FerIA está procesando tu audio en chinga...'
                  : demoMode
                  ? 'Modo prueba: Así se verá tu lana'
                  : 'Todo chido, esta es tu lana registrada'}
              </span>
            </div>

            {isProcessingVoice && (
              <div className="movimientos-insight movimientos-processing">
                <IonSpinner name="crescent" />
                <p className="movimientos-insight__text">
                  Estamos procesando tu audio en segundo plano. Los movimientos aparecerán aquí cuando termine.
                </p>
              </div>
            )}

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

            {!loading && !demoMode && !isProcessingVoice && (
              <div className="movimientos-insight">
                <p className="movimientos-insight__text">
                  Lista actualizada al cien. Tira hacia abajo para refrescar tu lana.
                </p>
              </div>
            )}

            {demoMode && !loading && !isProcessingVoice && (
              <div className="movimientos-insight">
                <p className="movimientos-insight__text">
                  Esta semana tus gastos en <strong>transporte</strong> están un{' '}
                  <strong>12% por debajo</strong> de tu media habitual (demo).
                </p>
              </div>
            )}

            <div className="movimientos-stats">
              <div className="movimientos-stat">
                <span className="movimientos-stat__label">Entró</span>
                <span className="movimientos-stat__value">{currencyFmt.format(summary.totalIngresos)}</span>
              </div>
              <div className="movimientos-stat">
                <span className="movimientos-stat__label">Salió</span>
                <span className="movimientos-stat__value">{currencyFmt.format(summary.totalGastos)}</span>
              </div>
              <div className="movimientos-stat movimientos-stat--balance">
                <span className="movimientos-stat__label">Te Queda</span>
                <span className="movimientos-stat__value">{currencyFmt.format(summary.balance)}</span>
              </div>
            </div>
          </div>

          <div className="movimientos-grid-col-list">
            <h2 className="movimientos-section-title">Tus Movimientos</h2>

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

            {!loading && rows.length === 0 && !demoMode && !error && !isProcessingVoice && (
              <IonText color="medium">
                <p>No hay lana registrada aún. ¡Pícale al botón de Inicio y háblale a FerIA!</p>
              </IonText>
            )}
          </div>
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Movimientos;
