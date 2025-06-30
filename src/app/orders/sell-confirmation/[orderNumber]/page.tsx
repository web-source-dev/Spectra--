'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '../../../../services/api';
import { SellConfirmationResponse } from '../../../../types';

export default function SellConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellData, setSellData] = useState<SellConfirmationResponse | null>(null);

  useEffect(() => {
    loadSellConfirmationData();
  }, [orderNumber]);

  const loadSellConfirmationData = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiService.getSellConfirmation(orderNumber);
      
      if (data.success) {
        setSellData(data);
      } else {
        setError('Failed to load sell confirmation data');
      }
    } catch (err) {
      console.error('Error loading sell confirmation data:', err);
      setError('Failed to load sell confirmation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
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
        Loading sell confirmation...
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

  if (!sellData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>No Sell Data</h4>
          <p>Unable to load sell confirmation information.</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { order } = sellData;

  return (
    <div style={{
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
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
          {/* Sell Icon */}
          <div style={{
            fontSize: '5rem',
            color: '#dc3545',
            marginBottom: '20px'
          }}>
            <i className="bi bi-currency-exchange"></i>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '2.5rem',
            color: '#212529',
            marginBottom: '20px'
          }}>
            Sell Request Confirmed
          </h1>

          {/* Message */}
          <p style={{
            fontSize: '1.2rem',
            color: '#6c757d',
            marginBottom: '30px'
          }}>
            Thank you for choosing to sell your metals with us. Your request has been submitted successfully.
          </p>

          {/* Transaction Details */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '20px',
            margin: '30px 0',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Transaction Details</h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Reference Number:</strong>
              <span>{order.orderNumber}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Date:</strong>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Metal:</strong>
              <span>{order.metal}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Weight:</strong>
              <span>{order.grams} grams</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0',
              paddingBottom: '0'
            }}>
              <strong>Offered Price:</strong>
              <span>{order.calculatedPrice}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div style={{
            textAlign: 'left',
            marginBottom: '30px'
          }}>
            <h4>Next Steps:</h4>
            <ol style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>Package your metal securely, including your reference number.</li>
              <li style={{ marginBottom: '10px' }}>Ship your package to the address below.</li>
              <li style={{ marginBottom: '10px' }}>Once we receive and verify your metals, we&apos;ll process your payment within 3-5 business days.</li>
              <li style={{ marginBottom: '10px' }}>You&apos;ll receive payment confirmation via email.</li>
            </ol>
          </div>

          {/* Shipping Address */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '25px',
            margin: '30px 0',
            textAlign: 'center',
            fontSize: '1.2rem',
            border: '2px dashed #dc3545'
          }}>
            <div style={{
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#dc3545'
            }}>
              SHIP YOUR METALS TO:
            </div>
            <p>
              Spectra Metal Transactions<br />
              123 Metal Street<br />
              New York, NY 10001<br />
              United States
            </p>
            <div style={{ marginTop: '1rem' }}>
              <strong>Include your reference number:</strong><br />
              <span>{order.orderNumber}</span>
              <button 
                style={{
                  backgroundColor: '#e9ecef',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
                onClick={() => copyToClipboard(order.orderNumber)}
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
            </div>
          </div>

          {/* Email Confirmation */}
          <p>
            A confirmation email has been sent to <strong>{order.email}</strong> with your receipt and shipping details.
          </p>

          {/* Receipt Link */}
          {order.receiptUrl && (
            <a 
              href={order.receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                color: '#0d6efd',
                textDecoration: 'none'
              }}
            >
              <i className="bi bi-file-earmark-pdf"></i> View Receipt
            </a>
          )}

          {/* Return Button */}
          <div style={{ marginTop: '1.5rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (window.top) {
                  window.top.location.href = 'https://www.spectragemsandminerals.com';
                } else {
                  window.location.href = 'https://www.spectragemsandminerals.com';
                }
              }}
              style={{
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                padding: '10px 25px',
                fontWeight: 500,
                margin: '10px 5px'
              }}
            >
              Return to Home Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 