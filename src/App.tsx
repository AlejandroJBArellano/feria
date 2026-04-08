import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import Chat from './pages/Chat';
import Cuenta from './pages/Cuenta';
import Home from './pages/Home';
import Movimientos from './pages/Movimientos';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import BootstrapRedirect from './routing/BootstrapRedirect';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
import '@ionic/react/css/palettes/dark.class.css';
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/feria-components.css';
import './theme/feria-overlays.css';
import './theme/feria-app-shell.css';
import './theme/feria-tokens.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/" component={BootstrapRedirect} />
        <Route exact path="/onboarding" component={Onboarding} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/chat">
          <Redirect to="/tutor" />
        </Route>
        <Route exact path="/tutor">
          <RequireAuth>
            <Chat />
          </RequireAuth>
        </Route>
        <Route exact path="/home">
          <RequireAuth>
            <Home />
          </RequireAuth>
        </Route>
        <Route exact path="/movimientos">
          <RequireAuth>
            <Movimientos />
          </RequireAuth>
        </Route>
        <Route exact path="/cuenta">
          <RequireAuth>
            <Cuenta />
          </RequireAuth>
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
