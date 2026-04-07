import React from 'react';
import './Navbar.css';

interface NavbarProps {
  userName?: string;
  avatarInitials?: string;
  notificationCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  userName = 'Maria Garcia',
  avatarInitials = 'MG',
  notificationCount = 3,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        <div className="navbar__avatar">{avatarInitials}</div>
        <div className="navbar__greeting">
          <span className="navbar__greeting-text">{getGreeting()}</span>
          <span className="navbar__name">{userName}</span>
        </div>
      </div>

      <div className="navbar__right">
        <button className="navbar__icon-btn" aria-label="Notificaciones">
          <span className="navbar__icon">🔔</span>
          {notificationCount > 0 && (
            <span className="navbar__badge">{notificationCount}</span>
          )}
        </button>
        <button className="navbar__icon-btn" aria-label="Configuración">
          <span className="navbar__icon">⚙️</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;