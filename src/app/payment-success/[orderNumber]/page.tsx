'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '../../../services/api';
import { Order } from '../../../types';
import Link from 'next/link';

export default function PaymentSuccess() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderNumber) {
      loadOrderData();
    }
  }, [orderNumber]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getPaymentSuccess(orderNumber);
      
      if (response.success) {
        setOrder(response.order);
      } else {
        setError('Failed to load order data');
      }
    } catch (err) {
      console.error('Error loading order data:', err);
      setError('Error loading order data. Please try again.');
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

  if (!order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>Order Not Found</h4>
          <p>The order you&apos;re looking for could not be found.</p>
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
          <img 
            src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" 
            alt="Spectra Metals Logo" 
            style={{ maxWidth: '150px', marginBottom: '20px' }}
          />
          
          <i className="bi bi-check-circle-fill" style={{
            fontSize: '5rem',
            color: '#28a745',
            marginBottom: '20px'
          }}></i>
          
          <h1 style={{
            fontSize: '2.5rem',
            color: '#212529',
            marginBottom: '20px'
          }}>
            Payment Successful!
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#6c757d',
            marginBottom: '30px'
          }}>
            Thank you for your purchase. Your order has been confirmed and is now being processed.
          </p>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '20px',
            margin: '30px 0',
            textAlign: 'left'
          }}>
            <h3 className="mb-4">Order Details</h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Order Number:</strong>
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
              <span>{formatDate(order.createdAt)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Product:</strong>
              <span>{order.metal} ({order.grams} grams)</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Amount Paid:</strong>
              <span>{order.calculatedPrice}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <strong>Payment Status:</strong>
              <span className="badge bg-success">Paid</span>
            </div>
            
            {order.deliveryAddress && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: '1px solid #e9ecef'
              }}>
                <strong>Shipping To:</strong>
                <span style={{ textAlign: 'right' }}>
                  {order.name}<br />
                  {order.deliveryAddress.street}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}<br />
                  {order.deliveryAddress.country}
                </span>
              </div>
            )}
          </div>
          
          <p>A confirmation email has been sent to <strong>{order.email}</strong> with your receipt details.</p>
          
          {(order.receiptUrl || order.invoiceUrl) && (
            <Link
              href={order.receiptUrl || order.invoiceUrl || ''} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                color: '#28a745',
                textDecoration: 'none'
              }}
            >
              <i className="bi bi-file-earmark-pdf"></i> View Receipt
            </Link>
          )}
          
          <div className="mt-4">
            <Link
              href="https://www.spectragemsandminerals.com"
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                color: 'white',
                padding: '10px 25px',
                fontWeight: 500,
                marginTop: '10px',
                textDecoration: 'none',
                borderRadius: '5px'
              }}
            >
              Return to Home Page
            </Link>
          </div>
          
          <div style={{
            marginTop: '30px',
            fontSize: '0.9rem',
            color: '#6c757d'
          }}>
            <p>&copy; {new Date().getFullYear()} Spectra Metal Transactions. All rights reserved.</p>
            <p>123 Metal Street, New York, NY 10001</p>
          </div>
        </div>
      </div>
    </div>
  );
} 