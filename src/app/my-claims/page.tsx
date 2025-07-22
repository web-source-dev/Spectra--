'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/api';
import { Claim } from '../../types';

function MyClaimsContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [error, setError] = useState('');

  const loadClaims = async (userEmail: string) => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading claims for email:', userEmail);
      const response = await apiService.getClaims(userEmail);
      console.log('Claims response in component:', response);
      setClaims(response.claims || []);
    } catch (err: unknown) {
      console.error('Error loading claims:', err);
      setError(err instanceof Error ? err.message : 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (email.trim()) {
      loadClaims(email.trim());
      setShowEmailForm(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const getClaimTypeBadge = (claimType: string) => {
    switch (claimType) {
      case 'damage':
        return <span className="badge bg-danger">Damage</span>;
      case 'loss':
        return <span className="badge bg-warning">Loss</span>;
      case 'theft':
        return <span className="badge bg-dark">Theft</span>;
      case 'maintenance':
        return <span className="badge bg-info">Maintenance</span>;
      case 'other':
        return <span className="badge bg-secondary">Other</span>;
      default:
        return <span className="badge bg-secondary">{claimType.charAt(0).toUpperCase() + claimType.slice(1)}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h1><i className="bi bi-file-earmark-text me-2"></i>My Claims</h1>
        <p className="lead">View and track your submitted insurance claims</p>
      </div>

      {showEmailForm && (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Enter Your Email</h5>
                <p className="card-text">Please enter your email address to view your claims.</p>
                <div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                  <button type="button" className="btn btn-primary w-100" onClick={handleEmailSubmit}>
                    <i className="bi bi-search me-2"></i>View Claims
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showEmailForm && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Claims for {email}</h3>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setEmail('');
                setClaims([]);
                setError('');
                setShowEmailForm(true);
              }}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Change Email
            </button>
          </div>

          {loading && (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your claims...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <h5><i className="bi bi-exclamation-triangle-fill me-2"></i>Error</h5>
              <p className="mb-0">{error}</p>
            </div>
          )}

          {!loading && !error && claims.length === 0 && (
            <div className="alert alert-info">
              <h5><i className="bi bi-info-circle-fill me-2"></i>No Claims Found</h5>
              <p className="mb-2">You have not submitted any claims yet.</p>
              <p className="mb-0">
                <a href="/my-subscriptions" className="btn btn-primary btn-sm">
                  <i className="bi bi-eye me-1"></i>
                  View Your Subscriptions
                </a>
              </p>
            </div>
          )}

          {!loading && !error && claims.length > 0 && (
            <>
              <div className="row">
                {claims.map((claim) => (
                  <div key={claim._id} className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Type:</strong> {getClaimTypeBadge(claim.claimType)}
                        </div>
                        <div className="mb-2">
                          <strong>SKU:</strong> {claim.sku}
                        </div>
                        <div className="mb-2">
                          <strong>Description:</strong>
                          <p className="text-muted mb-0">{claim.productDescription}</p>
                        </div>
                        {claim.notes && (
                          <div className="mb-2">
                            <strong>Notes:</strong>
                            <p className="text-muted mb-0">{claim.notes}</p>
                          </div>
                        )}
                        {claim.images && claim.images.length > 0 && (
                          <div className="mb-2">
                            <strong>Images:</strong> {claim.images.length} uploaded
                            <div className="row mt-2">
                              {claim.images.slice(0, 3).map((image, index) => (
                                <div key={index} className="col-4">
                                  <img 
                                    src={image.url} 
                                    alt={`Claim image ${index + 1}`}
                                    className="img-thumbnail"
                                    style={{ height: '60px', objectFit: 'cover' }}
                                  />
                                </div>
                              ))}
                              {claim.images.length > 3 && (
                                <div className="col-4 d-flex align-items-center justify-content-center">
                                  <span className="text-muted">+{claim.images.length - 3} more</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="mb-2">
                          <strong>Submitted:</strong> {formatDate(claim.createdAt)}
                        </div>
                        <div className="mb-2">
                          <strong>Last Updated:</strong> {formatDate(claim.updatedAt)}
                        </div>
                        {claim.adminNotes && (
                          <div className="mb-2">
                            <strong>Admin Notes:</strong>
                            <div className="alert alert-info py-2">
                              <small>{claim.adminNotes}</small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-4">
                <div className="alert alert-info">
                  <h5><i className="bi bi-info-circle-fill me-2"></i>Need Help?</h5>
                  <p className="mb-2">If you have questions about your claims or need to submit a new claim, please contact our support team:</p>
                  <div className="d-flex justify-content-center gap-3">
                    <a href="mailto:support@spectrametal.com" className="text-decoration-none">
                      <i className="bi bi-envelope-fill me-1"></i>
                      support@spectrametal.com
                    </a>
                    <a href="tel:+18005551234" className="text-decoration-none">
                      <i className="bi bi-telephone-fill me-1"></i>
                      1-800-555-1234
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="text-center mt-4">
        <button 
          className="btn btn-secondary" 
          onClick={() => router.push('/')}
        >
          <i className="bi bi-arrow-left"></i> Back to Metal Price Tracker
        </button>
      </div>
    </div>
  );
}

function MyClaimsFallback() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </div>
    </div>
  );
}

export default function MyClaimsPage() {
  return (
    <Suspense fallback={<MyClaimsFallback />}>
      <MyClaimsContent />
    </Suspense>
  );
} 