'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '../../services/api';
import Link from 'next/link';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderNumberData, setOrderNumberData] = useState<string | undefined>(orderNumber || undefined);

  useEffect(() => {
    loadCancelData();
  }, [orderNumber]);

  const loadCancelData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getPaymentCancel(orderNumber || undefined);
      
      if (response.success) {
        setOrderNumberData(response.orderNumber);
      } else {
        setError('Failed to load cancel data');
      }
    } catch (err) {
      console.error('Error loading cancel data:', err);
      setError('Error loading cancel data. Please try again.');
    } finally {
      setLoading(false);
    }
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
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      paddingTop: '40px',
      paddingBottom: '40px',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '40px',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <i className="bi bi-x-circle-fill" style={{
            fontSize: '5rem',
            color: '#dc3545',
            marginBottom: '20px'
          }}></i>
          
          <h1 style={{
            fontSize: '2.5rem',
            color: '#212529',
            marginBottom: '20px'
          }}>
            Payment Cancelled
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#6c757d',
            marginBottom: '30px'
          }}>
            Your payment process was cancelled. No charges have been made to your account.
          </p>
          
          {orderNumberData && (
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              padding: '15px',
              margin: '30px 0',
              textAlign: 'center',
              fontSize: '1.2rem'
            }}>
              <p>Your order reference: <strong style={{ color: '#0d6efd' }}>{orderNumberData}</strong></p>
              <p className="small text-muted">You can use this reference if you decide to complete your payment later.</p>
            </div>
          )}
          
          <div className="mt-4">
            <p>What would you like to do next?</p>
            <div className="d-flex flex-wrap justify-content-center">
              <Link
                href="/"
                style={{
                  backgroundColor: '#0d6efd',
                  borderColor: '#0d6efd',
                  color: 'white',
                  padding: '10px 25px',
                  fontWeight: 500,
                  margin: '10px 5px',
                  textDecoration: 'none',
                  borderRadius: '5px'
                }}
              >
                Return to Home  
              </Link>
              
              {orderNumberData && (
                <Link
                  href={`/checkout/${orderNumberData}`}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: '#6c757d',
                    color: '#6c757d',
                    border: '1px solid #6c757d',
                    padding: '10px 25px',
                    fontWeight: 500,
                    margin: '10px 5px',
                    textDecoration: 'none',
                    borderRadius: '5px'
                  }}
                >
                  Try Payment Again
                </Link>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-muted">
              If you experienced any issues during the payment process or have any questions, 
              please contact our support team at{' '}
              <Link href="mailto:support@spectra.com">support@spectra.com</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentCancelFallback() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading payment cancellation details...</p>
      </div>
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <Suspense fallback={<PaymentCancelFallback />}>
      <PaymentCancelContent />
    </Suspense>
  );
} 