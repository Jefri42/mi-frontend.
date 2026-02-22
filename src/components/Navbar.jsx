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

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      borderRight: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      height: '100vh',
      gap: '8px',
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        marginBottom: '16px',
        color: 'var(--accent)',
        fontFamily: 'var(--font-display)',
        fontSize: '22px',
        fontWeight: '800',
      }}>
        <BulbIcon />
        <span>Ideas</span>
      </div>

      {/* Links de navegación */}
      {/* NavLink agrega automáticamente la clase "active" cuando la URL coincide */}
      <NavLink to="/" end style={navLinkStyle}>
        <HomeIcon /> <span>Inicio</span>
      </NavLink>

      <NavLink to={`/profile/${user?.username}`} style={navLinkStyle}>
        <UserIcon /> <span>Mi Perfil</span>
      </NavLink>

      {/* Botón de nueva idea */}
      <button
        onClick={() => document.getElementById('compose-idea')?.focus()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px',
          marginTop: '8px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        + Nueva Idea
      </button>

      {/* Espaciador */}
      <div style={{ flex: 1 }} />

      {/* Info del usuario y logout */}
      {user && (
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}>
          {/* Avatar y nombre */}
          <NavLink to={`/profile/${user.username}`} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar */}
              {user.avatar ? (
                <img src={user.avatar} alt="avatar"
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '16px',
                }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>
                  {user.first_name || user.username}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  @{user.username}
                </div>
              </div>
            </div>
          </NavLink>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <LogoutIcon /> Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}

// Estilos para los NavLinks
// La función recibe { isActive } automáticamente de NavLink
const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  textDecoration: 'none',
  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
  background: isActive ? 'var(--accent-glow)' : 'transparent',
  fontWeight: isActive ? '600' : '400',
  fontSize: '15px',
  transition: 'all 0.2s',
});

export default Navbar;
