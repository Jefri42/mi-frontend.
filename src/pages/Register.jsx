/**
 * ============================================================
 * REGISTER PAGE — src/pages/Register.jsx
 * ============================================================
 * Página de registro de nuevos usuarios.
 * Similar a Login pero con más campos y validaciones.
 * ============================================================
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });

  const [errors, setErrors] = useState({});  // Errores de validación del servidor
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Limpia el error del campo cuando el usuario empieza a escribir
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  // Validación en el cliente antes de enviar al servidor
  const validateClient = () => {
    const newErrors = {};

    if (form.username.length < 3) {
      newErrors.username = 'El username debe tener al menos 3 caracteres';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Solo letras, números y guion bajo (_)';
    }
    if (!form.email.includes('@')) {
      newErrors.email = 'Ingresa un email válido';
    }
    if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (form.password !== form.password2) {
      newErrors.password2 = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;  // true si no hay errores
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateClient()) return;

    setLoading(true);

    try {
      const response = await api.post('/api/auth/register/', form);
      const { user, access, refresh } = response.data;

      login(user, access, refresh);
      toast.success('¡Cuenta creada! Bienvenido 🎉');
      navigate('/');

    } catch (error) {
      // El servidor retorna errores por campo:
      // { "username": ["Este usuario ya existe."], "email": [...] }
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', padding: '24px', background: 'var(--bg-primary)',
    }}>
      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.4s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '42px', marginBottom: '8px' }}>💡</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '32px',
            fontWeight: '800', color: 'var(--text-primary)',
          }}>Ideas</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
            Crea tu cuenta y empieza a compartir
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '32px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
            Crear cuenta
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Nombre y Apellido — en una fila */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Nombre" name="first_name" value={form.first_name}
                onChange={handleChange} placeholder="John" error={errors.first_name} />
              <FormField label="Apellido" name="last_name" value={form.last_name}
                onChange={handleChange} placeholder="Doe" error={errors.last_name} />
            </div>

            {/* Username */}
            <FormField label="Nombre de usuario" name="username" value={form.username}
              onChange={handleChange} placeholder="johndoe" error={errors.username}
              hint="Solo letras, números y _" />

            {/* Email */}
            <FormField label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="john@example.com" error={errors.email} />

            {/* Contraseña */}
            <FormField label="Contraseña" name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="••••••••" error={errors.password}
              hint="Mínimo 8 caracteres" />

            {/* Confirmar contraseña */}
            <FormField label="Confirmar contraseña" name="password2" type="password" value={form.password2}
              onChange={handleChange} placeholder="••••••••" error={errors.password2} />

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px', marginTop: '8px',
                background: loading ? 'var(--border)' : 'var(--accent)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


// Componente de campo de formulario reutilizable
function FormField({ label, name, type = 'text', value, onChange, placeholder, error, hint }) {
  return (
    <div>
      <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name}
        style={{
          background: 'var(--bg-tertiary)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          padding: '11px 14px',
          width: '100%',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      />
      {/* Error del servidor o del cliente */}
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
      {/* Hint (ayuda) debajo del campo */}
      {hint && !error && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          {hint}
        </span>
      )}
    </div>
  );
}

export default Register;
