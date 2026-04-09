import type { CSSProperties } from 'react';
import { IonIcon } from '@ionic/react';
import {
  calendarOutline,
  flameOutline,
  schoolOutline,
  trendingDownOutline,
  trendingUpOutline,
  removeOutline,
} from 'ionicons/icons';
import type { EngagementDashboard } from '../api/feriaApi';
import type { VisitDeltas } from '../pages/logrosSnapshot';
import { MarkdownRenderer } from './MarkdownRenderer';

type Props = {
  dashboard: EngagementDashboard;
  clarityScore: number;
  controlScore: number;
  visitDeltas: VisitDeltas | null;
};

function impulseTier(index: number): { label: string; sub: string } {
  if (index >= 78) {
    return { label: 'Impulso alto', sub: 'Tu constancia y medallas se notan.' };
  }
  if (index >= 52) {
    return { label: 'Buen ritmo', sub: 'Vas construyendo claridad y hábito.' };
  }
  if (index >= 28) {
    return { label: 'En construcción', sub: 'Cada registro empuja el indicador.' };
  }
  return { label: 'Arranque', sub: 'Empieza suave: un movimiento ya cuenta.' };
}

function weekTrendCopy(trend: EngagementDashboard['registrationWeekTrend']): string {
  if (trend === 'up') {
    return 'Más registros que la semana anterior.';
  }
  if (trend === 'down') {
    return 'Menos registros que la semana pasada. Un día basta para retomar.';
  }
  return 'Mismo ritmo de registros que la semana anterior.';
}

function formatDelta(
  n: number,
  axis: 'clarity' | 'control' | 'medals'
): string | null {
  if (n === 0) {
    return null;
  }
  const sign = n > 0 ? '+' : '';
  if (axis === 'clarity') {
    return `${sign}${n} pts claridad`;
  }
  if (axis === 'control') {
    return `${sign}${n} pts control`;
  }
  const w = Math.abs(n) === 1 ? 'medalla' : 'medallas';
  return `${sign}${n} ${w}`;
}

const LogrosDashboard = ({
  dashboard,
  clarityScore,
  controlScore,
  visitDeltas,
}: Props) => {
  const tier = impulseTier(dashboard.impulseIndex);
  const weekIcon =
    dashboard.registrationWeekTrend === 'up'
      ? trendingUpOutline
      : dashboard.registrationWeekTrend === 'down'
        ? trendingDownOutline
        : removeOutline;
  const weekIconClass =
    dashboard.registrationWeekTrend === 'up'
      ? 'logros-dash__trend--up'
      : dashboard.registrationWeekTrend === 'down'
        ? 'logros-dash__trend--down'
        : 'logros-dash__trend--same';

  const visitLine = (() => {
    if (!visitDeltas) {
      return null;
    }
    const parts = [
      formatDelta(visitDeltas.clarityDelta, 'clarity'),
      formatDelta(visitDeltas.controlDelta, 'control'),
      formatDelta(visitDeltas.unlockedDelta, 'medals'),
    ].filter((s): s is string => Boolean(s));
    return parts.length > 0 ? parts.join(' · ') : null;
  })();

  return (
    <section className="logros-dash" aria-label="Panel de mejora">
      <h2 className="logros-dash__heading">Cómo vas</h2>
      <p className="logros-dash__lede">
        Comparado con tu semana anterior y tu última visita a esta pantalla.
      </p>

      <div className="logros-dash__hero">
        <div
          className="logros-dash__ring"
          style={
            {
              '--logros-impulse-pct': `${dashboard.impulseIndex}`,
            } as CSSProperties
          }
          aria-hidden
        >
          <div className="logros-dash__ring-inner">
            <span className="logros-dash__ring-value">{dashboard.impulseIndex}</span>
            <span className="logros-dash__ring-label">índice impulso</span>
          </div>
        </div>
        <div className="logros-dash__hero-copy">
          <p className="logros-dash__tier">{tier.label}</p>
          <p className="logros-dash__tier-sub">{tier.sub}</p>
        </div>
      </div>

      {dashboard.dailyInsight && (
        <div className="logros-dash__insight">
          <h3 className="logros-dash__insight-heading">Resumen Diario con IA</h3>
          <div className="logros-dash__insight-content chat-bubble--assistant">
            <MarkdownRenderer text={dashboard.dailyInsight} />
          </div>
        </div>
      )}

      <div className="logros-dash__tiles">
        <div className="logros-dash__tile">
          <IonIcon icon={calendarOutline} className="logros-dash__tile-icon" />
          <div className="logros-dash__tile-body">
            <span className="logros-dash__tile-kicker">Últimos 7 días</span>
            <span className="logros-dash__tile-value">
              {dashboard.movementCountLast7d} registros
            </span>
            <span className="logros-dash__tile-meta">
              vs {dashboard.movementCountPrev7d} la semana previa
            </span>
            <div className={`logros-dash__trend ${weekIconClass}`}>
              <IonIcon icon={weekIcon} />
              <span>{weekTrendCopy(dashboard.registrationWeekTrend)}</span>
            </div>
          </div>
        </div>

        <div className="logros-dash__tile">
          <IonIcon icon={flameOutline} className="logros-dash__tile-icon" />
          <div className="logros-dash__tile-body">
            <span className="logros-dash__tile-kicker">Racha</span>
            <span className="logros-dash__tile-value">
              {dashboard.streakDays === 0
                ? 'Sin racha aún'
                : `${dashboard.streakDays} día${dashboard.streakDays === 1 ? '' : 's'} seguidos`}
            </span>
            <span className="logros-dash__tile-meta">
              {dashboard.hasMovementToday
                ? 'Hoy ya registraste algo.'
                : 'Hoy aún no hay registros.'}
            </span>
          </div>
        </div>

        <div className="logros-dash__tile">
          <IonIcon icon={schoolOutline} className="logros-dash__tile-icon" />
          <div className="logros-dash__tile-body">
            <span className="logros-dash__tile-kicker">Tutor</span>
            <span className="logros-dash__tile-value">
              {dashboard.hasUsedTutor ? 'Ya lo probaste' : 'Sin conversaciones aún'}
            </span>
            <span className="logros-dash__tile-meta">
              {dashboard.hasUsedTutor
                ? 'Sigue usando el tutor cuando quieras panorama.'
                : 'El tutor resume tu situación con lo que registras.'}
            </span>
          </div>
        </div>
      </div>

      <div className="logros-dash__axes-mini">
        <div className="logros-dash__axis-mini">
          <span className="logros-dash__axis-mini-label">Claridad</span>
          <div className="logros-dash__axis-mini-track">
            <div
              className="logros-dash__axis-mini-fill logros-dash__axis-mini-fill--clarity"
              style={{ width: `${clarityScore}%` }}
            />
          </div>
          <span className="logros-dash__axis-mini-pct">{clarityScore}%</span>
        </div>
        <div className="logros-dash__axis-mini">
          <span className="logros-dash__axis-mini-label">Control</span>
          <div className="logros-dash__axis-mini-track">
            <div
              className="logros-dash__axis-mini-fill logros-dash__axis-mini-fill--control"
              style={{ width: `${controlScore}%` }}
            />
          </div>
          <span className="logros-dash__axis-mini-pct">{controlScore}%</span>
        </div>
      </div>

      {visitLine && (
        <p className="logros-dash__visit-footnote">
          <strong>Desde tu última visita:</strong> {visitLine}
        </p>
      )}
      {visitDeltas && !visitLine && (
        <p className="logros-dash__visit-footnote logros-dash__visit-footnote--muted">
          Desde tu última visita los puntajes de medallas no cambiaron.
        </p>
      )}
    </section>
  );
};

export default LogrosDashboard;
