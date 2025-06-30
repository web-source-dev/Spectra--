'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '../../services/api';
import { MySubscriptionsData, CancelSubscriptionResponse } from '../../types';

export default function MySubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<MySubscriptionsData | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      loadSubscriptions(emailParam);
    } else {
      setShowEmailForm(true);
      setLoading(false);
    }
  }, [searchParams]);

  const loadSubscriptions = async (userEmail: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getMySubscriptions(userEmail);
      setData(response);
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error loading subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setShowEmailForm(false);
      loadSubscriptions(email.trim());
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingSubscription(subscriptionId);
      
      const response: CancelSubscriptionResponse = await apiService.cancelSubscription(subscriptionId);
      
      if (response.success) {
        // Reload subscriptions to get updated status
        await loadSubscriptions(email);
        alert('Subscription cancelled successfully. It will remain active until the end of the current billing period.');
      } else {
        alert(response.message || 'Failed to cancel subscription');
      }
    } catch (err: unknown) {
      console.error('Error cancelling subscription:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancellingSubscription(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Active</span>;
      case 'trialing':
        return <span className="badge bg-info">Trial</span>;
      case 'incomplete':
        return <span className="badge bg-warning">Processing</span>;
      case 'incomplete_expired':
        return <span className="badge bg-danger">Expired</span>;
      case 'past_due':
        return <span className="badge bg-warning">Past Due</span>;
      case 'canceled':
        return <span className="badge bg-secondary">Cancelled</span>;
      case 'unpaid':
        return <span className="badge bg-danger">Unpaid</span>;
      default:
        return <span className="badge bg-secondary">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    return plan === 'monthly' ? 
      <span className="badge bg-primary">Monthly</span> : 
      <span className="badge bg-success">Annual</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <img 
          src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" 
          alt="Logo" 
          className="img-fluid" 
          style={{ height: '180px', maxWidth: '250px', borderRadius: '10px', mixBlendMode: 'difference' }}
        />
        <h1 className="mt-4">My Subscriptions</h1>
        <p className="lead">Manage your metal protection plans</p>
      </div>

      {showEmailForm && (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Enter Your Email</h5>
                <p className="card-text">Please enter the email address associated with your subscriptions to view them.</p>
                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    View Subscriptions
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <h4>Error Loading Subscriptions</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => setShowEmailForm(true)}>
            Try Again
          </button>
        </div>
      )}

      {data && !showEmailForm && (
        <>
          {data.subscriptions.length === 0 ? (
            <div className="text-center">
              <div className="card">
                <div className="card-body">
                  <i className="bi bi-inbox-fill text-muted" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">No Subscriptions Found</h4>
                  <p className="text-muted">
                    No subscriptions were found for the email address: <strong>{email}</strong>
                  </p>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowEmailForm(true)}
                    >
                      Try Different Email
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => router.push('/')}
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Your Protection Plans</h2>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => setShowEmailForm(true)}
                  >
                    <i className="bi bi-envelope me-1"></i>
                    Change Email
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm" 
                    onClick={() => router.push('/')}
                  >
                    <i className="bi bi-house me-1"></i>
                    Home
                  </button>
                </div>
              </div>

              <div className="row">
                {data.subscriptions.map((subscription) => (
                  <div key={subscription._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Subscription #{subscription.stripeSubscriptionId.slice(-8)}</h6>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="card-body">
                        {subscription.product && (
                          <div className="mb-3">
                            <h6>Product Details</h6>
                            <p className="mb-1"><strong>Name:</strong> {subscription.product.name}</p>
                            <p className="mb-1"><strong>Metal:</strong> {subscription.product.metal}</p>
                            <p className="mb-1"><strong>Weight:</strong> {subscription.product.grams} grams</p>
                            <p className="mb-1"><strong>Value:</strong> {subscription.product.calculatedPrice}</p>
                            {subscription.product.imagePath && (
                              <img 
                                src={subscription.product.imagePath} 
                                alt="Product" 
                                className="img-fluid mt-2" 
                                style={{ maxHeight: '100px', borderRadius: '5px' }}
                              />
                            )}
                          </div>
                        )}

                        <div className="mb-3">
                          <h6>Subscription Details</h6>
                          <p className="mb-1"><strong>Plan:</strong> {getPlanBadge(subscription.plan)}</p>
                          <p className="mb-1"><strong>SKU:</strong> {subscription.sku}</p>
                          <p className="mb-1"><strong>Current Period Ends:</strong> {formatDate(subscription.currentPeriodEnd)}</p>
                          {subscription.lastPaymentDate && (
                            <p className="mb-1"><strong>Last Payment:</strong> {formatDate(subscription.lastPaymentDate)}</p>
                          )}
                          <p className="mb-1"><strong>Created:</strong> {formatDate(subscription.createdAt)}</p>
                        </div>

                        <div className="d-grid gap-2">
                          {(subscription.status === 'incomplete' || 
                            subscription.status === 'incomplete_expired' || 
                            subscription.status === 'unpaid') && (
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => router.push(`/claim-policy/${encodeURIComponent(subscription.email)}/${encodeURIComponent(subscription.sku)}`)}
                            >
                              <i className="bi bi-credit-card me-1"></i>
                              Complete Payment
                            </button>
                          )}

                          {subscription.status === 'active' && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelSubscription(subscription.stripeSubscriptionId)}
                              disabled={cancellingSubscription === subscription.stripeSubscriptionId}
                            >
                              {cancellingSubscription === subscription.stripeSubscriptionId ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-x-circle me-1"></i>
                                  Cancel Subscription
                                </>
                              )}
                            </button>
                          )}

                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => router.push(`/claim-policy/${encodeURIComponent(subscription.email)}/${encodeURIComponent(subscription.sku)}`)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-4">
                <div className="alert alert-info">
                  <h5><i className="bi bi-info-circle-fill me-2"></i>Need Help?</h5>
                  <p className="mb-2">If you need to make changes to your subscription or have questions, please contact our support team:</p>
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
    </div>
  );
} 