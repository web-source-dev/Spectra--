'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../../services/api';
import { CheckoutSubmission, CheckoutFormData, CheckoutResponse } from '../../../../types';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<CheckoutSubmission | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    submissionId: Number(params.id),
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSubmission();
    // eslint-disable-next-line
  }, [params.id]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCheckoutSubmission(Number(params.id));
      
      if (response.success) {
        if (response.already_paid && response.redirectUrl) {
          // Redirect to already paid page
          window.location.href = response.redirectUrl;
          return;
        }
        
        if (response.submission) {
          setSubmission(response.submission);
          setFormData(prev => ({
            ...prev,
            name: response.submission!.name,
            email: response.submission!.email,
          }));
        } else {
          setError('No submission data found');
        }
      } else {
        setError(response.message || 'Submission not found or error loading data.');
      }
    } catch (err: unknown) {
      console.error('Error loading submission:', err);
      setError('Submission not found or error loading data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response: CheckoutResponse = await apiService.processCheckout(formData);
      if (response.success) {
        setSuccess(response.message || 'Order created successfully. Redirecting...');
        setTimeout(() => {
          if (response.redirectUrl) {
            router.push(response.redirectUrl);
          }
        }, 1200);
      } else if (response.already_paid && response.redirectUrl) {
        setSuccess('This order has already been paid. Redirecting to order details...');
        setTimeout(() => {
          router.push(response.redirectUrl!);
        }, 1500);
      } else {
        setError(response.message || 'An error occurred. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Error processing checkout:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
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
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <div className="checkout-container" style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div className="checkout-header" style={{ textAlign: 'center', marginBottom: 30 }}>
        <img src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" alt="Spectra Metals Logo" className="checkout-logo img-fluid" style={{ height: 100, marginBottom: 20, borderRadius: 10 }} />
        <h2>Complete Your Purchase</h2>
        <p className="text-muted">Please provide your shipping information to complete your order.</p>
      </div>
      <div className="checkout-form" style={{ backgroundColor: '#fff', borderRadius: 10, padding: 30, boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        {/* Order Summary */}
        <div className="order-summary" style={{ backgroundColor: '#f8f9fa', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <h4 className="form-section-title">Order Summary</h4>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span>Product:</span>
            <span>{submission.metal} ({submission.grams} grams)</span>
          </div>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span>Unit Price:</span>
            <span>${(parseFloat(submission.calculatedPrice.replace(/[^0-9.]/g, '')) / submission.grams).toFixed(2)} per gram</span>
          </div>
          <div className="summary-item summary-total" style={{ fontWeight: 'bold', paddingTop: 10, marginTop: 10, borderTop: '1px solid #dee2e6' }}>
            <span>Total:</span>
            <span>{submission.calculatedPrice}</span>
          </div>
        </div>
        <form id="checkoutForm" onSubmit={handleSubmit}>
          <input type="hidden" name="submissionId" value={submission.id} />
          {/* Personal Information */}
          <h4 className="form-section-title">Personal Information</h4>
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label">Full Name *</label>
              <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone Number *</label>
            <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
          </div>
          {/* Shipping Address */}
          <h4 className="form-section-title">Shipping Address</h4>
          <div className="mb-3">
            <label htmlFor="street" className="form-label">Street Address *</label>
            <input type="text" className="form-control" id="street" name="street" value={formData.street} onChange={handleInputChange} required />
          </div>
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label htmlFor="city" className="form-label">City *</label>
              <input type="text" className="form-control" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="state" className="form-label">State/Province *</label>
              <input type="text" className="form-control" id="state" name="state" value={formData.state} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label htmlFor="zipCode" className="form-label">Zip/Postal Code *</label>
              <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="country" className="form-label">Country *</label>
              <select className="form-select" id="country" name="country" value={formData.country} onChange={handleInputChange} required>
                <option value="">Select a country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Italy">Italy</option>
                <option value="Spain">Spain</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
                <option value="Mexico">Mexico</option>
              </select>
            </div>
          </div>
          {/* Payment Method Selection (only one for now) */}
          <div className="payment-methods" style={{ marginBottom: 30, borderTop: '1px solid #e9ecef', paddingTop: 20 }}>
            <h4 className="form-section-title">Payment Method</h4>
            <p className="payment-method-title">Payment Details:</p>
            <div className="payment-method-option selected" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: 15, border: '1px solid #ced4da', borderRadius: 8 }}>
              <input type="radio" name="paymentMethod" value="onsite" id="onsite-payment" checked readOnly />
              <label htmlFor="onsite-payment">
                <strong>Pay with Credit Card</strong>
                <span className="d-block payment-method-description">Secure on-site payment with your credit card</span>
              </label>
              <div className="ms-auto">
                <img src="https://www.svgrepo.com/show/328132/visa.svg" alt="Visa" style={{ height: 30, marginRight: 10 }} />
                <img src="https://www.svgrepo.com/show/328121/mastercard.svg" alt="Mastercard" style={{ height: 30, marginRight: 10 }} />
                <img src="https://www.svgrepo.com/show/328127/amex.svg" alt="Amex" style={{ height: 30 }} />
              </div>
            </div>
          </div>
          {/* Additional Information */}
          <h4 className="form-section-title">Additional Information</h4>
          <div className="mb-4">
            <label htmlFor="notes" className="form-label">Order Notes (Optional)</label>
            <textarea className="form-control" id="notes" name="notes" rows={3} placeholder="Special instructions for delivery or any other notes" value={formData.notes} onChange={handleInputChange}></textarea>
          </div>
          {/* Submit Button */}
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: 8 }}></span>}
              Proceed to Payment
            </button>
          </div>
          {/* Alerts */}
          {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
          {success && <div className="alert alert-success mt-3" role="alert">{success}</div>}
        </form>
      </div>
    </div>
  );
} 