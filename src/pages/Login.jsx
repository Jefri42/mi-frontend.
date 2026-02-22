/**
 * ============================================================
 * LOGIN PAGE — src/pages/Login.jsx
 * ============================================================
 * Página de inicio de sesión.
 *
 * Flujo:
 *   1. Usuario llena username + password
 *   2. Se hace POST a /api/auth/login/
 *   3. El servidor retorna access + refresh tokens
 *   4. login() del AuthContext guarda tokens y actualiza estado
 *   5. App.js detecta que user != null → redirige al home
 * ============================================================
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estado del formulario — un objeto para manejar múltiples campos
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // handleChange: actualiza el campo correspondiente en el estado
  // e.target.name corresponde al atributo name del input
  // e.target.value es el valor actual
  // "...prev" es el spread operator — copia todos los campos anteriores
  // ============================================================
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,                    // Copia los campos anteriores
      [e.target.name]: e.target.value  // Actualiza solo el campo que cambió
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Evita que el formulario recargue la página

    if (!form.username || !form.password) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/login/', form);
      const { user, access, refresh } = response.data;

      // Actualiza el contexto global con los datos del usuario y tokens
      login(user, access, refresh);

      toast.success(`¡Bienvenido de vuelta, @${user.username}! 👋`);
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        animation: 'fadeIn 0.4s ease',
      }}>

        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px',
          }}>💡</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: '800',
            color: 'var(--text-primary)',
          }}>
            Ideas
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Comparte tus ideas con el mundo
          </p>
        </div>

        {/* Card del formulario */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '32px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '24px',
          }}>
            Iniciar sesión
          </h2>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Campo: Username */}
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Nombre de usuario
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="@johndoe"
                autoComplete="username"
                className="input"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '12px 16px', width: '100%', fontFamily: 'var(--font-body)', fontSize: '15px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Campo: Contraseña */}
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '12px 44px 12px 16px', width: '100%', fontFamily: 'var(--font-body)', fontSize: '15px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '16px',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                background: loading ? 'var(--border)' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Link a registro */}
          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
