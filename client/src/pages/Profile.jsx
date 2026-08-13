import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import './styles/Profile.css';

import { PostGridSkeleton } from '../components/Skeleton';

const Profile = () => {
  const { user, updateProfile, openLogoutModal } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Skill');
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !user._id) return;
      try {
        setLoadingPosts(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [myPostsRes, likedPostsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/posts?userId=${user._id}`),
          axios.get('http://localhost:5000/api/posts/liked', config)
        ]);
        setMyPosts(myPostsRes.data);
        setLikedPosts(likedPostsRes.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleDeletePost = (postId) => {
    setMyPosts(currentPosts => currentPosts.filter(p => p._id !== postId));
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    about: user?.about || ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  if (!user) return <div className="container profile-auth-prompt">Please log in to view your profile</div>;

  return (
    <div className="container profile-container">
      <div className="card profile-card">
        
        {!isEditing ? (
          <>
            <div className="profile-header-top">
              <div className="profile-avatar-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              
              <div className="profile-info-stack">
                <h2 className="profile-handle">{user?.email ? user.email.split('@')[0] : 'user'}</h2>
                <h3 className="profile-name">{user?.name}</h3>
                {user?.phone && <p className="profile-phone">📞 {user.phone}</p>}
                {user?.about && <p className="profile-about">{user.about}</p>}
              </div>
            </div>

            <div className="profile-actions-row">
              <button onClick={() => setIsEditing(true)} className="profile-action-btn profile-edit-btn">
                Edit Profile
              </button>
              <button onClick={openLogoutModal} className="profile-action-btn profile-logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <h3 className="edit-form-title">Edit Profile</h3>
            
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            
            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
            </div>
            
            <div>
              <label className="form-label">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input" />
            </div>

            <div>
              <label className="form-label">About Me</label>
              <textarea name="about" value={formData.about} onChange={handleChange} className="input" rows="3" placeholder="Tell people about your skills or what you're looking for..."></textarea>
            </div>

            <div className="edit-form-actions">
              <button type="submit" className="btn btn-primary btn-flex-1">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-flex-1">Cancel</button>
            </div>
          </form>
        )}

      </div>

      <div className="posts-section">
        <h3 className="posts-section-title">Your Posts</h3>
        
        <div className="tab-group-wrapper">
          <div className="tab-group">
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
            <button 
              className={`tab-btn ${activeTab === 'Liked' ? 'tab-btn-active' : ''}`} 
              onClick={() => setActiveTab('Liked')}
            >
              Liked
            </button>
          </div>
          <hr className="profile-tab-divider" />
        </div>

        {loadingPosts ? (
          <PostGridSkeleton count={3} />
        ) : (
          <div>
            {activeTab === 'Liked' ? (
              likedPosts.length === 0 ? (
                <div className="empty-posts-msg">
                  You haven't liked any posts yet.
                </div>
              ) : (
                <div className="profile-posts-grid">
                  {likedPosts.map(post => <PostCard key={post._id} post={post} />)}
                </div>
              )
            ) : (
              myPosts.filter(p => p.type === activeTab && (p.userId?._id === user._id || p.userId === user._id)).length === 0 ? (
                <div className="empty-posts-msg">
                  You haven't created any {activeTab.toLowerCase()} posts yet.
                </div>
              ) : (
                <div className="profile-posts-grid">
                  {myPosts
                    .filter(p => p.type === activeTab && (p.userId?._id === user._id || p.userId === user._id))
                    .map(post => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)}
                </div>
              )
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
