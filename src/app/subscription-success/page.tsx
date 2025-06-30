'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '../../services/api';
import { SubscriptionSuccessResponse } from '../../types';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionSuccessResponse | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get subscription ID from URL parameters
      const subscriptionId = searchParams.get('subscription') || 
                           searchParams.get('payment_intent') ||
                           searchParams.get('subscription_id');

      if (!subscriptionId) {
        setError('No subscription information found');
        setLoading(false);
        return;
      }

      const data = await apiService.getSubscriptionSuccess(subscriptionId);
      
      if (data.success) {
        setSubscriptionData(data);
      } else {
        setError('Failed to load subscription data');
      }
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return amount || '$0.00';
  };

  if (loading) {
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
        Loading subscription details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>No Subscription Data</h4>
          <p>Unable to load subscription information.</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { subscription } = subscriptionData;

  return (
    <div style={{
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#f8f9fa',
      paddingTop: '40px',
      paddingBottom: '40px',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '40px',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          {/* Success Icon */}
          <div style={{
            fontSize: '5rem',
            color: '#28a745',
            marginBottom: '20px'
          }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '2.5rem',
            color: '#212529',
            marginBottom: '20px'
          }}>
            Subscription Successful!
          </h1>

          {/* Message */}
          <p style={{
            fontSize: '1.2rem',
            color: '#6c757d',
            marginBottom: '30px'
          }}>
            Thank you for subscribing to our metal protection plan. Your subscription is now active.
          </p>

          {/* Subscription Details */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '25px',
            margin: '30px 0',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Subscription Details</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <strong>Subscription ID:</strong>
                <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  {subscription.stripeSubscriptionId}
                </div>
              </div>
              
              <div>
                <strong>Status:</strong>
                <div style={{ 
                  color: subscription.status === 'active' ? '#28a745' : '#ffc107',
                  fontWeight: 'bold'
                }}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </div>
              </div>
              
              <div>
                <strong>Plan:</strong>
                <div style={{ color: '#6c757d' }}>
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </div>
              </div>
              
              <div>
                <strong>Email:</strong>
                <div style={{ color: '#6c757d' }}>
                  {subscription.email}
                </div>
              </div>
              
              <div>
                <strong>SKU:</strong>
                <div style={{ color: '#6c757d' }}>
                  {subscription.sku}
                </div>
              </div>
              
              <div>
                <strong>Created:</strong>
                <div style={{ color: '#6c757d' }}>
                  {formatDate(subscription.createdAt)}
                </div>
              </div>
            </div>

            <div style={{
              height: '1px',
              backgroundColor: '#e9ecef',
              margin: '20px 0'
            }}></div>

            <div>
              <strong>Next Billing Date:</strong>
              <div style={{ color: '#6c757d', marginBottom: '10px' }}>
                {formatDate(subscription.currentPeriodEnd)}
              </div>
            </div>

            {subscription.lastPaymentDate && (
              <div>
                <strong>Last Payment:</strong>
                <div style={{ color: '#6c757d' }}>
                  {formatDate(subscription.lastPaymentDate)}
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          {subscription.product && (
            <div style={{
              backgroundColor: '#e8f5e8',
              borderRadius: '10px',
              padding: '20px',
              margin: '30px 0',
              textAlign: 'left'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#155724' }}>Protected Product</h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }}>
                <div>
                  <strong>Product Name:</strong>
                  <div style={{ color: '#155724' }}>
                    {subscription.product.name}
                  </div>
                </div>
                
                <div>
                  <strong>Metal Type:</strong>
                  <div style={{ color: '#155724' }}>
                    {subscription.product.metal}
                  </div>
                </div>
                
                <div>
                  <strong>Weight:</strong>
                  <div style={{ color: '#155724' }}>
                    {subscription.product.grams} grams
                  </div>
                </div>
                
                <div>
                  <strong>Value:</strong>
                  <div style={{ color: '#155724' }}>
                    {formatCurrency(subscription.product.calculatedPrice)}
                  </div>
                </div>
              </div>

              {subscription.product.imagePath && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Product Image:</strong>
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={subscription.product.imagePath} 
                      alt="Product"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What's Next */}
          <div style={{
            textAlign: 'left',
            marginBottom: '30px'
          }}>
            <h4>What&apos;s Next:</h4>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>
                You&apos;ll receive a confirmation email with your subscription details.
              </li>
              <li style={{ marginBottom: '10px' }}>
                Your subscription will automatically renew on {formatDate(subscription.currentPeriodEnd)}.
              </li>
              <li style={{ marginBottom: '10px' }}>
                You can manage your subscription anytime through your account dashboard.
              </li>
              <li style={{ marginBottom: '10px' }}>
                If you have any questions, please contact our support team.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              className="btn btn-primary"
              onClick={() => router.push('/my-subscriptions')}
              style={{
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                padding: '12px 25px',
                fontWeight: 500
              }}
            >
              <i className="bi bi-person-circle"></i> View My Subscriptions
            </button>
            
            <button 
              className="btn btn-success"
              onClick={() => router.push('/')}
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                padding: '12px 25px',
                fontWeight: 500
              }}
            >
              <i className="bi bi-house"></i> Return to Home
            </button>
          </div>

          {/* Contact Information */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#6c757d'
          }}>
            <p style={{ marginBottom: '10px' }}>
              <strong>Need Help?</strong> Contact our support team:
            </p>
            <p style={{ marginBottom: '5px' }}>
              Email: support@spectragemsandminerals.com
            </p>
            <p style={{ marginBottom: '0' }}>
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSuccessFallback() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading subscription details...</p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<SubscriptionSuccessFallback />}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
} 