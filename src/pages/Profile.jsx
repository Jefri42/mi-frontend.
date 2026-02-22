import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IdeaCard from '../components/IdeaCard';
import EditProfileModal from '../components/EditProfileModal';

function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile]             = useState(null);
  const [ideas, setIdeas]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [following, setFollowing]         = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, ideasRes] = await Promise.all([
          api.get(`/api/users/${username}/`),
          api.get(`/api/ideas/?username=${username}`),
        ]);
        setProfile(profileRes.data);
        setFollowing(profileRes.data.is_following);
        setIdeas(ideasRes.data.results || ideasRes.data);
      } catch (error) {
        toast.error('Usuario no encontrado');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const handleFollow = async () => {
    setFollowLoading(true);
    const prevFollowing = following;
    setFollowing(!following);
    setProfile(prev => ({
      ...prev,
      followers_count: following ? prev.followers_count - 1 : prev.followers_count + 1,
    }));
    try {
      const response = await api.post(`/api/users/${username}/follow/`);
      setFollowing(response.data.following);
      toast.success(response.data.following ? `Ahora sigues a @${username}` : `Dejaste de seguir a @${username}`);
    } catch (error) {
      setFollowing(prevFollowing);
      setProfile(prev => ({
        ...prev,
        followers_count: prevFollowing ? prev.followers_count + 1 : prev.followers_count - 1,
      }));
      toast.error('Error al seguir usuario');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileSaved = (newData) => {
    setProfile(prev => ({ ...prev, ...newData }));
  };

  if (loading) return <ProfileSkeleton />;

  if (!profile) return (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '48px' }}>🔍</div>
      <p>Usuario no encontrado</p>
    </div>
  );

  return (
    <div>

      {/* MODAL — se muestra solo cuando showEditModal es true */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileSaved}
        />
      )}

      {/* Header */}
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(12px)', zIndex: 10,
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700' }}>
          {profile.first_name || profile.username}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
          {profile.ideas_count} ideas
        </p>
      </header>

      {/* Info del perfil */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>

          {/* Avatar */}
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '28px',
            }}>
              {profile.username?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Botón seguir o editar */}
          {!isOwnProfile ? (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              style={{
                padding: '10px 24px',
                background: following ? 'transparent' : 'var(--accent)',
                color: following ? 'var(--text-primary)' : 'white',
                border: following ? '1px solid var(--border)' : 'none',
                borderRadius: '999px', fontFamily: 'var(--font-body)',
                fontSize: '14px', fontWeight: '600',
                cursor: followLoading ? 'wait' : 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (following) { e.currentTarget.textContent = 'Dejar de seguir'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}}
              onMouseLeave={e => { if (following) { e.currentTarget.textContent = 'Siguiendo'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
            >
              {following ? 'Siguiendo' : 'Seguir'}
            </button>
          ) : (
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                padding: '10px 24px', background: 'transparent',
                color: 'var(--text-primary)', border: '1px solid var(--border)',
                borderRadius: '999px', fontFamily: 'var(--font-body)',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
               Editar perfil
            </button>
          )}
        </div>

        {/* Nombre */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>
          {profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.username}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
          @{profile.username}
        </p>

        {profile.bio && (
          <p style={{ marginTop: '12px', fontSize: '15px', lineHeight: '1.6' }}>
            {profile.bio}
          </p>
        )}

        {profile.website && (
          <a href={profile.website} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--accent)', fontSize: '14px', textDecoration: 'none' }}>
            🔗 {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}

        {/* Contadores */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <StatCounter value={profile.ideas_count}     label="Ideas" />
          <StatCounter value={profile.followers_count} label="Seguidores" />
          <StatCounter value={profile.following_count} label="Siguiendo" />
        </div>
      </div>

      {/* Ideas del usuario */}
      {ideas.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px' }}>💡</div>
          <p style={{ marginTop: '12px' }}>
            {isOwnProfile ? 'Aún no has publicado ninguna idea' : `@${username} no ha publicado ideas aún`}
          </p>
        </div>
      ) : (
        ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)
      )}

    </div>
  );
}

function StatCounter({ value, label }) {
  return (
    <div>
      <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
        {value?.toLocaleString() || 0}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '4px' }}>
        {label}
      </span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-tertiary)', marginBottom: '16px' }} />
      <div style={{ height: 20, width: '40%', background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 14, width: '25%', background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 14, width: '80%', background: 'var(--bg-tertiary)', borderRadius: 4 }} />
    </div>
  );
}

export default Profile;