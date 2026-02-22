/**
 * ============================================================
 * IDEA CARD — src/components/IdeaCard.jsx
 * ============================================================
 * El componente más importante de la app.
 * Muestra una idea con todos sus botones de interacción:
 *   - ♥ Like (toggle)
 *   - ↻ ReIdea (toggle — dar soporte a la idea)
 *   - 💬 Comentarios (contador)
 *   - ⎘ Compartir (copia el link al portapapeles)
 *
 * Props que recibe:
 *   - idea: objeto con los datos de la idea
 *   - onUpdate: función para actualizar la lista cuando cambia algo
 * ============================================================
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Iconos SVG
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ReIdeaIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17,1 21,5 17,9"/>
    <path d="M3,11V9a4,4,0,0,1,4-4h14"/>
    <polyline points="7,23 3,19 7,15"/>
    <path d="M21,13v2a4,4,0,0,1-4,4H3"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
    <path d="M10,11v6m4-6v6"/>
    <path d="M9,6V4h6v2"/>
  </svg>
);


function IdeaCard({ idea, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado local de los contadores e interacciones
  // Usamos estado local para actualizar la UI inmediatamente (sin esperar al servidor)
  // Este patrón se llama "Optimistic UI"
  const [liked, setLiked] = useState(idea.is_liked);
  const [likesCount, setLikesCount] = useState(idea.likes_count);
  const [reideated, setReideated] = useState(idea.is_reideated);
  const [reideasCount, setReideasCount] = useState(idea.reideas_count);
  const [loading, setLoading] = useState(false);


  // ============================================================
  // handleLike: Toggle like con Optimistic UI
  // Optimistic UI = actualizamos la UI antes de la respuesta del servidor
  // Si el servidor falla, revertimos el cambio
  // ============================================================
  const handleLike = async (e) => {
    e.stopPropagation();  // Evita que el click propague al card (que navegaría a la idea)

    // Guarda el estado anterior para revertir si hay error
    const prevLiked = liked;
    const prevCount = likesCount;

    // Actualiza UI inmediatamente (sin esperar al servidor)
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      await api.post(`/api/ideas/${idea.id}/like/`);
    } catch (error) {
      // Error → revertir al estado anterior
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Error al dar like');
    }
  };


  // ============================================================
  // handleReidea: Toggle ReIdea
  // ReIdea = amplificar/apoyar una idea (como Retweet)
  // ============================================================
  const handleReidea = async (e) => {
    e.stopPropagation();

    const prevReideated = reideated;
    const prevCount = reideasCount;

    // Optimistic UI
    setReideated(!reideated);
    setReideasCount(reideated ? reideasCount - 1 : reideasCount + 1);

    try {
      await api.post(`/api/ideas/${idea.id}/reidea/`);

      if (!prevReideated) {
        toast.success('¡Apoyaste esta idea! 🚀');
      }
    } catch (error) {
      setReideated(prevReideated);
      setReideasCount(prevCount);
      toast.error('Error al dar ReIdea');
    }
  };


  // ============================================================
  // handleShare: Copia el link de la idea al portapapeles
  // ============================================================
  const handleShare = async (e) => {
    e.stopPropagation();

    const url = `${window.location.origin}/idea/${idea.id}`;

    try {
      // navigator.clipboard es la API moderna para copiar al portapapeles
      await navigator.clipboard.writeText(url);
      toast.success('¡Link copiado al portapapeles! 🔗');
    } catch (error) {
      toast.error('No se pudo copiar el link');
    }
  };


  // ============================================================
  // handleDelete: Elimina la idea (solo si el autor es el usuario actual)
  // ============================================================
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!window.confirm('¿Estás seguro de eliminar esta idea?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/ideas/${idea.id}/`);
      toast.success('Idea eliminada');
      // Notifica al componente padre para que actualice la lista
      onUpdate?.();
    } catch (error) {
      toast.error('Error al eliminar la idea');
    } finally {
      setLoading(false);
    }
  };


  // Formatea la fecha: "hace 5 minutos", "hace 2 días", etc.
  const timeAgo = formatDistanceToNow(new Date(idea.created_at), {
    addSuffix: true,
    locale: es,  // en español
  });

  const isOwner = user?.username === idea.author?.username;


  return (
    <article
      onClick={() => navigate(`/idea/${idea.id}`)}
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        animation: 'fadeIn 0.3s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Cabecera: avatar + nombre + tiempo */}
      <div style={{ display: 'flex', gap: '12px' }}>

        {/* Avatar del autor */}
        <Link
          to={`/profile/${idea.author?.username}`}
          onClick={e => e.stopPropagation()}
          style={{ flexShrink: 0 }}
        >
          {idea.author?.avatar ? (
            <img
              src={idea.author.avatar}
              alt="avatar"
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '18px',
              flexShrink: 0,
            }}>
              {idea.author?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </Link>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Nombre + username + tiempo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to={`/profile/${idea.author?.username}`}
              onClick={e => e.stopPropagation()}
              style={{
                color: 'var(--text-primary)', fontWeight: '600',
                textDecoration: 'none', fontSize: '15px',
              }}
            >
              {idea.author?.first_name || idea.author?.username}
            </Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              @{idea.author?.username}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>·</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{timeAgo}</span>

            {/* Botón de eliminar (solo para el autor) */}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
                  borderRadius: '4px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
              >
                <TrashIcon />
              </button>
            )}
          </div>

          {/* Texto de la idea */}
          <p style={{
            margin: '8px 0 12px',
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            wordBreak: 'break-word',
          }}>
            {idea.content}
          </p>

          {/* Imagen adjunta (si tiene) */}
          {idea.image && (
            <img
              src={idea.image}
              alt="idea"
              style={{
                width: '100%', borderRadius: '12px',
                marginBottom: '12px', maxHeight: '400px', objectFit: 'cover',
              }}
            />
          )}

          {/* ============================================================
              BOTONES DE INTERACCIÓN
              Cada botón tiene:
                - Estado visual basado en si ya interactuaste
                - Contador de cuántos lo hicieron
                - onClick que hace la petición a la API
              ============================================================ */}
          <div style={{
            display: 'flex', gap: '4px', marginTop: '4px',
          }}>

            {/* Botón de Comentarios */}
            <ActionButton
              icon={<CommentIcon />}
              count={idea.comments_count}
              color="var(--accent)"
              hoverBg="rgba(108,99,255,0.1)"
              onClick={e => { e.stopPropagation(); navigate(`/idea/${idea.id}`); }}
              label="Comentar"
            />

            {/* Botón de ReIdea (Soporte/Amplificar) */}
            <ActionButton
              icon={<ReIdeaIcon />}
              count={reideasCount}
              active={reideated}
              color="var(--success)"
              hoverBg="rgba(78,204,163,0.1)"
              onClick={handleReidea}
              label="ReIdea"
            />

            {/* Botón de Like */}
            <ActionButton
              icon={<HeartIcon filled={liked} />}
              count={likesCount}
              active={liked}
              color="var(--danger)"
              hoverBg="rgba(255,107,107,0.1)"
              onClick={handleLike}
              label="Me gusta"
            />

            {/* Botón de Compartir */}
            <ActionButton
              icon={<ShareIcon />}
              count={null}
              color="var(--warning)"
              hoverBg="rgba(255,217,61,0.1)"
              onClick={handleShare}
              label="Compartir"
            />
          </div>

        </div>
      </div>
    </article>
  );
}


// ============================================================
// ActionButton: Botón de interacción reutilizable
// ============================================================
function ActionButton({ icon, count, active, color, hoverBg, onClick, label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: hovered ? hoverBg : 'transparent',
        border: 'none',
        borderRadius: '999px',
        color: active ? color : (hovered ? color : 'var(--text-muted)'),
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        transition: 'all 0.15s',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <span style={{
        // Animación de pulse cuando el botón está activo
        animation: active ? 'pulse 0.3s ease' : 'none',
      }}>
        {icon}
      </span>
      {count !== null && (
        <span>{count > 0 ? count : ''}</span>
      )}
    </button>
  );
}

export default IdeaCard;
