'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe, StripeElements } from '@stripe/stripe-js';
import { apiService } from '../../../../services/api';
import { ClaimPolicyData, CreateSubscriptionResponse } from '../../../../types/index';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

export default function ClaimPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const email = decodeURIComponent(params.email as string);
  const sku = decodeURIComponent(params.sku as string);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ClaimPolicyData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | ''>('');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [paymentElement, setPaymentElement] = useState<unknown>(null);
  const [elements, setElements] = useState<unknown>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClaimPolicyData();
  }, [email, sku]);

  const loadClaimPolicyData = async () => {
    try {
      console.log(selectedPrice);
      setLoading(true);
      setError('');
      
      const response = await apiService.getClaimPolicyData(email, sku);
      setData(response);
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error loading claim policy data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load claim policy data');
      setLoading(false);
    }
  };

  const handlePlanSelection = async (plan: 'monthly' | 'yearly') => {
    try {
      setSelectedPlan(plan);
      const price = plan === 'monthly' ? data!.monthlyPrice : data!.yearlyPrice;
      setSelectedPrice(price);

      // Create subscription
      const response: CreateSubscriptionResponse = await apiService.createSubscription(
        email,
        sku,
        plan
      );

      setClientSecret(response.clientSecret);
      setSubscriptionId(response.subscriptionId);

      // Initialize Stripe Elements
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      const newElements = stripe.elements({
        clientSecret: response.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#28a745',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Segoe UI, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px'
          }
        }
      });

      const newPaymentElement = newElements.create('payment', {
        layout: {
          type: 'tabs',
          defaultCollapsed: false
        }
      });

      setElements(newElements);
      setPaymentElement(newPaymentElement);

      // Mount the payment element
      setTimeout(() => {
        const container = document.getElementById('payment-element');
        if (container) {
          newPaymentElement.mount('#payment-element');
        }
      }, 100);

    } catch (err: unknown) {
      console.error('Error creating subscription:', err);
      setPaymentMessage(err instanceof Error ? err.message : 'Failed to create subscription');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!elements || !paymentElement || !clientSecret) {
      setPaymentMessage('Payment elements not initialized. Please select a plan first.');
      return;
    }

    setIsSubmitting(true);
    setPaymentMessage('Processing payment...');

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.confirmPayment({
        elements: elements as StripeElements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success?subscription=${subscriptionId}&payment_intent_client_secret=${encodeURIComponent(clientSecret)}`,
        },
      });

      if (error) {
        setPaymentMessage(error.message || 'Payment failed');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      setPaymentMessage(err instanceof Error ? err.message : 'Payment processing error');
      setIsSubmitting(false);
    }
  };

  const handleIncompletePayment = async () => {
    try {
      const response = await apiService.retrieveSubscriptionPayment(data!.existingSubscription!.stripeSubscriptionId);
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      const newElements = stripe.elements({
        clientSecret: response.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#28a745',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Segoe UI, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px'
          }
        }
      });

      const newPaymentElement = newElements.create('payment');
      setElements(newElements);
      setPaymentElement(newPaymentElement);

      setTimeout(() => {
        const container = document.getElementById('incomplete-payment-element');
        if (container) {
          newPaymentElement.mount('#incomplete-payment-element');
        }
      }, 100);

    } catch (err: unknown) {
      console.error('Error retrieving payment:', err);
      setPaymentMessage(err instanceof Error ? err.message : 'Failed to retrieve payment information');
    }
  };

  const handleIncompletePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!elements || !paymentElement) {
      setPaymentMessage('Payment form not initialized');
      return;
    }

    setIsSubmitting(true);
    setPaymentMessage('Processing payment...');

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.confirmPayment({
        elements: elements as StripeElements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success?subscription=${data!.existingSubscription!.stripeSubscriptionId}`,
        },
      });

      if (error) {
        setPaymentMessage(error.message || 'Payment failed');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      setPaymentMessage(err instanceof Error ? err.message : 'Payment processing error');
      setIsSubmitting(false);
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
      default:
        return <span className="badge bg-secondary">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading claim policy data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error Loading Claim Policy</h4>
          <p>{error || 'Failed to load claim policy data'}</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Return to Home
          </button>
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
        <h1 className="mt-4">Metal Protection Plan</h1>
        <p className="lead">Protect your valuable metal investment with our comprehensive coverage plans</p>
      </div>

      {/* Product Details */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">Product Details</h2>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Product ID/SKU:</strong> {data.sku}</p>
              <p><strong>Metal Type:</strong> {data.submission.metal}</p>
              <p><strong>Weight:</strong> {data.submission.grams} grams</p>
              <p><strong>Value:</strong> {data.submission.calculatedPrice}</p>
              <p><strong>Customer Email:</strong> {data.email}</p>
            </div>
            {data.submission.imagePath && (
              <div className="col-md-6 text-center">
                <img 
                  src={data.submission.imagePath} 
                  alt="Product Image" 
                  className="img-fluid" 
                  style={{ maxHeight: '200px', borderRadius: '5px' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {data.existingSubscription ? (
        /* Existing Subscription */
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Your Current Protection Plan</h3>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <p><strong>Subscription ID:</strong> {data.existingSubscription.stripeSubscriptionId}</p>
                <p><strong>Status:</strong> {getStatusBadge(data.existingSubscription.status)}</p>
                <p><strong>Plan:</strong> {data.existingSubscription.plan === 'monthly' ? 'Monthly Protection' : 'Annual Protection'}</p>
                <p><strong>Current Period Ends:</strong> {new Date(data.existingSubscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
            </div>

            {(data.existingSubscription.status === 'incomplete' || 
              data.existingSubscription.status === 'incomplete_expired' || 
              data.existingSubscription.status === 'unpaid') && (
              <div className="alert alert-warning">
                <h5><i className="bi bi-exclamation-triangle-fill me-2"></i> Your subscription requires payment completion</h5>
                <p>Your subscription is currently in a processing state. Please complete your payment to activate your protection plan.</p>
                <button 
                  className="btn btn-success" 
                  onClick={handleIncompletePayment}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-credit-card me-2"></i> Complete Payment
                </button>
              </div>
            )}

            <div className="alert alert-info">
              <p className="mb-0"><strong>Need to change your plan?</strong> Please contact our customer support to make changes to your existing subscription.</p>
              <p className="mb-0 mt-2">
                <i className="bi bi-envelope-fill me-2"></i> Email: <a href="mailto:support@spectrametal.com">support@spectrametal.com</a><br />
                <i className="bi bi-telephone-fill me-2"></i> Phone: <a href="tel:+18005551234">1-800-555-1234</a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* New Subscription Plans */
        <>
          <h2 className="mb-4">Choose Your Protection Plan</h2>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h4 className="card-title">Monthly Protection</h4>
                  <h2 className="text-primary">${data.monthlyPrice}</h2>
                  <p className="text-muted">/month</p>
                  <button 
                    className="btn btn-primary w-100" 
                    onClick={() => handlePlanSelection('monthly')}
                    disabled={selectedPlan === 'monthly'}
                  >
                    {selectedPlan === 'monthly' ? 'Selected' : 'Select Monthly Plan'}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card h-100 border-primary">
                <div className="card-body text-center position-relative">
                  <div className="position-absolute top-0 start-50 translate-middle-x">
                    <span className="badge bg-success">MOST POPULAR</span>
                  </div>
                  <h4 className="card-title">Annual Protection</h4>
                  <h2 className="text-primary">${data.yearlyPrice}</h2>
                  <p className="text-muted">/year <span className="badge bg-danger">SAVE 10%</span></p>
                  <button 
                    className="btn btn-success w-100" 
                    onClick={() => handlePlanSelection('yearly')}
                    disabled={selectedPlan === 'yearly'}
                  >
                    {selectedPlan === 'yearly' ? 'Selected' : 'Select Annual Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Form */}
      {selectedPlan && (
        <div className="card mt-4">
          <div className="card-body">
            <h3 className="mb-4">Complete Your {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Subscription</h3>
            <form onSubmit={handlePaymentSubmit}>
              <div id="payment-element" className="mb-3"></div>
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting || !paymentElement}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </button>
            </form>
            {paymentMessage && (
              <div className="alert alert-info mt-3">
                {paymentMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incomplete Payment Form */}
      {data.existingSubscription && 
       (data.existingSubscription.status === 'incomplete' || 
        data.existingSubscription.status === 'incomplete_expired' || 
        data.existingSubscription.status === 'unpaid') && (
        <div className="card mt-4" id="incomplete-payment-container" style={{ display: elements ? 'block' : 'none' }}>
          <div className="card-body">
            <h4>Complete Your Subscription Payment</h4>
            <div id="incomplete-payment-element" className="mb-3"></div>
            <button 
              className="btn btn-primary" 
              onClick={handleIncompletePaymentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
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