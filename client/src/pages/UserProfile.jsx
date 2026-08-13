import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { FiMessageCircle } from 'react-icons/fi';
import PostCard from '../components/PostCard';
import './styles/UserProfile.css';

import { ProfileSkeleton } from '../components/Skeleton';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Skill');
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`${API_BASE_URL}/api/auth/user/${id}`);
        setProfileUser(userRes.data);

        const postRes = await axios.get(`${API_BASE_URL}/api/posts?userId=${id}`);
        setUserPosts(postRes.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserData();
  }, [id]);

  const handleMessage = async () => {
    if (!user) return navigate('/login');
    try {
      setLoadingMsg(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(`${API_BASE_URL}/api/messages/conversation/get-or-create/${id}`, {}, config);
      navigate('/messages', { state: { conversationId: response.data.conversationId } });
    } catch (error) {
      console.error(error);
      alert('Failed to start conversation');
    } finally {
      setLoadingMsg(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profileUser) {
    return <div className="user-profile-not-found">User not found.</div>;
  }

  const handle = profileUser?.email ? profileUser.email.split('@')[0] : 'user';

  return (
    <div className="container user-profile-container">
      <button onClick={() => navigate(-1)} className="user-profile-back-btn">
        &larr; Back
      </button>

      <div className="card user-profile-card">
        <div className="user-profile-header-top">
          <div className="user-profile-avatar-lg">
            {profileUser.name?.charAt(0) || 'U'}
          </div>
          
          <div className="user-profile-info-stack">
            <h2 className="user-profile-handle">{profileUser?.email ? profileUser.email.split('@')[0] : 'user'}</h2>
            <h3 className="user-profile-name">{profileUser?.name}</h3>
            {profileUser?.phone && <p className="user-profile-phone">📞 {profileUser.phone}</p>}
            {profileUser?.about && <p className="user-profile-about">{profileUser.about}</p>}
          </div>
        </div>

        {user && user._id !== profileUser._id && (
          <div className="user-profile-actions-row">
            <button 
              onClick={handleMessage} 
              disabled={loadingMsg} 
              className="btn btn-primary user-profile-message-btn" 
            >
              <FiMessageCircle /> {loadingMsg ? 'Connecting...' : 'Message'}
            </button>
          </div>
        )}
      </div>

      <div className="user-posts-section">
        <h3 className="user-posts-title">{profileUser.name}'s Posts</h3>
        
        <div className="user-tab-group-wrapper">
          <div className="user-posts-tabs">
            <button 
              className={`tab-btn ${activeTab === 'Skill' ? 'tab-btn-active' : ''}`} 
              onClick={() => setActiveTab('Skill')}
            >
              Skills
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Vacancy' ? 'tab-btn-active' : ''}`} 
              onClick={() => setActiveTab('Vacancy')}
            >
              Vacancies
            </button>
          </div>
          <hr className="user-tab-divider" />
        </div>

        <div>
          {userPosts.filter(p => p.type === activeTab).length === 0 ? (
            <div className="empty-user-posts">
              No {activeTab.toLowerCase()} posts yet.
            </div>
          ) : (
            <div className="user-posts-grid">
              {userPosts
                .filter(p => p.type === activeTab)
                .map(post => <PostCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
