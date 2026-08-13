import React from 'react';
import './Skeleton.css';

export const PostCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-user">
          <div className="skeleton-box skeleton-avatar" />
          <div className="skeleton-user-info">
            <div className="skeleton-box" style={{ width: '100px', height: '16px' }} />
            <div className="skeleton-box" style={{ width: '60px', height: '12px' }} />
          </div>
        </div>
        <div className="skeleton-box skeleton-badge" />
      </div>

      <div>
        <div className="skeleton-box skeleton-title" />
        <div className="skeleton-box skeleton-text" />
        <div className="skeleton-box skeleton-text-short" />
        <div className="skeleton-tags">
          <div className="skeleton-box skeleton-tag" />
          <div className="skeleton-box skeleton-tag" />
        </div>
      </div>

      <div className="skeleton-actions">
        <div className="skeleton-box skeleton-btn-icon" />
        <div className="skeleton-box skeleton-btn-full" />
        <div className="skeleton-box skeleton-btn-full" />
      </div>
    </div>
  );
};

export const PostGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="explore-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <PostCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="container profile-container">
      <div className="skeleton-profile-card">
        <div className="skeleton-profile-header">
          <div className="skeleton-box skeleton-profile-avatar" />
          <div className="skeleton-profile-info">
            <div className="skeleton-box" style={{ width: '180px', height: '28px' }} />
            <div className="skeleton-box" style={{ width: '120px', height: '18px' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '50px', borderRadius: '1rem', marginTop: '0.5rem' }} />
          </div>
        </div>
        <div className="skeleton-profile-actions">
          <div className="skeleton-box skeleton-btn-full" style={{ height: '42px' }} />
          <div className="skeleton-box skeleton-btn-full" style={{ height: '42px' }} />
        </div>
      </div>

      <div className="posts-section">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="skeleton-box" style={{ width: '140px', height: '24px' }} />
        </div>
        <PostGridSkeleton count={3} />
      </div>
    </div>
  );
};

export const PostDetailsSkeleton = () => {
  return (
    <div className="container post-details-container">
      <div className="skeleton-box" style={{ width: '80px', height: '20px', marginBottom: '1.5rem' }} />
      <div className="skeleton-details-card">
        <div className="skeleton-header">
          <div className="skeleton-user">
            <div className="skeleton-box" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
            <div className="skeleton-user-info">
              <div className="skeleton-box" style={{ width: '140px', height: '20px' }} />
              <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
            </div>
          </div>
          <div className="skeleton-box skeleton-badge" style={{ width: '80px', height: '28px' }} />
        </div>

        <div className="skeleton-box" style={{ width: '50%', height: '32px' }} />

        <div className="skeleton-box" style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-md)' }} />

        <div className="skeleton-box" style={{ width: '100%', height: '80px' }} />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="skeleton-box" style={{ width: '180px', height: '45px', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
    </div>
  );
};

export const MessagesSkeleton = () => {
  return (
    <div className="container-fluid messages-container">
      <div className="card conversations-sidebar">
        <div className="skeleton-box" style={{ width: '120px', height: '24px', margin: '0 1.25rem 1.25rem 1.25rem' }} />
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="skeleton-conv-item">
            <div className="skeleton-box" style={{ width: '130px', height: '16px', marginBottom: '0.35rem' }} />
            <div className="skeleton-box" style={{ width: '180px', height: '14px' }} />
          </div>
        ))}
      </div>

      <div className="card chat-area">
        <div className="chat-header">
          <div className="skeleton-box" style={{ width: '150px', height: '22px' }} />
        </div>
        <div className="chat-messages-box">
          <div className="skeleton-box skeleton-msg-bubble receiver" style={{ width: '55%', height: '45px', alignSelf: 'flex-start' }} />
          <div className="skeleton-box skeleton-msg-bubble sender" style={{ width: '45%', height: '40px', alignSelf: 'flex-end' }} />
          <div className="skeleton-box skeleton-msg-bubble receiver" style={{ width: '60%', height: '50px', alignSelf: 'flex-start' }} />
          <div className="skeleton-box skeleton-msg-bubble sender" style={{ width: '50%', height: '42px', alignSelf: 'flex-end' }} />
        </div>
        <div className="chat-input-form">
          <div className="skeleton-box" style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton-box" style={{ width: '80px', height: '42px', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
    </div>
  );
};
