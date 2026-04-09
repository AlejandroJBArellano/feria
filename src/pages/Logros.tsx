import {
    IonContent,
    IonPage,
    IonPopover,
    IonSpinner,
    IonText,
    useIonViewWillEnter
} from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import {
    getEngagementSummary,
    isFeriaApiConfigured,
    type EngagementSummary,
} from '../api/feriaApi';
import { FeriaAppShell } from '../components/FeriaAppShell';
import LogrosDashboard from '../components/LogrosDashboard';
import './Logros.css';
import {
    computeVisitDeltas,
    persistVisitSnapshot,
    readVisitSnapshot,
    type VisitDeltas,
} from './logrosSnapshot';

const Logros: React.FC = () => {
  const [data, setData] = useState<EngagementSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitDeltas, setVisitDeltas] = useState<VisitDeltas | null>(null);
  const apiReady = isFeriaApiConfigured();

  const load = useCallback(async () => {
    if (!apiReady) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const summary = await getEngagementSummary();
      setData(summary);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'No se pudo cargar logros.');
    } finally {
      setLoading(false);
    }
  }, [apiReady]);

  useIonViewWillEnter(() => {
    void load();
  });

  useEffect(() => {
    if (!data) {
      setVisitDeltas(null);
      return;
    }
    const unlockedCount = data.achievements.filter((a) => a.unlocked).length;
    const current = {
      clarityScore: data.axes.clarityScore,
      controlScore: data.axes.controlScore,
      unlockedCount,
    };
    const prev = readVisitSnapshot();
    setVisitDeltas(computeVisitDeltas(current, prev));
    persistVisitSnapshot(current);
  }, [data]);

  const unlockedCount = data?.achievements.filter((a) => a.unlocked).length ?? 0;
  const total = data?.achievements.length ?? 0;

  return (
    <IonPage className="logros-page">
      <FeriaAppShell contentClassName="logros-content">
        <div className="logros-layout ion-padding">
          <div className="logros-grid-col-summary">
            <IonText>
              <h1 className="logros-title">¡Tus Medallas y Rachas!</h1>
              <p className="feria-text-label-caps" style={{ marginBottom: 16 }}>
                Con cada registro que haces, Feria te da puntos. Acá ves lo que vas juntando con tu compa.
              </p>
            </IonText>

            <section className="logros-brand-banner" aria-label="Bienvenida de FerIA">
              <img src="/principal.png" className="logros-brand-banner__image" alt="" aria-hidden="true" />
              <div className="logros-brand-banner__copy">
                <p className="logros-brand-banner__eyebrow">Tu progreso en claro</p>
                <p className="logros-brand-banner__text">Medallas, rachas y claridad financiera en un solo vistazo.</p>
              </div>
            </section>

            {!apiReady && (
              <IonText color="medium">
                <p>Conecta la API (VITE_FERIA_API_URL) para desbloquear tus medallas.</p>
              </IonText>
            )}

            {apiReady && loading && !data && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <IonSpinner name="crescent" />
              </div>
            )}

            {error && (
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            )}

            {data && (
              <>
                <IonText>
                  <p style={{ marginBottom: 12, fontSize: '0.9rem', color: 'var(--feria-color-primary-shade)', fontWeight: '800' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: 6, verticalAlign: 'middle' }} className="material-symbols-rounded">emoji_events</span>
                    ¡Tienes {unlockedCount} de {total} medallas!
                  </p>
                </IonText>

                {data.dashboard ? (
                  <LogrosDashboard
                    dashboard={data.dashboard}
                    clarityScore={data.axes.clarityScore}
                    controlScore={data.axes.controlScore}
                    visitDeltas={visitDeltas}
                  />
                ) : (
                  <div className="logros-axes">
                    <div className="logros-axis">
                      <span className="logros-axis__label">Claridad</span>
                      <div className="logros-axis__track">
                        <div
                          className="logros-axis__fill"
                          style={{ width: `${data.axes.clarityScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="logros-axis">
                      <span className="logros-axis__label">Control del mes</span>
                      <div className="logros-axis__track">
                        <div
                          className="logros-axis__fill"
                          style={{ width: `${data.axes.controlScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {data && (
            <div className="logros-grid-col-list">
              <h2 className="logros-section-title">El Medallero</h2>

              <div className="logros-grid" role="list">
                {data.achievements.map((a) => {
                  const medalMod = a.unlocked
                    ? 'logros-hex-medal--unlocked'
                    : a.eligible
                      ? 'logros-hex-medal--eligible'
                      : 'logros-hex-medal--locked';
                  const triggerId = `logros-trigger-${a.id}`;
                  return (
                    <div key={a.id} className="logros-tile" role="listitem">
                      <button
                        type="button"
                        className="logros-tile__hit"
                        id={triggerId}
                        aria-label={`${a.title}. Toca para ver la descripción.`}
                      >
                        <div className={`logros-hex-medal ${medalMod}`} aria-hidden>
                          <span className="material-symbols-rounded logros-hex-medal__icon">
                            {a.unlocked ? 'emoji_events' : 'lock'}
                          </span>
                        </div>
                        <span className="logros-tile__title">{a.title}</span>
                      </button>
                      <IonPopover
                        trigger={triggerId}
                        triggerAction="click"
                        side="top"
                        alignment="center"
                        className="logros-desc-popover"
                      >
                        <IonContent className="logros-popover-content">
                          <p className="logros-popover__text">{a.description}</p>
                          <p className="logros-popover__meta">
                            Eje:{' '}
                            {a.axis === 'clarity' ? 'Claridad' : 'Control del mes'}
                          </p>
                        </IonContent>
                      </IonPopover>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Logros;
