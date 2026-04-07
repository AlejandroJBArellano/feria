import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './Footer.css';
import { AiOutlineHome } from 'react-icons/ai';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';

const tabs = [
  { label: 'Inicio',    icon: <AiOutlineHome size={24} />,                  path: '/home' },
  { label: 'Finanzas',  icon: <MdOutlineAccountBalanceWallet size={24} />,  path: '/finanzas' },
  { label: 'Coach',     icon: <IoChatbubbleOutline size={24} />,            path: '/coach' },
  { label: 'Perfil',    icon: <CgProfile size={24} />,                      path: '/perfil' },
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