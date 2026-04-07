import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './Footer.css';

const tabs = [
  { label: 'Inicio',    icon: '🏠', path: '/home' },
  { label: 'Finanzas',  icon: '💳', path: '/finanzas' },
  { label: 'Negocio',   icon: '📊', path: '/negocio' },
  { label: 'Coach',     icon: '💬', path: '/coach' },
  { label: 'Perfil',    icon: '👤', path: '/perfil' },
];

const Footer: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <nav className="footer">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`footer__tab ${isActive ? 'footer__tab--active' : ''}`}
            onClick={() => history.push(tab.path)}
          >
            <span className="footer__icon">{tab.icon}</span>
            <span className="footer__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Footer;
