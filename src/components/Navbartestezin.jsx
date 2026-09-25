import React from 'react';
import '../css/navbartestezin.css';
import { Link } from 'react-router-dom';

function Navbartestezin() {
  return (
    <nav className="navbar-testezin">
      <div className="navbar-testezin-logo">
        <Link to="/" className="navbar-testezin-logo-link">
          <span className="logo-text">ANIME</span>
          <span className="logo-kanji">夢</span>
        </Link>
      </div>
      
      <div className="navbar-testezin-links">
        <Link to="/" className="nav-link-teste">
          <i className="ph ph-house"></i> Início
        </Link>
        <Link to="/Eventos" className="nav-link-teste">
          <i className="ph ph-calendar-blank"></i> Eventos
        </Link>
        <Link to="/Mapa" className="nav-link-teste">
          <i className="ph ph-map-pin"></i> Mapa
        </Link>
        <Link to="/Comunidade" className="nav-link-teste">
          <i className="ph ph-users"></i> Comunidade
        </Link>
      </div>

      <div className="navbar-testezin-actions">
        <button className="nav-action-btn">
          <i className="ph ph-magnifying-glass"></i>
        </button>
        <button className="nav-action-btn nav-bell">
          <i className="ph ph-bell"></i>
          <span className="notification-dot"></span>
        </button>
        <div className="nav-profile-dropdown">
          <img src="https://i.pravatar.cc/150?img=11" alt="Perfil" className="nav-profile-img" />
          <i className="ph ph-caret-down"></i>
        </div>
      </div>
    </nav>
  );
}

export default Navbartestezin;
