import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PostCard from '../components/PostCard';
import { FiSearch, FiX, FiFilter, FiBriefcase, FiUserCheck, FiCompass } from 'react-icons/fi';
import './styles/Explore.css';

import { PostGridSkeleton } from '../components/Skeleton';

const CATEGORY_PRESETS = [
  { label: 'All Opportunities', value: '', type: 'All' },
  { label: '🔧 Plumbers', value: 'Plumber', type: 'Skill' },
  { label: '⚡ Electricians', value: 'Electrician', type: 'Skill' },
  { label: '🚗 Drivers', value: 'Driver', type: 'Skill' },
  { label: '👨‍🍳 Cooks & Chefs', value: 'Cook', type: 'Skill' },
  { label: '💼 Vacancies Only', value: '', type: 'Vacancy' },
  { label: '🛠️ Skill Posts', value: '', type: 'Skill' },
];

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedPreset, setSelectedPreset] = useState('All Opportunities');

  useEffect(() => {
    fetchPosts();
  }, [activeQuery, filterType]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/posts?type=${filterType}`;
      if (activeQuery) {
        url += `&keyword=${encodeURIComponent(activeQuery)}`;
      }
      const res = await axios.get(url);
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setSelectedPreset('All Opportunities');
  };

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.label);
    setFilterType(preset.type);
    setSearchInput(preset.value);
    setActiveQuery(preset.value);
  };

  return (
    <div className="container explore-container">
      {/* Top Banner Header */}
      <div className="explore-banner-card">
        <div className="explore-banner-content">
          <div className="explore-title-badge">
            <FiCompass size={16} /> Explore Local Network
          </div>
          <h1 className="explore-hero-title">
            Discover Skilled Talent & Job Openings Near You
          </h1>
          <p className="explore-hero-sub">
            Filter by trade, city, or posting type to instantly connect with community professionals.
          </p>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="explore-presets-scroll">
        {CATEGORY_PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={`preset-chip ${selectedPreset === preset.label ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Search & Filter Bar */}
      <div className="explore-filter-bar">
        <form onSubmit={handleSearchSubmit} className="explore-search-wrapper">
          <input 
            type="text" 
            placeholder="Search skills, cities, roles, keywords..." 
            aria-label="Search skills, roles, keywords"
            className="input explore-search-input" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="search-actions-group">
            {searchInput && (
              <button 
                type="button" 
                onClick={handleClearSearch} 
                className="explore-search-clear-btn" 
                aria-label="Clear search query"
                title="Clear search"
              >
                <FiX size={18} />
              </button>
            )}
            <button type="submit" className="explore-search-btn" aria-label="Submit search" title="Search">
              <FiSearch size={20} />
            </button>
          </div>
        </form>

        <div className="filter-select-wrapper">
          <FiFilter className="filter-icon" size={16} />
          <select 
            className="input explore-select-input" 
            aria-label="Filter post type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Skill">Skill Posts</option>
            <option value="Vacancy">Vacancy Posts</option>
          </select>
        </div>
      </div>

      {/* Posts Count Bar */}
      <div className="explore-results-header">
        <h3 className="results-count-title">
          {loading ? 'Searching opportunities...' : `${posts.length} ${posts.length === 1 ? 'Opportunity' : 'Opportunities'} Found`}
        </h3>
      </div>

      {/* Posts Grid or Loading State */}
      {loading ? (
        <PostGridSkeleton count={6} />
      ) : posts.length === 0 ? (
        <div className="explore-empty-card">
          <div className="empty-icon-circle">
            <FiSearch size={32} />
          </div>
          <h3>No matching posts found</h3>
          <p>Try searching for a different trade, city, or clearing your keyword filter.</p>
          <button onClick={handleClearSearch} className="btn btn-secondary empty-reset-btn">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="explore-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
