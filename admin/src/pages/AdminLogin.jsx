import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAdminCredentials, setAdminAuth } from '../utils/auth';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminCredentials(credentials.username, credentials.password)) {
      setAdminAuth();
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
      setCredentials({ username: '', password: '' });
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-building fs-1 text-primary"></i>
                  <h2 className="mt-3 mb-2 fw-bold text-dark">Admin Portal</h2>
                  <p className="text-muted">Sign in to access your dashboard</p>
                </div>
                
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 mb-3">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
