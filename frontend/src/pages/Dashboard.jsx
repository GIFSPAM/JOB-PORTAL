function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/";
  };

  return (
    <div className="reg-card" style={{ width: '900px', display: 'block', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Dashboard Overview 🚀</h1>
        <button className="primary-btn" style={{ width: 'auto', padding: '10px 25px' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--secondary)' }}>Active Apps</h4>
          <span style={{ fontSize: '2rem', fontWeight: '800' }}>12</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--secondary)' }}>Profile Views</h4>
          <span style={{ fontSize: '2rem', fontWeight: '800' }}>450</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--secondary)' }}>New Matches</h4>
          <span style={{ fontSize: '2rem', fontWeight: '800' }}>5</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;