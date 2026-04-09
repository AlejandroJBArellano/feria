import { IonContent, IonFooter, IonHeader, IonToolbar } from '@ionic/react';
import type { ReactElement, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export type FeriaAppShellProps = {
  children: ReactNode;
  /** Right side of header (optional). Theme control is under Cuenta. */
  headerEnd?: React.ReactNode;
  /** Merged onto IonContent (e.g. home-content, login-content). */
  contentClassName?: string;
  /**
   * When true (default), content can scroll under header/footer — fine for centered pages.
   * Set false for bottom-heavy layouts (e.g. Tutor composer) so the footer tabs do not cover inputs.
   */
  contentFullscreen?: boolean;
};

/**
 * Shared chrome: header with wordmark, scrollable main, footer section nav.
 */
function FeriaAppFooterNav(): ReactElement {
  return (
    <nav className="feria-app-footer__nav" aria-label="Secciones de la app">
      <NavLink to="/home" className="feria-app-footer__link" activeClassName="is-active" exact>
        <span className="feria-app-footer__link-inner">
          <span className="material-symbols-rounded feria-app-footer__icon" aria-hidden>home</span>
          <span className="feria-app-footer__label">Inicio</span>
        </span>
      </NavLink>
      <NavLink to="/logros" className="feria-app-footer__link" activeClassName="is-active" exact>
        <span className="feria-app-footer__link-inner">
          <span className="material-symbols-rounded feria-app-footer__icon" aria-hidden>emoji_events</span>
          <span className="feria-app-footer__label">Logros</span>
        </span>
      </NavLink>
      <NavLink
        to="/movimientos"
        className="feria-app-footer__link"
        activeClassName="is-active"
        exact
      >
        <span className="feria-app-footer__link-inner">
          <span className="material-symbols-rounded feria-app-footer__icon" aria-hidden>account_balance_wallet</span>
          <span className="feria-app-footer__label">Movimientos</span>
        </span>
      </NavLink>
      <NavLink to="/tutor" className="feria-app-footer__link" activeClassName="is-active" exact>
        <span className="feria-app-footer__link-inner">
          <span className="material-symbols-rounded feria-app-footer__icon" aria-hidden>forum</span>
          <span className="feria-app-footer__label">Tutor</span>
        </span>
      </NavLink>
      <NavLink to="/cuenta" className="feria-app-footer__link" activeClassName="is-active" exact>
        <span className="feria-app-footer__link-inner">
          <span className="material-symbols-rounded feria-app-footer__icon" aria-hidden>person</span>
          <span className="feria-app-footer__label">Cuenta</span>
        </span>
      </NavLink>
    </nav>
  );
}

export function FeriaAppShell({
  children,
  headerEnd,
  contentClassName = '',
  contentFullscreen = true,
}: FeriaAppShellProps): ReactElement {
  const { isAuthenticated } = useAuth();
  const contentClasses = ['feria-shell-content', contentClassName].filter(Boolean).join(' ');

  return (
    <>
      <IonHeader className="feria-app-header">
        <IonToolbar className="feria-app-toolbar">
          <div className="feria-app-logo" slot="start">
            <img src="/principal.png" className="feria-app-logo__mark" alt="" aria-hidden="true" />
            Fer<span className="feria-app-logo__accent">IA</span>
          </div>
          {headerEnd ? (
            <div className="feria-app-header__end" slot="end">
              {headerEnd}
            </div>
          ) : null}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={contentFullscreen} className={contentClasses}>
        {children}
      </IonContent>
      {isAuthenticated && (
        <IonFooter className="feria-app-footer">
          <IonToolbar className="feria-app-footer-toolbar">
            <FeriaAppFooterNav />
          </IonToolbar>
        </IonFooter>
      )}
    </>
  );
}
