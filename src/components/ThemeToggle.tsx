import type { ReactElement } from 'react';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/react';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/ThemeContext';

type ThemeToggleProps = {
  className?: string;
};

/**
 * Compact light/dark switch; uses ThemeContext (class `ion-palette-dark` on documentElement).
 */
function ThemeToggle({ className }: ThemeToggleProps): ReactElement {
  const { mode, setMode } = useTheme();

  return (
    <IonSegment
      className={className ? `feria-theme-toggle ${className}` : 'feria-theme-toggle'}
      value={mode}
      onIonChange={(e) => {
        const v = e.detail.value as ThemeMode | undefined;
        if (v === 'light' || v === 'dark') {
          setMode(v);
        }
      }}
    >
      <IonSegmentButton value="light">
        <IonLabel>Claro</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton value="dark">
        <IonLabel>Oscuro</IonLabel>
      </IonSegmentButton>
    </IonSegment>
  );
}

export default ThemeToggle;
