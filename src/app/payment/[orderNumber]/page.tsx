'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe, StripeCardElement, StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { apiService } from '../../../services/api';
import { PaymentPageResponse, PaymentProcessingRequest } from '../../../types';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentPageResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardElement, setCardElement] = useState<unknown>(null);
  const [cardErrors, setCardErrors] = useState('');

  useEffect(() => {
    loadPaymentData();
  }, [orderNumber]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.getPaymentPageData(orderNumber);
      
      if (data.success) {
        if (data.already_paid) {
          // Redirect to already paid page
          router.push(`/payment-already-paid/${orderNumber}`);
          return;
        }
        setPaymentData(data);
      } else {
        setError(data.message || 'Failed to load payment data');
      }
    } catch (err: unknown) {
      console.error('Error loading payment data:', err);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentData && !cardElement) {
      initializeStripe();
    }
  }, [paymentData]);

  const initializeStripe = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        setError('Failed to load Stripe');
        return;
      }

      const elements = stripe.elements();
      const card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#495057',
            fontFamily: 'Arial, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#dc3545',
            iconColor: '#dc3545',
          },
        },
      });

      card.mount('#card-element');
      setCardElement(card);

      // Handle card errors
      card.on('change', (event: StripeCardElementChangeEvent) => {
        if (event.error ) {
          setCardErrors(event.error.message);
        } else {
          setCardErrors('');
        }
      });
    } catch (err: unknown) {
      console.error('Error initializing Stripe:', err);
      setError('Failed to initialize payment system');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!paymentData || !cardElement) {
      setError('Payment system not ready');
      return;
    }

    setProcessing(true);
    setCardErrors('');

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Create payment method
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement as StripeCardElement, 
        billing_details: {
          name: cardholderName,
          email: paymentData.order.email
        },
      });

      if (error) {
        setCardErrors(error.message || 'Payment method creation failed');
        setProcessing(false);
        return;
      }

      // Process payment on server
      const paymentRequest: PaymentProcessingRequest = {
        payment_method_id: paymentMethod.id,
        order_id: paymentData.order._id,
        order_number: paymentData.order.orderNumber
      };

      const result = await apiService.processPayment(paymentRequest);

      if (result.error) {
        setCardErrors(result.error.message);
        setProcessing(false);
      } else if (result.already_paid || result.success) {
        router.push(`/payment-success/${orderNumber}`);
      } else if (result.requires_action && result.payment_intent_client_secret) {
        // Handle 3D Secure authentication
        const { error: actionError, paymentIntent } = await stripe.handleCardAction(
          result.payment_intent_client_secret
        );

        if (actionError) {
          setCardErrors(actionError.message || 'Authentication failed');
          setProcessing(false);
        } else {
          // Confirm payment after authentication
          const confirmRequest: PaymentProcessingRequest = {
            payment_intent_id: paymentIntent.id,
            order_id: paymentData.order._id,
            order_number: paymentData.order.orderNumber
          };

          const confirmResult = await apiService.processPayment(confirmRequest);

          if (confirmResult.success || confirmResult.already_paid) {
            router.push(`/payment-success/${orderNumber}`);
          } else {
            setCardErrors(confirmResult.error?.message || 'Payment confirmation failed');
            setProcessing(false);
          }
        }
      } else {
        setCardErrors('Payment processing failed');
        setProcessing(false);
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      setCardErrors('Payment processing failed. Please try again.');
      setProcessing(false);
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
        Loading payment page...
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

  if (!paymentData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>No Payment Data</h4>
          <p>Unable to load payment information.</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { order } = paymentData;

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      paddingTop: '40px',
      paddingBottom: '40px',
      minHeight: '100vh'
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img 
          src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" 
          alt="Spectra Metals Logo"
          style={{ maxWidth: '150px' }}
        />
      </div>
      
      <div className="container">
        {/* Payment Steps */}
        <div style={{
          display: 'flex',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', flex: 1, position: 'relative', padding: '0 10px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#e9ecef',
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontWeight: 600
            }}>
              1
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Shipping</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1, position: 'relative', padding: '0 10px' }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              width: '100%',
              right: '50%',
              height: '2px',
              backgroundColor: '#e9ecef',
              zIndex: -1
            }}></div>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#28a745',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontWeight: 600
            }}>
              2
            </div>
            <div style={{ fontSize: '0.85rem', color: '#212529', fontWeight: 600 }}>Payment</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1, position: 'relative', padding: '0 10px' }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              width: '100%',
              right: '50%',
              height: '2px',
              backgroundColor: '#e9ecef',
              zIndex: -1
            }}></div>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#e9ecef',
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontWeight: 600
            }}>
              3
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Confirmation</div>
          </div>
        </div>
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Payment Details */}
          <div style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '30px',
            boxShadow: '0 0 15px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px'
            }}>
              Payment Information
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="cardholder-name" style={{
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: '#495057'
                }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cardholder-name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="card-element" style={{
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: '#495057'
                }}>
                  Credit or Debit Card
                </label>
                <div 
                  id="card-element"
                  style={{
                    padding: '12px',
                    border: '1px solid #ced4da',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}
                ></div>
                {cardErrors && (
                  <div style={{
                    color: '#dc3545',
                    fontSize: '0.9rem',
                    marginTop: '8px'
                  }}>
                    {cardErrors}
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" style={{
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: '#495057'
                }}>
                  Email for Receipt
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={order.email}
                  readOnly
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ced4da',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={processing}
                style={{
                  backgroundColor: processing ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  marginTop: '20px',
                  position: 'relative'
                }}
              >
                {processing ? (
                  <>
                    <span style={{ opacity: 0 }}>Pay {order.calculatedPrice}</span>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '20px',
                      height: '20px',
                      marginTop: '-10px',
                      marginLeft: '-10px',
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spinner 0.6s linear infinite'
                    }}></div>
                  </>
                ) : (
                  `Pay ${order.calculatedPrice}`
                )}
              </button>
              
              <div style={{
                fontSize: '0.9rem',
                color: '#6c757d',
                marginTop: '20px'
              }}>
                <p>Your payment information is secure. We use industry-standard encryption to protect your data.</p>
                <p>You&apos;ll receive a receipt via email once your payment is processed.</p>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '30px',
            boxShadow: '0 0 15px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#333',
              marginBottom: '20px'
            }}>
              Order Summary
            </h2>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span>Order Number</span>
              <span>{order.orderNumber}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span>Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
            
            <div style={{
              height: '1px',
              backgroundColor: '#e9ecef',
              margin: '20px 0'
            }}></div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span>{order.metal} ({order.grams} grams)</span>
              <span>{order.calculatedPrice}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '1.2rem',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #e9ecef'
            }}>
              <span>Total</span>
              <span>{order.calculatedPrice}</span>
            </div>
            
            <div style={{
              height: '1px',
              backgroundColor: '#e9ecef',
              margin: '20px 0'
            }}></div>
            
            <h5>Shipping Address</h5>
            <p>
              {order.name}<br />
              {order.deliveryAddress?.street}<br />
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}<br />
              {order.deliveryAddress?.country}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spinner {
          to {transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
} 