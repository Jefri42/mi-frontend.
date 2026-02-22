/**
 * ============================================================
 * EDIT PROFILE MODAL — src/components/EditProfileModal.jsx
 * ============================================================
 * Modal para editar el perfil del usuario.
 * Se importa en Profile.jsx y se muestra al presionar
 * el botón "Editar perfil".
 *
 * Props que recibe:
 *   - profile: datos actuales del perfil
 *   - onClose: función para cerrar el modal
 *   - onSave:  función que se ejecuta al guardar exitosamente
 * ============================================================
 */

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function EditProfileModal({ profile, onClose, onSave }) {
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Precarga el formulario con los datos actuales del perfil
  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name:  profile.last_name  || '',
    bio:        profile.bio        || '',
    website:    profile.website    || '',
  });

  const [avatarFile, setAvatarFile]       = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving]               = useState(false);

  // Actualiza el campo del formulario que cambió
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Procesa la imagen seleccionada y crea un preview local
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Máximo 5MB por imagen');     return; }
    setAvatarFile(file);
    // URL.createObjectURL crea una URL temporal local para mostrar el preview
    // sin necesidad de subir la imagen al servidor todavía
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Envía los cambios al backend con PUT /api/profile/
  const handleSave = async () => {
    setSaving(true);
    try {
      // FormData es necesario cuando se envían archivos (imagen del avatar)
      // No se puede usar JSON porque JSON no soporta archivos binarios
      const formData = new FormData();
      formData.append('first_name', form.first_name);
      formData.append('last_name',  form.last_name);
      formData.append('bio',        form.bio);
      formData.append('website',    form.website);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await api.put('/api/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(response.data);  // Actualiza el contexto global de autenticación
      toast.success('¡Perfil actualizado!');
      onSave(response.data);      // Le dice al padre que actualice la vista
      onClose();                  // Cierra el modal
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // Cierra el modal al hacer click en el fondo oscuro (fuera del modal)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const currentAvatar = avatarPreview || profile.avatar;

  return (
    // Fondo oscuro (backdrop)
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Caja del modal */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        width: '100%', maxWidth: '500px',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeIn 0.25s ease',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1,
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700' }}>
            Editar perfil
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '6px', borderRadius: '50%',
            display: 'flex', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Sección de avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              {currentAvatar ? (
                <img src={currentAvatar} alt="avatar"
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }} />
              ) : (
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '800', fontSize: '30px',
                }}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}

              {/* Botón de cámara sobre el avatar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--accent)', border: '2px solid var(--bg-secondary)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Cambiar foto de perfil"
              >
                <CameraIcon />
              </button>
            </div>

            {/* Input de archivo oculto — se activa con el botón de cámara */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />

            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {avatarPreview ? '✅ Nueva foto lista para guardar' : 'Haz click en la cámara para cambiar tu foto'}
            </span>
          </div>

          {/* Nombre y Apellido en dos columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Nombre"   name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" />
            <Field label="Apellido" name="last_name"  value={form.last_name}  onChange={handleChange} placeholder="Doe" />
          </div>

          {/* Bio con contador de caracteres */}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              name="bio" value={form.bio} onChange={handleChange}
              placeholder="Cuéntanos sobre ti..." maxLength={200} rows={3}
              style={{ ...fieldStyle, resize: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: '2px' }}>
              {form.bio.length}/200
            </span>
          </div>

          {/* Website */}
          <Field label="Sitio web" name="website" value={form.website} onChange={handleChange} placeholder="https://tusitio.com" />

        </div>

        {/* Footer con botones */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '12px', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '10px 22px', background: 'transparent',
            color: 'var(--text-secondary)', border: '1px solid var(--border)',
            borderRadius: '999px', fontFamily: 'var(--font-body)',
            fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Cancelar
          </button>

          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 26px',
            background: saving ? 'var(--border)' : 'var(--accent)',
            color: saving ? 'var(--text-muted)' : 'white',
            border: 'none', borderRadius: '999px',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}

// Campo de texto reutilizable dentro del modal
function Field({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={fieldStyle}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '13px',
  color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: '500',
};

const fieldStyle = {
  width: '100%', background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)', borderRadius: '8px',
  color: 'var(--text-primary)', padding: '10px 14px',
  fontFamily: 'var(--font-body)', fontSize: '14px',
  outline: 'none', transition: 'border-color 0.2s',
};

export default EditProfileModal;