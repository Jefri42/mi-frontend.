/**
 * ============================================================
 * HOME PAGE — src/pages/Home.jsx
 * ============================================================
 * La página principal del feed.
 * Muestra el formulario de composición y la lista de ideas.
 *
 * Usa paginación infinita: cuando llegas al final,
 * carga más ideas automáticamente (Intersection Observer).
 * ============================================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import IdeaCard from '../components/IdeaCard';
import ComposeIdea from '../components/ComposeIdea';

function Home() {
  const [ideas, setIdeas] = useState([]);       // Lista de ideas cargadas
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);  // URL de la siguiente página (null = no hay más)
  const [tab, setTab] = useState('all');           // 'all' o 'feed'

  // useRef para el Intersection Observer (scroll infinito)
  const bottomRef = useRef(null);


  // ============================================================
  // loadIdeas: carga la primera página de ideas
  // useCallback memoiza la función para evitar re-renders innecesarios
  // ============================================================
  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setIdeas([]);

    try {
      // Si tab === 'feed', carga ideas de usuarios seguidos
      // Si tab === 'all', carga todas las ideas
      const url = tab === 'feed' ? '/api/feed/' : '/api/ideas/';
      const response = await api.get(url);

      // La API retorna objetos paginados:
      // { count: 100, next: "http://.../ideas/?page=2", previous: null, results: [...] }
      setIdeas(response.data.results || response.data);
      setNextPage(response.data.next || null);
    } catch (error) {
      console.error('Error al cargar ideas:', error);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  // Se ejecuta cuando cambia el tab o al montar
  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);


  // ============================================================
  // loadMore: carga la siguiente página al hacer scroll
  // ============================================================
  const loadMore = useCallback(async () => {
    if (!nextPage || loadingMore) return;

    setLoadingMore(true);

    try {
      const response = await api.get(nextPage);
      const newIdeas = response.data.results || response.data;

      // Agrega las nuevas ideas al final del array existente
      setIdeas(prev => [...prev, ...newIdeas]);
      setNextPage(response.data.next || null);
    } catch (error) {
      console.error('Error al cargar más ideas:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage, loadingMore]);


  // ============================================================
  // Intersection Observer: detecta cuando el usuario llega al final
  // Es más eficiente que escuchar el evento scroll
  // ============================================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Si el elemento bottomRef está visible → cargar más
        if (entries[0].isIntersecting && nextPage) {
          loadMore();
        }
      },
      { threshold: 0.1 }  // Se activa cuando el 10% del elemento es visible
    );

    const bottom = bottomRef.current;
    if (bottom) observer.observe(bottom);

    // Limpieza: desconectar el observer cuando el componente se desmonte
    return () => { if (bottom) observer.unobserve(bottom); };
  }, [loadMore, nextPage]);


  return (
    <div>
      {/* Header con título y tabs */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',  // Efecto glassmorphism
        zIndex: 10,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '12px',
        }}>
          Inicio
        </h1>

        {/* Tabs: Todas / Mi Feed */}
        <div style={{ display: 'flex', gap: '0' }}>
          {['all', 'feed'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: tab === t ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'all' ? '✨ Todas las ideas' : '👥 Mi feed'}
            </button>
          ))}
        </div>
      </header>

      {/* Formulario de composición */}
      <ComposeIdea onIdeaCreated={loadIdeas} />

      {/* Lista de ideas */}
      {loading ? (
        // Skeleton loading — placeholders mientras cargan los datos
        <SkeletonList />
      ) : ideas.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <>
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdate={loadIdeas}  // Al eliminar una idea, recarga la lista
            />
          ))}

          {/* Elemento invisible al final — trigger del scroll infinito */}
          <div ref={bottomRef} style={{ padding: '20px', textAlign: 'center' }}>
            {loadingMore && (
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Cargando más ideas...
              </span>
            )}
            {!nextPage && ideas.length > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Has llegado al final 🎉
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}


// ============================================================
// SkeletonList: placeholders animados mientras carga
// ============================================================
function SkeletonList() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: '12px',
        }}>
          {/* Avatar skeleton */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--bg-tertiary)', flexShrink: 0,
            animation: 'pulse 1.5s infinite',
          }} />
          <div style={{ flex: 1 }}>
            {/* Nombre skeleton */}
            <div style={{ height: 14, width: '30%', background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 8 }} />
            {/* Contenido skeleton */}
            <div style={{ height: 14, width: '100%', background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ height: 14, width: '75%', background: 'var(--bg-tertiary)', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </>
  );
}


// ============================================================
// EmptyState: mensaje cuando no hay ideas
// ============================================================
function EmptyState({ tab }) {
  return (
    <div style={{
      padding: '60px 24px',
      textAlign: 'center',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        {tab === 'feed' ? '👥' : '💡'}
      </div>
      <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-secondary)' }}>
        {tab === 'feed' ? 'Sigue a alguien para ver su feed' : 'Sé el primero en publicar una idea'}
      </p>
    </div>
  );
}

export default Home;
