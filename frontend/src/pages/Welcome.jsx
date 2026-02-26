import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Theme.css';

function Welcome() {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="reg-card" 
      style={{ width: '480px', padding: '60px', display: 'block', textAlign: 'center' }}
    >
      <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '10px' }}>JobPortal</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
        Your premium gateway to professional growth.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button className="primary-btn" onClick={() => navigate('/login')}>
          Sign In to Account
        </button>
        <button 
          className="primary-btn" 
          style={{ background: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)' }}
          onClick={() => navigate('/register')}
        >
          Create New Identity
        </button>
      </div>
    </motion.div>
  );
}

export default Welcome;