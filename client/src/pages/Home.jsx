import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FiArrowRight, FiCompass, FiBriefcase, FiUsers, FiMessageSquare,
  FiShield, FiZap, FiSearch, FiCheckCircle, FiMapPin, FiStar, FiClock
} from 'react-icons/fi';
import './styles/Home.css';

const POPULAR_TRADES = [
  { icon: '🔧', name: 'Plumbing & Sanitation', count: '140+ Active Posts' },
  { icon: '⚡', name: 'Electrical & Repairs', count: '210+ Active Posts' },
  { icon: '🚗', name: 'Drivers & Transport', count: '180+ Active Posts' },
  { icon: '👨‍🍳', name: 'Chefs & Home Cooks', count: '95+ Active Posts' },
  { icon: '🧹', name: 'Housekeeping & Care', count: '310+ Active Posts' },
  { icon: '🧱', name: 'Carpentry & Construction', count: '120+ Active Posts' },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/explore', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="home-page-wrapper">
      {/* Hero Section Split Layout */}
      <section className="container home-hero-split">
        <div className="hero-left-content">
          <div className="home-hero-badge">
            <FiZap className="badge-icon" />
            <span>Hyper-Local Hiring Network</span>
          </div>
          
          <h1 className="home-hero-title">
            Hire Local Talent or Share Your Skills in <span className="title-gradient">Your Neighborhood</span>
          </h1>
          
          <p className="home-hero-desc">
            LocalHire is the direct social platform connecting workers and employers without middleman fees. Find electricians, drivers, plumbers, and home help instantly.
          </p>

          <div className="home-hero-cta">
            <Link to="/register" className="btn btn-primary home-btn-cta">
              Create Free Account <FiArrowRight size={18} />
            </Link>
            <Link to="/explore" className="btn btn-secondary home-btn-explore">
              <FiCompass size={18} /> Browse Opportunities
            </Link>
          </div>

          <div className="hero-trust-row">
            <div className="trust-item">
              <FiCheckCircle className="trust-icon" /> <span>Direct In-App Messaging</span>
            </div>
            <div className="trust-item">
              <FiCheckCircle className="trust-icon" /> <span>Zero Commission Fees</span>
            </div>
          </div>
        </div>

        {/* Hero Right Visual Graphic Stack */}
        <div className="hero-right-visual">
          <div className="visual-card-stack">
            {/* Card 1: Sample Skill Post */}
            <div className="card floating-preview-card card-top">
              <div className="preview-header">
                <div className="preview-avatar">R</div>
                <div>
                  <h4 className="preview-name">Ramesh Kumar <FiCheckCircle className="verified-blue" /></h4>
                  <span className="preview-role">Master Electrician • Visakhapatnam</span>
                </div>
                <span className="badge-skill">Skill</span>
              </div>
              <p className="preview-text">Available for commercial & home electrical wiring, invertor setup, and LED installation.</p>
              <div className="preview-footer">
                <span className="preview-tag"><FiMapPin size={12} /> Visakhapatnam</span>
                <span className="preview-tag"><FiStar size={12} /> 5 Years Exp</span>
              </div>
            </div>

            {/* Card 2: Sample Vacancy Post */}
            <div className="card floating-preview-card card-bottom">
              <div className="preview-header">
                <div className="preview-avatar avatar-purple">S</div>
                <div>
                  <h4 className="preview-name">Sunita Sharma</h4>
                  <span className="preview-role">Need Daily Home Cook • Bengaluru</span>
                </div>
                <span className="badge-vacancy">Vacancy</span>
              </div>
              <p className="preview-text">Urgently looking for a North & South Indian cook for family of 4. Morning & Evening shifts.</p>
              <div className="preview-footer">
                <span className="preview-tag"><FiMapPin size={12} /> Indiranagar, BLR</span>
                <span className="preview-tag"><FiClock size={12} /> Immediate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <section className="container home-metrics-section">
        <div className="home-metrics-grid">
          <div className="metric-item">
            <h3 className="metric-number">100%</h3>
            <p className="metric-label">Direct Peer-to-Peer Contact</p>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <h3 className="metric-number">0%</h3>
            <p className="metric-label">Agency or Middleman Cuts</p>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <h3 className="metric-number">Instant</h3>
            <p className="metric-label">Socket-Powered Live Chat</p>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="container home-categories-section">
        <div className="section-header">
          <span className="section-subtitle">Popular Local Trades</span>
          <h2 className="section-title">Explore Skills & Services by Category</h2>
        </div>

        <div className="categories-grid">
          {POPULAR_TRADES.map((trade) => (
            <Link to={`/explore`} key={trade.name} className="card category-card">
              <div className="category-emoji">{trade.icon}</div>
              <h3 className="category-name">{trade.name}</h3>
              <span className="category-count">{trade.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="container home-workflow-section">
        <div className="section-header">
          <span className="section-subtitle">Simple 3-Step Process</span>
          <h2 className="section-title">How LocalHire Works</h2>
        </div>

        <div className="workflow-grid">
          <div className="card workflow-step-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Create or Explore</h3>
            <p className="step-desc">
              Post your skills to offer services or publish a vacancy specifying the role you need filled.
            </p>
          </div>

          <div className="card workflow-step-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Connect via Chat</h3>
            <p className="step-desc">
              Send instant messages directly to candidates or clients without leaking phone numbers upfront.
            </p>
          </div>

          <div className="card workflow-step-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Hire & Work</h3>
            <p className="step-desc">
              Agree on terms directly and get the job done with zero commission deducted from your earnings.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="container home-banner-section">
        <div className="home-cta-banner">
          <div className="banner-content">
            <h2 className="banner-title">Ready to hire or showcase your trades?</h2>
            <p className="banner-desc">Join thousands of local workers and employers building direct connections today.</p>
          </div>
          <Link to="/register" className="btn btn-primary banner-cta-btn">
            Get Started Now <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
