import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft, FiMapPin, FiPhone, FiBriefcase, FiAlignLeft, FiClock, FiMessageCircle, FiUser } from 'react-icons/fi';
import './styles/PostDetails.css';

import { PostDetailsSkeleton } from '../components/Skeleton';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return <PostDetailsSkeleton />;
  }

  if (!post) {
    return <div className="container post-details-not-found">Post not found.</div>;
  }

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
    <div className="container post-details-container">
      <button 
        onClick={() => navigate(-1)} 
        className="btn back-btn" 
      >
        <FiArrowLeft /> Back
      </button>

      <div className="card">
        <div className="post-details-header">
          <Link to={`/user/${post.userId?._id || post.userId}`} className="post-user-link">
            <div className="post-user-avatar">
              {post.userId?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="post-user-name">{post.userId?.name || 'Unknown User'}</h3>
              <p className="post-date">Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </Link>
          <span className={`post-type-tag ${post.type === 'Skill' ? 'post-type-skill' : 'post-type-vacancy'}`}>
            {post.type} Post
          </span>
        </div>

        <h2 className="post-details-title">
          {post.skill || post.role}
        </h2>

        <div className="post-info-box">
          
          <div className="info-item">
            <FiMapPin className="info-icon" />
            <div>
              <h4 className="info-label">Location</h4>
              <p className="info-value">{post.city}, {post.state}</p>
            </div>
          </div>

          {post.experience && (
            <div className="info-item">
              <FiBriefcase className="info-icon" />
              <div>
                <h4 className="info-label">Experience</h4>
                <p className="info-value">{post.experience}</p>
              </div>
            </div>
          )}

          {post.gender && (
            <div className="info-item">
              <FiUser className="info-icon" />
              <div>
                <h4 className="info-label">Gender</h4>
                <p className="info-value">{post.gender}</p>
              </div>
            </div>
          )}

          <div className="info-item">
            <FiPhone className="info-icon" />
            <div>
              <h4 className="info-label">Contact</h4>
              <p className="info-value-bold">
                {post.phoneVisibility === 'Public' && post.phone ? post.phone : 'Contact through Messages'}
              </p>
            </div>
          </div>

        </div>

        <div className="post-description-box">
          <div className="description-header">
            <FiAlignLeft />
            <h3 className="description-title">Description</h3>
          </div>
          <p className="description-text">
            {post.description}
          </p>
        </div>

        {(!user || (user && user._id !== (post.userId?._id || post.userId))) && (
          <div className="post-action-wrapper">
            <button onClick={handleMessage} disabled={loadingMsg} className="btn btn-primary message-btn">
              <FiMessageCircle /> {loadingMsg ? 'Connecting...' : 'Send Message'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostDetails;
