import React from 'react';
import { Link } from 'react-router-dom';

const WHeader = () => {
  return (
    <div
      style={{
        backgroundColor: '#2b2675',
        color: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'static', // <-- ensures it scrolls with page
      }}
    >
      <nav>
        <Link to="/login" style={linkStyle}>Login</Link>
        <Link to="/register" style={{ ...linkStyle, marginLeft: '1.5rem' }}>Sign Up</Link>
      </nav>
    </div>
  );
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
};

export default WHeader;
