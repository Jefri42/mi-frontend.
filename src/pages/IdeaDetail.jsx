/**
 * ============================================================
 * IDEA DETAIL PAGE — src/pages/IdeaDetail.jsx
 * ============================================================
 * Vista detallada de una idea con sus comentarios.
 * Accesible en /idea/:id
 *
 * Permite leer y escribir comentarios.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IdeaCard from '../components/IdeaCard';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
);

function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);


  // Carga la idea y sus comentarios
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Carga en paralelo
        const [ideaRes, commentsRes] = await Promise.all([
          api.get(`/api/ideas/${id}/`),
          api.get(`/api/ideas/${id}/comments/`),
        ]);
        setIdea(ideaRes.data);
        setComments(commentsRes.data.results || commentsRes.data);
      } catch (error) {
        toast.error('No se pudo cargar la idea');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);


  // ============================================================
  // handleComment: publica un nuevo comentario
  // ============================================================
  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || posting) return;

    setPosting(true);

    try {
      const response = await api.post(`/api/ideas/${id}/comments/`, {
        content: newComment.trim(),
      });

      // Agrega el nuevo comentario al inicio de la lista
      setComments(prev => [...prev, response.data]);
      setNewComment('');

      // Actualiza el contador en la idea
      setIdea(prev => ({
        ...prev,
        comments_count: prev.comments_count + 1,
      }));

      toast.success('Comentario publicado');
    } catch (error) {
      toast.error('Error al publicar el comentario');
    } finally {
      setPosting(false);
    }
  };


  if (loading) return (
    <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Cargando...</div>
  );

  return (
    <div>
      {/* Header con botón de regreso */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}  // navigate(-1) = botón atrás del navegador
          style={{
            background: 'none', border: 'none', color: 'var(--text-primary)',
            cursor: 'pointer', padding: '6px', borderRadius: '50%',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <BackIcon />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700' }}>
          Idea
        </h1>
      </header>

      {/* La idea principal (sin onClick para no navegar) */}
      {idea && <IdeaCard idea={idea} onUpdate={() => navigate('/')} />}

      {/* Sección de comentarios */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '16px',
          fontWeight: '700', marginBottom: '16px',
        }}>
          Comentarios {comments.length > 0 && `(${comments.length})`}
        </h2>

        {/* Formulario de nuevo comentario */}
        <form onSubmit={handleComment}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

            {/* Avatar del usuario actual */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>

            {/* Input de comentario */}
            <div style={{ flex: 1 }}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={2}
                maxLength={500}
                style={{
                  width: '100%', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: '12px',
                  color: 'var(--text-primary)', padding: '12px 16px',
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  outline: 'none', resize: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={!newComment.trim() || posting}
                  style={{
                    padding: '8px 20px',
                    background: newComment.trim() ? 'var(--accent)' : 'var(--border)',
                    color: newComment.trim() ? 'white' : 'var(--text-muted)',
                    border: 'none', borderRadius: '999px',
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600',
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {posting ? 'Publicando...' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de comentarios */}
      {comments.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px' }}>💬</div>
          <p style={{ marginTop: '12px' }}>Sé el primero en comentar</p>
        </div>
      ) : (
        comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
}


// ============================================================
// CommentItem: muestra un comentario individual
// ============================================================
function CommentItem({ comment }) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true, locale: es,
  });

  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', gap: '12px',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Avatar */}
      {comment.author_avatar ? (
        <img src={comment.author_avatar} alt="avatar"
          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', flexShrink: 0,
        }}>
          {comment.author_username?.[0]?.toUpperCase()}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontWeight: '600', fontSize: '14px' }}>@{comment.author_username}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{timeAgo}</span>
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export default IdeaDetail;
