/**
 * ============================================================
 * NAVBAR — src/components/Navbar.jsx
 * ============================================================
 * Barra de navegación lateral izquierda.
 * Muestra los links de navegación y el botón de logout.
 *
 * Usa useAuth() para acceder al usuario actual.
 * Usa useNavigate() para navegar entre páginas programáticamente.
 * Usa NavLink para links con clase "active" automática.
 * ============================================================
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Iconos SVG inline (sin dependencias extra)
const HomeIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const BulbIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21h6m-6-4h6M12 3C8.5 3 5.5 6 5.5 9c0 2.4 1.3 4.5 3.5 5.5V17h6v-2.5C17.2 13.5 18.5 11.4 18.5 9c0-3-3-6-6.5-6z"/>
  </svg>
);


function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Sesión cerrada');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  // En móvil la barra está abajo y el compositor arriba del feed,
  // así que además de enfocar hay que subir la vista hasta él.
  const focusCompose = () => {
    const el = document.getElementById('compose-idea');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
  };

  return (
    <aside className="left-sidebar">
      {/* Logo — se oculta en móvil, donde la barra pasa a ser inferior */}
      <div className="sidebar-logo">
        <BulbIcon />
        <span>Ideas</span>
      </div>

      {/* Links de navegación */}
      {/* NavLink agrega automáticamente la clase "active" cuando la URL coincide */}
      <NavLink to="/" end className={navLinkClass}>
        <HomeIcon /> <span className="nav-label">Inicio</span>
      </NavLink>

      <NavLink to={`/profile/${user?.username}`} className={navLinkClass}>
        <UserIcon /> <span className="nav-label">Mi Perfil</span>
      </NavLink>

      {/* Botón de nueva idea */}
      <button onClick={focusCompose} className="btn-new-idea" aria-label="Nueva idea">
        <span aria-hidden="true">+</span>
        <span className="nav-label">Nueva Idea</span>
      </button>

      {/* Espaciador — empuja el bloque de usuario al fondo en escritorio */}
      <div className="sidebar-spacer" />

      {/* Info del usuario y logout */}
      {user && (
        <div className="sidebar-user">
          {/* Avatar y nombre */}
          <NavLink to={`/profile/${user.username}`} className="sidebar-user-link">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="sidebar-avatar" />
            ) : (
              <div className="sidebar-avatar sidebar-avatar--fallback">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="sidebar-user-meta">
              <div className="sidebar-user-name">
                {user.first_name || user.username}
              </div>
              <div className="sidebar-user-handle">
                @{user.username}
              </div>
            </div>
          </NavLink>

          {/* Botón de logout */}
          <button onClick={handleLogout} className="btn-logout" aria-label="Cerrar sesión">
            <LogoutIcon /> <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>
      )}
    </aside>
  );
}

// Clases para los NavLinks.
// NavLink pasa { isActive } automáticamente cuando la URL coincide.
const navLinkClass = ({ isActive }) =>
  isActive ? 'nav-link active' : 'nav-link';

export default Navbar;
