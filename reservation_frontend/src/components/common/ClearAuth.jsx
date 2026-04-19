import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const ClearAuth = () => {
  const dispatch = useDispatch();

  const handleClearAuth = () => {
    dispatch(logout());
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Clear Authentication State</h3>
      <p>Click below to clear authentication and enable proper routing</p>
      <button 
        onClick={handleClearAuth}
        style={{
          padding: '10px 20px',
          background: '#087592',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Clear Auth & Reload
      </button>
    </div>
  );
};

export default ClearAuth;
