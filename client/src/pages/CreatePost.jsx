import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiBriefcase, FiUserCheck, FiMapPin, FiPhone, FiFileText, FiLayers, FiCheck, FiEye, FiUser } from 'react-icons/fi';
import './styles/CreatePost.css';

const stateCityMap = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajamahendravaram"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Tezu", "Bomdila"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali", "Una", "Bilaspur"],
  "Jharkhand": ["Jamshedpur", "Ranchi", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Phusro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Kalaburagi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Kannur"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur"],
  "Manipur": ["Imphal", "Thoubal", "Kakching", "Ukhrul", "Churachandpur", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar", "Resubelpara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Pakyong", "Soreng"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tiruppur", "Erode", "Vellore", "Tirunelveli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Ambassa", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Jalpaiguri", "Kharagpur"]
};

const CreatePost = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [type, setType] = useState('Skill');
  const [formData, setFormData] = useState({
    skill: '',
    role: '',
    experience: '',
    salary: '',
    gender: '',
    phone: '',
    phoneVisibility: 'Private',
    state: '',
    city: '',
    area: '',
    description: '',
    availability: ''
  });

  const handleChange = (e) => {
    if (e.target.name === 'state') {
      setFormData({ ...formData, state: e.target.value, city: '' });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post('http://localhost:5000/api/posts', { ...formData, type }, config);
      navigate('/explore');
    } catch (error) {
      console.error('Error creating post', error);
      alert('Failed to create post');
    }
  };

  return (
    <div className="container create-post-container">
      <div className="create-post-header-text">
        <h1 className="create-post-title">Create a Post</h1>
        <p className="create-post-sub">Share your skill or publish a job vacancy to reach local professionals.</p>
      </div>

      <div className="create-post-split-layout">
        {/* Left Side: Form Controls */}
        <div className="card create-post-card">
          {/* Type Segmented Toggle */}
          <div className="type-toggle-group">
            <button 
              type="button" 
              className={`toggle-tab-btn ${type === 'Skill' ? 'active-skill' : ''}`} 
              onClick={() => setType('Skill')}
            >
              <FiBriefcase size={18} /> I'm offering a Skill
            </button>
            <button 
              type="button" 
              className={`toggle-tab-btn ${type === 'Vacancy' ? 'active-vacancy' : ''}`} 
              onClick={() => setType('Vacancy')}
            >
              <FiUserCheck size={18} /> I need a Worker
            </button>
          </div>

          <form onSubmit={handleSubmit} className="create-post-form">
            {type === 'Skill' ? (
              <div>
                <label className="form-label"><FiBriefcase size={16} /> Your Skill / Service Title</label>
                <input type="text" name="skill" value={formData.skill} onChange={handleChange} className="input" placeholder="e.g. Master Plumber & Sanitize Specialist" required />
              </div>
            ) : (
              <div>
                <label className="form-label"><FiUserCheck size={16} /> Job Role Needed</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} className="input" placeholder="e.g. Home Chef / Daily Cook" required />
              </div>
            )}

            <div className="form-row">
              <div className="form-col">
                <label className="form-label"><FiMapPin size={16} /> State</label>
                <select name="state" value={formData.state} onChange={handleChange} className="input" required>
                  <option value="">Select State</option>
                  {Object.keys(stateCityMap).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="form-col">
                <label className="form-label"><FiMapPin size={16} /> City</label>
                <select name="city" value={formData.city} onChange={handleChange} className="input" required disabled={!formData.state}>
                  <option value="">Select City</option>
                  {formData.state && stateCityMap[formData.state]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label"><FiFileText size={16} /> Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input" rows="4" placeholder="Describe the work, timing, experience, or requirements in detail..." required></textarea>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label className="form-label"><FiLayers size={16} /> Experience (Optional)</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleChange} className="input" placeholder="e.g. 5+ Years" />
              </div>
              <div className="form-col">
                <label className="form-label">Gender Preferred</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                  <option value="">Any / Not Specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label className="form-label"><FiPhone size={16} /> Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input" placeholder="e.g. 9876543210" />
              </div>
              <div className="form-col">
                <label className="form-label">Phone Visibility</label>
                <select name="phoneVisibility" value={formData.phoneVisibility} onChange={handleChange} className="input">
                  <option value="Private">Private (In-App Chat Only)</option>
                  <option value="Public">Public (Display Phone on Card)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary create-post-submit-btn">
              Publish Post Now <FiCheck size={18} />
            </button>
          </form>
        </div>

        {/* Right Side: Live Interactive Card Preview */}
        <div className="create-post-preview-panel">
          <div className="preview-panel-header">
            <FiEye size={18} /> <span>Live Card Preview</span>
          </div>

          <div className="card post-card-container preview-card-box">
            <div className="post-card-header">
              <div className="post-card-user-link">
                <div className="post-card-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="post-card-username">{user?.name || 'Your Name'}</h4>
                  <span className="post-card-date">Just Now</span>
                </div>
              </div>
              <span className={`post-card-type-badge ${type === 'Skill' ? 'badge-skill' : 'badge-vacancy'}`}>
                {type}
              </span>
            </div>

            <div>
              <h3 className="post-card-title">
                {(type === 'Skill' ? formData.skill : formData.role) || (type === 'Skill' ? 'Your Skill Title Here' : 'Job Role Needed Here')}
              </h3>
              <p className="post-card-desc">
                {formData.description || 'Your detailed post description will be shown here as you type into the form...'}
              </p>
              
              <div className="post-card-tags">
                <span className="post-card-tag">
                  <FiMapPin size={14} /> {formData.city || 'City'}, {formData.state || 'State'}
                </span>
                {formData.experience && (
                  <span className="post-card-tag"><FiBriefcase size={14} /> {formData.experience}</span>
                )}
                {formData.gender && (
                  <span className="post-card-tag"><FiUser size={14} /> {formData.gender}</span>
                )}
                {formData.phone && formData.phoneVisibility === 'Public' && (
                  <span className="post-card-tag"><FiPhone size={14} /> {formData.phone}</span>
                )}
              </div>
            </div>

            <div className="post-card-actions">
              <span className="btn btn-primary post-action-btn" style={{ opacity: 0.85, cursor: 'default' }}>
                View Details
              </span>
              <span className="btn btn-secondary post-action-btn" style={{ opacity: 0.85, cursor: 'default' }}>
                Message
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
