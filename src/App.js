/**
 * ============================================================
 * APP.JS — Punto de entrada de la aplicación React
 * ============================================================
 * App.js define:
 *   - Las rutas de la aplicación (qué URL muestra qué página)
 *   - El layout general (sidebar + contenido principal)
 *
 * React Router v6 funciona así:
 *   <Routes> contiene todas las rutas
 *   <Route path="/ruta" element={<Componente />}> define cada ruta
 *   <Navigate> redirige de una ruta a otra
 * ============================================================
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import IdeaDetail from './pages/IdeaDetail';

// Componentes de layout
import Navbar from './components/Navbar';


// ============================================================
// ProtectedRoute: componente que protege rutas privadas
// Si el usuario no está autenticado, redirige al login
// ============================================================
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Mientras verificamos la autenticación, mostramos un spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'var(--bg-primary)'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Si no hay usuario → redirige al login
  // replace evita que el usuario pueda volver atrás con el botón del navegador
  if (!user) return <Navigate to="/login" replace />;

  return children;
}


// ============================================================
// PublicOnlyRoute: rutas solo para NO autenticados
// Si el usuario ya inició sesión, redirige al home
// (Evita que un usuario logueado vea la página de login)
// ============================================================
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}


// ============================================================
// AppContent: el layout principal con navbar + contenido
// ============================================================
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {/* Sidebar izquierdo con navegación (solo si está autenticado) */}
      {user && <Navbar />}

      {/* Contenido principal — donde se renderizan las páginas */}
      <main style={{ borderLeft: '1px solid var(--border)', minHeight: '100vh' }}>
        <Routes>
          {/* Rutas públicas (login y registro) */}
          <Route path="/login" element={
            <PublicOnlyRoute><Login /></PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute><Register /></PublicOnlyRoute>
          } />

          {/* Rutas protegidas (requieren login) */}
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/profile/:username" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/idea/:id" element={
            <ProtectedRoute><IdeaDetail /></ProtectedRoute>
          } />

          {/* Ruta por defecto — si la URL no existe, va al home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}


// ============================================================
// App: componente raíz que envuelve todo
// AuthProvider debe envolver todo para que el contexto funcione
// BrowserRouter habilita el sistema de rutas
// Toaster muestra notificaciones (toast messages)
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toaster: notificaciones tipo "toast" en la esquina */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
