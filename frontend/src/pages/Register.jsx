import { useState } from 'react';
import { apiRequest } from '../api';
import './Theme.css';

function Register() {
  const [role, setRole] = useState('jobseeker');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    education: '',
    company_name: '',
    industry: '',
    secretKey: '' // 🚨 Changed from admin_key to secretKey to match backend
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Constructing the payload based on backend expectations
    const payload = { 
        email: formData.email, 
        password: formData.password, 
        role 
    };

    if (role === 'jobseeker') {
      payload.full_name = formData.full_name;
      payload.education = formData.education;
    } else if (role === 'employer') {
      payload.company_name = formData.company_name;
      payload.industry = formData.industry;
    } else if (role === 'admin') {
      // 🚨 Sending secretKey as the backend expects
      payload.secretKey = formData.secretKey; 
    }

    try {
      await apiRequest('/auth/register', 'POST', payload);
      alert("Registration successful! Welcome to the team.");
      window.location.href = "/login";
    } catch (err) {
      alert("Registration Failed: " + err.message);
    }
  };

  return (
    <div className="reg-card">
      <div className="auth-section">
        <h2>Join JobPortal</h2>
        <p>Choose your professional role</p>
        
        <div className="input-group">
          <label>Account Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="jobseeker">Job Seeker</option>
            <option value="employer">Employer</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <input type="email" id="email" placeholder="email@example.com" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" id="password" placeholder="••••••••" onChange={handleChange} required />
        </div>
      </div>

      <div className="profile-section">
        <h2>Profile Details</h2>
        <p>Provide the essentials for your role</p>

        {role === 'jobseeker' && (
          <div className="role-content">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" id="full_name" placeholder="John Doe" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Education</label>
              <input type="text" id="education" placeholder="e.g. B.Tech CS" onChange={handleChange} />
            </div>
          </div>
        )}

        {role === 'employer' && (
          <div className="role-content">
            <div className="input-group">
              <label>Company Name</label>
              <input type="text" id="company_name" placeholder="Acme Corp" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Industry</label>
              <input type="text" id="industry" placeholder="Software / Finance" onChange={handleChange} />
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="role-content">
            <div className="input-group">
              <label>Admin Secret Key</label>
              <input 
                type="password" 
                id="secretKey" // 🚨 ID updated to match the state property
                placeholder="Enter System Access Code" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        )}

        <button className="primary-btn" onClick={handleSubmit}>
          Complete Registration
        </button>
      </div>
    </div>
  );
}

export default Register;