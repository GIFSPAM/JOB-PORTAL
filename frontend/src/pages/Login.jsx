import { useState } from 'react';
import { apiRequest } from '../api';
import './Theme.css';

function Login() {
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/auth/login', 'POST', creds);
      localStorage.setItem('token', data.token); // Store JWT
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Login Failed: " + err.message);
    }
  };

  return (
    <div className="reg-card" style={{ width: '450px', display: 'block', padding: '50px' }}>
      <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Enter your credentials to continue</p>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setCreds({...creds, email: e.target.value})} required />
        <input type="password" placeholder="Password" onChange={(e) => setCreds({...creds, password: e.target.value})} required />
        <button type="submit" className="primary-btn">Sign In</button>
      </form>
    </div>
  );
}

export default Login;