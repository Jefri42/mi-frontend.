/**
 * ============================================================
 * CONTEXTO DE AUTENTICACIÓN — src/context/AuthContext.js
 * ============================================================
 * El Context de React permite compartir estado global entre
 * todos los componentes sin pasar props manualmente por cada nivel.
 *
 * AuthContext guarda:
 *   - user: datos del usuario autenticado (null si no está logueado)
 *   - login(): función para iniciar sesión
 *   - logout(): función para cerrar sesión
 *   - loading: true mientras verificamos si el usuario está autenticado
 *
 * Uso en cualquier componente:
 *   const { user, login, logout } = useAuth();
 * ============================================================
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// Crea el contexto — es como una "caja" que puede contener datos globales
const AuthContext = createContext(null);


// ============================================================
// AuthProvider: envuelve toda la app para dar acceso al contexto
// Se usa en index.js: <AuthProvider><App /></AuthProvider>
// ============================================================
export function AuthProvider({ children }) {
  // Estado del usuario — null = no autenticado
  const [user, setUser] = useState(null);

  // true mientras cargamos los datos del usuario al iniciar la app
  const [loading, setLoading] = useState(true);


  // ============================================================
  // useEffect con [] se ejecuta UNA SOLA VEZ al montar el componente.
  // Verifica si hay un token guardado y carga los datos del usuario.
  // Esto mantiene la sesión activa al recargar la página.
  // ============================================================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          // Si hay token, obtiene los datos actuales del usuario
          const response = await api.get('/api/profile/');
          setUser(response.data);
        } catch (error) {
          // Token inválido o expirado → limpiar localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []); // [] = solo al montar, no en cada render


  // ============================================================
  // login(): guarda tokens y carga datos del usuario
  // Se llama desde la página de Login después de un response exitoso
  // ============================================================
  const login = (userData, accessToken, refreshToken) => {
    // Guarda tokens en localStorage para persistir entre recargas
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    // Actualiza el estado global — esto re-renderiza todos los componentes
    // que estén usando useAuth()
    setUser(userData);
  };


  // ============================================================
  // logout(): limpia tokens y resetea el estado
  // ============================================================
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      // Le dice al servidor que invalide el token
      await api.post('/api/auth/logout/', { refresh: refreshToken });
    } catch (error) {
      // Si falla, igual limpiamos localmente
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };


  // ============================================================
  // updateUser(): actualiza los datos del usuario en el estado global
  // Se llama después de editar el perfil
  // ============================================================
  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };


  // Provee los valores a todos los componentes hijos
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


// ============================================================
// Hook personalizado — simplifica el uso del contexto
// En lugar de: const { user } = useContext(AuthContext);
// Usamos:       const { user } = useAuth();
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}

export default AuthContext;
