/**
 * ============================================================
 * COMPOSE IDEA — src/components/ComposeIdea.jsx
 * ============================================================
 * El formulario para crear nuevas ideas.
 * Similar al cuadro de composición de tweets en Twitter.
 *
 * Funcionalidades:
 *   - Área de texto con contador de caracteres (máx 280)
 *   - Upload de imagen (opcional)
 *   - Preview de la imagen antes de publicar
 *   - Deshabilita el botón si no hay contenido o está cargando
 * ============================================================
 */

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MAX_LENGTH = 280;

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>
);


function ComposeIdea({ onIdeaCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);      // El archivo de imagen
  const [preview, setPreview] = useState(null);  // URL para mostrar el preview
  const [loading, setLoading] = useState(false);

  // useRef da acceso directo al elemento DOM del input de archivo
  // Lo usamos para abrir el selector de archivos al hacer click en el botón de imagen
  const fileInputRef = useRef(null);

  const charsLeft = MAX_LENGTH - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !loading;


  // ============================================================
  // handleImageChange: procesa la imagen seleccionada
  // ============================================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Valida que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    // Valida tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede pesar más de 5MB');
      return;
    }

    setImage(file);

    // URL.createObjectURL crea una URL local para mostrar el preview
    // sin subir la imagen al servidor todavía
    setPreview(URL.createObjectURL(file));
  };


  // ============================================================
  // handleSubmit: envía la nueva idea al backend
  // ============================================================
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);

    try {
      // FormData se usa cuando el request incluye archivos (imágenes)
      // No podemos usar JSON porque JSON no soporta archivos binarios
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/api/ideas/', formData, {
        headers: {
          // Cuando usamos FormData, NO debemos poner Content-Type manualmente
          // Axios lo detecta automáticamente y pone multipart/form-data
          'Content-Type': 'multipart/form-data',
        },
      });

      // Limpia el formulario
      setContent('');
      setImage(null);
      setPreview(null);

      toast.success('¡Idea publicada! 💡');

      // Notifica al componente padre para que recargue la lista
      onIdeaCreated?.();

    } catch (error) {
      toast.error(error.response?.data?.content?.[0] || 'Error al publicar la idea');
    } finally {
      setLoading(false);
    }
  };


  // Permite publicar con Ctrl+Enter
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };


  return (
    <div style={{
      padding: '20px 24px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>

        {/* Avatar del usuario actual */}
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar"
            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '18px',
            flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Área de composición */}
        <div style={{ flex: 1 }}>
          <textarea
            id="compose-idea"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="¿Cuál es tu idea? 💡"
            rows={3}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '17px',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none',
            }}
          />

          {/* Preview de imagen */}
          {preview && (
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img src={preview} alt="preview"
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }} />
              <button
                onClick={() => { setImage(null); setPreview(null); }}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  color: 'white', borderRadius: '50%',
                  width: '28px', height: '28px', cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Barra inferior: botones + contador */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            marginTop: '8px',
          }}>

            {/* Botón de adjuntar imagen */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'none', border: 'none',
                color: 'var(--accent)', cursor: 'pointer',
                padding: '6px', borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              title="Adjuntar imagen"
            >
              <ImageIcon />
            </button>

            {/* Input de archivo oculto — se activa desde el botón de arriba */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            {/* Lado derecho: contador + botón publicar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

              {/* Contador de caracteres */}
              {content.length > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {/* Círculo de progreso */}
                  <svg width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="14" cy="14" r="11" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                    <circle
                      cx="14" cy="14" r="11" fill="none"
                      stroke={isOverLimit ? 'var(--danger)' : charsLeft <= 20 ? 'var(--warning)' : 'var(--accent)'}
                      strokeWidth="2.5"
                      strokeDasharray={`${Math.min((content.length / MAX_LENGTH) * 69, 69)} 69`}
                    />
                  </svg>
                  <span style={{
                    fontSize: '13px',
                    color: isOverLimit ? 'var(--danger)' : 'var(--text-muted)',
                    fontWeight: isOverLimit ? '600' : '400',
                  }}>
                    {isOverLimit ? charsLeft : ''}
                  </span>
                </div>
              )}

              {/* Botón publicar */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  padding: '10px 24px',
                  background: canSubmit ? 'var(--accent)' : 'var(--border)',
                  color: canSubmit ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComposeIdea;
