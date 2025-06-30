'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../services/api';
import { AdminLoginRequest } from '../../../types';

export default function AdminLogin() {
  const [formData, setFormData] = useState<AdminLoginRequest>({
    username: '',
    password: '',
    rememberMe: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    const authToken = localStorage.getItem('spectra_admin_auth');
    
    if (authToken) {
      try {
        const isValid = await apiService.verifyAdminToken(authToken);
        if (isValid.valid) {
          router.push('/admin/dashboard');
          return;
        } else {
          localStorage.removeItem('spectra_admin_auth');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('spectra_admin_auth');
      }
    }
    
    setCheckingAuth(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: AdminLoginRequest) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.adminLogin(formData);
      
      if (response.success) {
        if (formData.rememberMe) {
          localStorage.setItem('spectra_admin_auth', response.token || 'authenticated_' + Date.now());
        }
        router.push(response.redirect || '/admin/dashboard');
      } else {
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        fontSize: '1.5rem',
        color: '#007bff',
        fontWeight: 700
      }}>
        Checking Authentication...
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      margin: 0,
    }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          padding: '30px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img 
              src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" 
              alt="Spectra Metals Logo" 
              style={{ maxWidth: '120px', marginBottom: '15px' }}
            />
            <h1 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              Admin Login
            </h1>
          </div>
          
          {error && (
            <div style={{
              color: '#842029',
              backgroundColor: '#f8d7da',
              borderColor: '#f5c2c7',
              padding: '1rem',
              marginBottom: '20px',
              border: '1px solid transparent',
              borderRadius: '0.25rem',
            }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
          )}
          
          {loading && (
            <div style={{
              color: '#055160',
              backgroundColor: '#cff4fc',
              borderColor: '#b6effb',
              padding: '1rem',
              marginBottom: '20px',
              border: '1px solid transparent',
              borderRadius: '0.25rem',
            }}>
              <i className="bi bi-hourglass-split me-2"></i> Checking Authentication...
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" className="form-label">Username</label>
              <div style={{ display: 'flex' }}>
                <span style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRight: 'none',
                  padding: '0.375rem 0.75rem',
                  borderTopLeftRadius: '0.375rem',
                  borderBottomLeftRadius: '0.375rem',
                }}>
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  required
                  autoFocus
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{
                    height: '50px',
                    borderRadius: '0 5px 5px 0',
                    paddingLeft: '15px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderLeft: 'none',
                    flex: 1,
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ display: 'flex' }}>
                <span style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRight: 'none',
                  padding: '0.375rem 0.75rem',
                  borderTopLeftRadius: '0.375rem',
                  borderBottomLeftRadius: '0.375rem',
                }}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    height: '50px',
                    borderRadius: '0 5px 5px 0',
                    paddingLeft: '15px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderLeft: 'none',
                    flex: 1,
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="checkbox"
                className="form-check-input"
                id="remember-me"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label className="form-check-label" htmlFor="remember-me">
                Remember me
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                height: '50px',
                fontWeight: 600,
                fontSize: '16px',
                width: '100%',
                marginTop: '10px',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
            </button>
          </form>
          
          <a 
            href="#" 
            onClick={() => {
              if (window.top) {
                window.top.location.href = 'https://www.spectragemsandminerals.com';
              }
            }}
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '20px',
              color: '#6c757d',
              textDecoration: 'none',
            }}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Home
          </a>
        </div>
      </div>
    </div>
  );
} 