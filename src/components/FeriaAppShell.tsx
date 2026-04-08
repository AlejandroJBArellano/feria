import type { ReactElement, ReactNode } from 'react';
import { IonContent, IonFooter, IonHeader, IonToolbar } from '@ionic/react';
import { NavLink } from 'react-router-dom';

export type FeriaAppShellProps = {
  children: ReactNode;
  /** Right side of header (e.g. theme toggle, actions). */
  headerEnd?: React.ReactNode;
  /** Merged onto IonContent (e.g. home-content, login-content). */
  contentClassName?: string;
};

/**
 * Shared chrome: header with wordmark, scrollable main, footer section nav.
 */
function FeriaAppFooterNav(): ReactElement {
  return (
    <nav className="feria-app-footer__nav" aria-label="Secciones de la app">
      <NavLink to="/home" className="feria-app-footer__link" activeClassName="is-active" exact>
        Inicio
      </NavLink>
      <span className="feria-app-footer__link feria-app-footer__link--soon" title="Próximamente">
        Movimientos
      </span>
      <span className="feria-app-footer__link feria-app-footer__link--soon" title="Próximamente">
        Cuenta
      </span>
    </nav>
  );
}

export function FeriaAppShell({ children, headerEnd, contentClassName = '' }: FeriaAppShellProps): ReactElement {
  const contentClasses = ['feria-shell-content', contentClassName].filter(Boolean).join(' ');

  return (
    <>
      <IonHeader className="feria-app-header">
        <IonToolbar className="feria-app-toolbar">
          <div className="feria-app-logo" slot="start">
            Fer<span className="feria-app-logo__accent">IA</span>
          </div>
          <div slot="end" className="feria-app-header__end">
            {headerEnd}
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className={contentClasses}>
        {children}
      </IonContent>
      <IonFooter className="feria-app-footer">
        <IonToolbar className="feria-app-footer-toolbar">
          <FeriaAppFooterNav />
        </IonToolbar>
      </IonFooter>
    </>
  );
}
