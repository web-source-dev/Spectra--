'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  apiService
} from '../services/api';
import {
  MetalPrices, 
  ChartData, 
  Submission,
  SkuDataResponse,
  SkuSuggestionsResponse,
  OtpResponse,
  FormSubmissionResponse,
  SellTransactionResponse
} from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metalPrices, setMetalPrices] = useState<MetalPrices>({
    Gold: 0,
    Silver: 0,
    Platinum: 0,
    Palladium: 0,
  });
  const [chartData, setChartData] = useState<{
    gold: ChartData;
    silver: ChartData;
    platinum: ChartData;
    palladium: ChartData;
  }>({
    gold: { dates: [], prices: [] },
    silver: { dates: [], prices: [] },
    platinum: { dates: [], prices: [] },
    palladium: { dates: [], prices: [] },
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sku: '',
    description: '',
    metal: 'Gold',
    grams: '',
    calculatedPrice: '$0.00',
  });

  const [formErrors, setFormErrors] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [skuSuggestions, setSkuSuggestions] = useState<string[]>([]);
  const [showSkuSuggestions, setShowSkuSuggestions] = useState(false);
  const [currentSkuVerified, setCurrentSkuVerified] = useState(false);
  const [skuFromSuggestion, setSkuFromSuggestion] = useState(false);
  const [originalSkuValue, setOriginalSkuValue] = useState('');

  // Modal states

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [otpData, setOtpData] = useState({
    email: '',
    sku: '',
    originalEmail: '',
    otp: '',
  });
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const skuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('updatePrices', (prices: MetalPrices) => {
      // Only update prices if they are valid (not 0)
      const validPrices = {
        Gold: prices.Gold && prices.Gold > 0 ? prices.Gold : metalPrices.Gold,
        Silver: prices.Silver && prices.Silver > 0 ? prices.Silver : metalPrices.Silver,
        Platinum: prices.Platinum && prices.Platinum > 0 ? prices.Platinum : metalPrices.Platinum,
        Palladium: prices.Palladium && prices.Palladium > 0 ? prices.Palladium : metalPrices.Palladium,
      };
      
      // Only update if we have valid prices
      if (Object.values(validPrices).some(price => price > 0)) {
        setMetalPrices(validPrices);
        updatePrice();
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
  console.log(currentSkuVerified, skuFromSuggestion, originalSkuValue);
      setLoading(true);
      setError('');
      
      console.log('Loading initial data...');
      const data = await apiService.getInitialData();
      console.log('Received data:', data);
      
      // Set metal prices with fallback - ensure we have valid prices
      const initialPrices = {
        Gold: data.metalPrices?.Gold && data.metalPrices.Gold > 0 ? data.metalPrices.Gold : 2000,
        Silver: data.metalPrices?.Silver && data.metalPrices.Silver > 0 ? data.metalPrices.Silver : 25,
        Platinum: data.metalPrices?.Platinum && data.metalPrices.Platinum > 0 ? data.metalPrices.Platinum : 950,
        Palladium: data.metalPrices?.Palladium && data.metalPrices.Palladium > 0 ? data.metalPrices.Palladium : 1000,
      };
      
      setMetalPrices(initialPrices);
      
      // Set chart data with fallback
      setChartData({
        gold: data.goldData || { dates: [], prices: [] },
        silver: data.silverData || { dates: [], prices: [] },
        platinum: data.platinumData || { dates: [], prices: [] },
        palladium: data.palladiumData || { dates: [], prices: [] },
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again later.');
      
      // Set fallback data
      setMetalPrices({
        Gold: 2000,
        Silver: 25,
        Platinum: 950,
        Palladium: 1000,
      });
      
      setChartData({
        gold: { dates: [], prices: [] },
        silver: { dates: [], prices: [] },
        platinum: { dates: [], prices: [] },
        palladium: { dates: [], prices: [] },
      });
      
      setLoading(false);
    }
  };

  const updatePrice = () => {
    const metal = formData.metal;
    const grams = parseFloat(formData.grams) || 0;
    const pricePerGram = metalPrices[metal as keyof MetalPrices] || 0;
    const totalPrice = grams * pricePerGram;
    const priceText = `Price: $${totalPrice.toFixed(2)}`;

    setFormData(prev => ({
      ...prev,
      calculatedPrice: priceText,
    }));
  };

  // Update price when metal prices change
  useEffect(() => {
    updatePrice();
  }, [metalPrices, formData.metal, formData.grams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'metal' || name === 'grams') {
      // Update price immediately when metal or grams change
      setTimeout(() => {
        const grams = name === 'grams' ? parseFloat(value) || 0 : parseFloat(formData.grams) || 0;
        const metal = name === 'metal' ? value : formData.metal;
        const pricePerGram = metalPrices[metal as keyof MetalPrices] || 0;
        const totalPrice = grams * pricePerGram;
        const priceText = `Price: $${totalPrice.toFixed(2)}`;

        setFormData(prev => ({
          ...prev,
          [name]: value,
          calculatedPrice: priceText,
        }));
      }, 0);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'sku') {
      handleSkuInput(value);
    }
  };

  const handleSkuInput = (value: string) => {
    if (skuTimeoutRef.current) {
      clearTimeout(skuTimeoutRef.current);
    }

    if (value.length < 2) {
      setShowSkuSuggestions(false);
      return;
    }

    skuTimeoutRef.current = setTimeout(() => {
      fetchSkuSuggestions(value);
    }, 300);
  };

  const fetchSkuSuggestions = async (searchTerm: string) => {
    try {
      const data: SkuSuggestionsResponse = await apiService.getSkuSuggestions(searchTerm);
      
      if (data.success) {
        setSkuSuggestions(data.suggestions || []);
        setShowSkuSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching SKU suggestions:', error);
      setSkuSuggestions([]);
      setShowSkuSuggestions(false);
    }
  };

  const handleSkuSelect = (sku: string) => {
    setFormData(prev => ({ ...prev, sku }));
    setShowSkuSuggestions(false);
    setSkuFromSuggestion(true);
    fetchSkuData(sku);
  };

  const fetchSkuData = async (sku: string) => {
    try {
      const data: SkuDataResponse = await apiService.getSkuData(sku);

      if (data.success) {
        if (!data.verified && data.requiresVerification) {
          setOtpData(prev => ({
            ...prev,
            email: data.email || '',
            sku,
            originalEmail: data.email || '',
          }));
          setShowOtpModal(true);
        } else if (data.submission) {
          fillFormWithSubmissionData(data.submission);
        } else {
          // No data found - treat as a new SKU entry
          setSkuFromSuggestion(false);
          setCurrentSkuVerified(false);
          setOriginalSkuValue('');
          
          setFormErrors('Using this as a new SKU for your submission.');
          setTimeout(() => setFormErrors(''), 3000);
        }
      } else {
        // Show not found message - treat as new SKU
        setFormErrors('Using this as a new SKU for your submission.');
        setTimeout(() => setFormErrors(''), 3000);
        
        setSkuFromSuggestion(false);
        setCurrentSkuVerified(false);
        setOriginalSkuValue('');
      }
    } catch (error) {
      console.error('Error fetching SKU data:', error);
      setFormErrors('Error searching for SKU. Please try again.');
      setTimeout(() => setFormErrors(''), 3000);
    }
  };

  const fillFormWithSubmissionData = (submission: Submission) => {
    setOriginalSkuValue(submission.sku || '');
    setFormData({
      name: submission.name || '',
      email: submission.email || '',
      sku: submission.sku || '',
      description: submission.description || '',
      metal: submission.metal || 'Gold',
      grams: submission.grams?.toString() || '',
      calculatedPrice: '$0.00',
    });
    setCurrentSkuVerified(true);
    
    if (submission.imagePath) {
      setImagePreview(submission.imagePath);
    }
    
    setFormErrors('Form auto-filled with existing SKU data!');
    setTimeout(() => setFormErrors(''), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormErrors('Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormErrors('Please enter a valid email address');
      return false;
    }
    if (!formData.grams || parseFloat(formData.grams) <= 0) {
      setFormErrors('Please enter a valid weight');
      return false;
    }
    return true;
  };

  const handleSubmit = async (action: string) => {
    if (!validateForm()) return;

    // Ensure price is calculated with current values
    const grams = parseFloat(formData.grams) || 0;
    const pricePerGram = metalPrices[formData.metal as keyof MetalPrices] || 0;
    const totalPrice = grams * pricePerGram;
    const calculatedPrice = `Price: $${totalPrice.toFixed(2)}`;

    // Update form data with calculated price
    const updatedFormData = {
      ...formData,
      calculatedPrice: calculatedPrice
    };

    const formDataToSend = new FormData();
    Object.entries(updatedFormData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    formDataToSend.append('action', action);

    console.log('Submitting form with data:', {
      ...updatedFormData,
      action,
      metalPrices,
      calculatedPrice
    });

    try {
      const data: FormSubmissionResponse = await apiService.submitForm(formDataToSend);

      if (data.success) {
        if (action === 'buy') {
          window.location.href = `/orders/checkout/${data.id}`;
        } else if (action === 'sell') {
          processSellTransaction(data.id || '');
        } else if (action === 'claim-policy') {
          handleClaimPolicy();
        } else {
          setReferenceNumber(data.id || `REF-${Date.now().toString().slice(-6)}`);
          setShowThankYouModal(true);
          resetForm();
        }
      } else {
        setFormErrors(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormErrors('Network error. Please check your connection and try again.');
    }
  };

  const processSellTransaction = async (submissionId: string) => {
    try {
      const data: SellTransactionResponse = await apiService.processSellTransaction(submissionId);

      if (data.success) {
        window.location.href = `/orders/sell-confirmation/${data.orderNumber}`;
      } else {
        setFormErrors(data.message || 'An error occurred processing your sell request.');
      }
    } catch (error) {
      console.error('Error processing sell transaction:', error);
      setFormErrors('Network error. Please check your connection and try again.');
    }
  };

  const handleClaimPolicy = () => {
    const email = formData.email.trim();
    const sku = formData.sku.trim();
    
    if (!sku) {
      setFormErrors('Product ID/SKU is required for claiming a policy');
      return;
    }
    
    // Navigate to claim policy page
    window.location.href = `/claim-policy/${encodeURIComponent(email)}/${encodeURIComponent(sku)}`;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      sku: '',
      description: '',
      metal: 'Gold',
      grams: '',
      calculatedPrice: '$0.00',
    });
    setImagePreview('');
    setCurrentSkuVerified(false);
    setSkuFromSuggestion(false);
    setOriginalSkuValue('');
    setFormErrors('');
  };

  const handleOtpSend = async () => {
    try {
      const data: OtpResponse = await apiService.sendOtp(otpData.originalEmail, otpData.sku);

      if (data.success) {
        setOtpSuccess('Verification code sent successfully to your email.');
        setOtpError('');
      } else {
        setOtpError(data.message || 'Failed to send verification code');
        setOtpSuccess('');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Network error. Please try again.');
      setOtpSuccess('');
    }
  };

  const handleOtpVerify = async () => {
    try {
      const data: OtpResponse & { submission?: Submission } = await apiService.verifyOtp(
        otpData.originalEmail,
        otpData.sku,
        otpData.otp
      );

      if (data.success) {
        setShowOtpModal(false);
        if (data.submission) {
          fillFormWithSubmissionData(data.submission);
        }
      } else {
        setOtpError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Network error. Please try again.');
    }
  };

  const maskEmail = (email: string) => {
    if (!email || email.indexOf('@') === -1) return email;
    const parts = email.split('@');
    let name = parts[0];
    const domain = parts[1];
    
    if (name.length > 3) {
      const visibleChars = Math.min(2, name.length - 1);
      const lastChar = name.slice(-1);
      const firstChars = name.slice(0, visibleChars);
      const maskLength = name.length - visibleChars - 1;
      const mask = '*'.repeat(maskLength);
      name = firstChars + mask + lastChar;
    }
    
    return name + '@' + domain;
  };

  const createChartConfig = (data: ChartData, label: string, color: string) => ({
    labels: data.dates || [],
    datasets: [{
      label,
      data: data.prices || [],
      borderColor: color,
      backgroundColor: color + '80',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: color,
    }],
  });

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

  return (
    <div className="container" style={{ display: loading ? 'none' : 'block' }}>
      <div className="mb-4">
        <img 
          src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg"
          alt="Logo" 
          className="img-fluid"
          style={{ height: '180px', maxWidth: '250px', borderRadius: '10px', mixBlendMode: 'difference' }}
        />
      </div>

      {error && <div id="errorMessage" style={{ color: 'red', fontSize: '1rem', textAlign: 'center', marginTop: '20px' }}>{error}</div>}

      {/* Price Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="price-card">
            <div className="metal-name">Gold</div>
            <div className="price-value">${metalPrices.Gold?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="price-card">
            <div className="metal-name">Silver</div>
            <div className="price-value">${metalPrices.Silver?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="price-card">
            <div className="metal-name">Platinum</div>
            <div className="price-value">${metalPrices.Platinum?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="price-card">
            <div className="metal-name">Palladium</div>
            <div className="price-value">${metalPrices.Palladium?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <h2 className="mb-4">Metal Transaction Request</h2>

        {formErrors && (
          <div className={`alert ${formErrors.includes('auto-filled') ? 'alert-success' : 'alert-danger'}`}>
            {formErrors}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Customer Info */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label">Your Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* SKU and Image */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label htmlFor="sku" className="form-label">Product ID/SKU</label>
              <div className="input-group">
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  className="form-control"
                  placeholder="Enter existing SKU or create a new one..."
                  value={formData.sku}
                  onChange={handleInputChange}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => fetchSkuData(formData.sku)}
                >
                  <i className="bi bi-search"></i> Search
                </button>
                <button 
                  className="btn btn-outline-danger" 
                  type="button"
                  onClick={resetForm}
                >
                  <i className="bi bi-x-lg"></i> Clear
                </button>
              </div>
              {showSkuSuggestions && (
                <div id="skuSuggestions" className="list-group mt-2" style={{ position: 'absolute', zIndex: 1000, width: 'calc(100% - 30px)' }}>
                  {skuSuggestions.map((sku, index) => (
                    <a
                      key={index}
                      href="#"
                      className="list-group-item list-group-item-action"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSkuSelect(sku);
                      }}
                    >
                      {sku}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="image" className="form-label">Upload Image (Optional)</label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-control"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
              />
              <small className="text-muted">Accepted formats: JPEG, PNG, GIF, WEBP (Max size: 5MB)</small>
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview" 
                  style={{ display: 'block' }}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="form-label">Notes/Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows={3}
              placeholder="Any additional details about your request..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Price Calculator */}
          <h4 className="mb-3">Calculate Price</h4>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="metal" className="form-label">Select Metal</label>
              <select
                id="metal"
                name="metal"
                className="form-select"
                value={formData.metal}
                onChange={handleInputChange}
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Palladium">Palladium</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="grams" className="form-label">Enter Weight (grams)</label>
              <input
                type="number"
                id="grams"
                name="grams"
                min="0"
                className="form-control"
                placeholder="Enter grams"
                value={formData.grams}
                onChange={handleInputChange}
                required
              />
              <div className="price">{formData.calculatedPrice}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              type="button"
              className="action-button buy-button"
              onClick={() => handleSubmit('buy')}
            >
              Buy
            </button>
            <button
              type="button"
              className="action-button sell-button"
              onClick={() => handleSubmit('sell')}
            >
              Sell
            </button>
            <button
              type="button"
              className="action-button invest-button"
              onClick={() => handleSubmit('invest')}
            >
              Invest
            </button>
            <button
              type="button"
              className="action-button policy-button"
              onClick={() => handleSubmit('claim-policy')}
            >
              Claim Policy
            </button>
          </div>
        </form>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="chart-container">
            <Line
              data={createChartConfig(chartData.gold, 'Gold Price (USD/oz)', '#FFD700')}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Gold Price (USD/oz) - Last Month' },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => `$${value}` }
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="chart-container">
            <Line
              data={createChartConfig(chartData.silver, 'Silver Price (USD/oz)', '#C0C0C0')}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Silver Price (USD/oz) - Last Month' },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => `$${value}` }
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="chart-container">
            <Line
              data={createChartConfig(chartData.platinum, 'Platinum Price (USD/oz)', '#E5E4E2')}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Platinum Price (USD/oz) - Last Month' },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => `$${value}` }
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="chart-container">
            <Line
              data={createChartConfig(chartData.palladium, 'Palladium Price (USD/oz)', '#8c8c8c')}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Palladium Price (USD/oz) - Last Month' },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => `$${value}` }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Received!</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowThankYouModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  <div className="mt-3">
                    <h4>Thank You For Your Request</h4>
                  </div>
                </div>
                <p>Your request has been submitted successfully!</p>
                <p>Our team will review your details and contact you shortly at the email address you provided.</p>
                <p><strong>Reference Number:</strong> {referenceNumber}</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn btn-success px-4 me-2"
                  onClick={() => setShowThankYouModal(false)}
                >
                  Ok
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => {
                    setShowThankYouModal(false);
                    resetForm();
                  }}
                >
                  Claim a new request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Email Verification Required</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOtpModal(false)}
                />
              </div>
              <div className="modal-body">
                {otpError && <div className="alert alert-danger">{otpError}</div>}
                {otpSuccess && <div className="alert alert-success">{otpSuccess}</div>}

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={maskEmail(otpData.email)}
                    readOnly
                  />
                  <small className="text-muted">Email address associated with this SKU.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Verification Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={otpData.otp}
                    onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                  />
                  <small className="text-muted">Enter the 6-digit code sent to your email.</small>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOtpSend}
                  >
                    Send Verification Code
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleOtpVerify}
                  >
                    Verify Code
                  </button>
                </div>

                <div className="mt-3">
                  <p><small>We need to verify your email before sharing the SKU information.</small></p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop */}
      {(showThankYouModal || showOtpModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}
