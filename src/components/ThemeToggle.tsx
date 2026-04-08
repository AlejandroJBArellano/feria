import type { ReactElement } from 'react';
import { IonItem, IonLabel, IonToggle } from '@ionic/react';
import { useTheme } from '../theme/ThemeContext';

export type ThemeToggleVariant = 'field' | 'inline';

type ThemeToggleProps = {
  /** `field`: row for lists (Cuenta). `inline`: one line for login/onboarding footers. */
  variant?: ThemeToggleVariant;
  className?: string;
};

/**
 * Light/dark preference via ThemeContext (`ion-palette-dark` on documentElement).
 */
function ThemeToggle({ variant = 'field', className }: ThemeToggleProps): ReactElement {
  const { mode, setMode } = useTheme();
  const checked = mode === 'dark';

  const apply = (next: boolean) => {
    setMode(next ? 'dark' : 'light');
  };

  if (variant === 'inline') {
    return (
      <div className={['feria-theme-inline', className].filter(Boolean).join(' ')}>
        <span className="feria-theme-inline__label">Modo oscuro</span>
        <IonToggle
          className="feria-theme-inline__toggle"
          aria-label="Activar modo oscuro"
          checked={checked}
          onIonChange={(e) => apply(e.detail.checked)}
        />
      </div>
    );
  }

  return (
    <IonItem className={['feria-theme-field', className].filter(Boolean).join(' ')} lines="none">
      <IonLabel>
        <p className="feria-theme-field__title">Apariencia</p>
        <p className="feria-theme-field__hint">Modo oscuro</p>
      </IonLabel>
      <IonToggle
        slot="end"
        aria-label="Activar modo oscuro"
        checked={checked}
        onIonChange={(e) => apply(e.detail.checked)}
      />
    </IonItem>
  );
}

export default ThemeToggle;
