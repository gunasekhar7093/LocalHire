import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiMapPin, FiBriefcase, FiUser, FiPhone } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import './PostCard.css';

const PostCard = ({ post, onDelete }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user && post.likes) {
      setIsLiked(post.likes.includes(user._id));
    }
  }, [user, post.likes]);

  /* Lock body scroll when Delete Post modal is open */
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDeleteModal]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`${API_BASE_URL}/api/posts/${post._id}/like`, {}, config);
      setIsLiked(res.data.likes.includes(user._id));
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const confirmDeletePost = async () => {
    try {
      setIsDeleting(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE_URL}/api/posts/${post._id}`, config);
      setShowDeleteModal(false);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
      setIsDeleting(false);
    }
  };

  const handleMessage = async () => {
    if (!user) return navigate('/login');
    try {
      setLoadingMsg(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const receiverId = post.userId._id || post.userId;
      const response = await axios.post(`${API_BASE_URL}/api/messages/conversation/get-or-create/${receiverId}`, {}, config);
      navigate('/messages', { state: { conversationId: response.data.conversationId } });
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoadingMsg(false);
    }
  };

  return (
    <>
      <div className="card post-card-container">
        <div className="post-card-header">
          <Link to={`/user/${post.userId?._id || post.userId}`} className="post-card-user-link">
            <div className="post-card-avatar">
              {post.userId?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="post-card-username">{post.userId?.name || 'Unknown User'}</h4>
              <span className="post-card-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
          <span className={`post-card-type-badge ${post.type === 'Skill' ? 'badge-skill' : 'badge-vacancy'}`}>
            {post.type}
          </span>
        </div>

        <div>
          <h3 className="post-card-title">{post.skill || post.role}</h3>
          <p className="post-card-desc">
            {post.description}
          </p>
          
          <div className="post-card-tags">
            <span className="post-card-tag"><FiMapPin size={14} /> {post.city}, {post.state}</span>
            {post.experience && <span className="post-card-tag"><FiBriefcase size={14} /> {post.experience}</span>}
            {post.gender && <span className="post-card-tag"><FiUser size={14} /> {post.gender}</span>}
            {post.phone && post.phoneVisibility === 'Public' && <span className="post-card-tag"><FiPhone size={14} /> {post.phone}</span>}
          </div>
        </div>

        <div className="post-card-actions">
          <button 
            onClick={handleLike} 
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
            className={`like-btn ${isLiked ? 'liked' : ''}`}
          >
            {isLiked ? <FaHeart size={20} /> : <FiHeart size={20} />}
          </button>
          <Link to={`/post/${post._id}`} className="btn btn-primary post-action-btn">View Details</Link>
          {(!user || (user && user._id !== (post.userId._id || post.userId))) ? (
            <button onClick={handleMessage} disabled={loadingMsg} className="btn btn-secondary post-action-btn">
              {loadingMsg ? 'Sending...' : 'Message'}
            </button>
          ) : (
            <button onClick={() => setShowDeleteModal(true)} className="btn btn-secondary post-action-btn delete-post-btn">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Post Confirmation Modal via React Portal */}
      {showDeleteModal && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Post?</h3>
            <p className="modal-desc">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)} 
                className="modal-cancel-btn"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeletePost} 
                className="modal-confirm-btn"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PostCard;
