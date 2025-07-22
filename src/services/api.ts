import {
  MetalPrices,
  ChartData,
  Submission,
  SkuDataResponse,
  SkuSuggestionsResponse,
  OtpResponse,
  FormSubmissionResponse,
  SellTransactionResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminTokenVerification,
  AdminSessionCheck,
  AdminDashboardData,
  AdminSubmission,
  AdminOrder,
  AdminSubscription,
  AdminClaim,
  CheckoutFormData,
  CheckoutResponse,
  ClaimPolicyData,
  CreateSubscriptionResponse,
  RetrieveSubscriptionPaymentResponse,
  MySubscriptionsData,
  CancelSubscriptionResponse,
  PaymentAlreadyPaidResponse,
  PaymentCancelResponse,
  PaymentSuccessResponse,
  PaymentPageResponse,
  PaymentProcessingRequest,
  PaymentProcessingResponse,
  SellConfirmationResponse,
  SubscriptionSuccessResponse,
  Order,
  CreateClaimRequest,
  CreateClaimResponse,
  GetClaimsResponse
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spectra-backend-oib7.onrender.com';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, finalOptions);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Response data:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get initial data (metal prices and chart data)
  async getInitialData(): Promise<{
    metalPrices: MetalPrices;
    goldData: ChartData;
    silverData: ChartData;
    platinumData: ChartData;
    palladiumData: ChartData;
  }> {
    const data = await this.request<{
      metalPrices: MetalPrices;
      goldData: ChartData;
      silverData: ChartData;
      platinumData: ChartData;
      palladiumData: ChartData;
    }>('/data');
    
    return {
      metalPrices: data.metalPrices || { Gold: 0, Silver: 0, Platinum: 0, Palladium: 0 },
      goldData: data.goldData || { dates: [], prices: [] },
      silverData: data.silverData || { dates: [], prices: [] },
      platinumData: data.platinumData || { dates: [], prices: [] },
      palladiumData: data.palladiumData || { dates: [], prices: [] },
    };
  }

  // Get metal prices only
  async getMetalPrices(): Promise<MetalPrices> {
    return this.request('/data');
  }

  // Get SKU suggestions
  async getSkuSuggestions(searchTerm: string): Promise<SkuSuggestionsResponse> {
    return this.request(`/api/sku-suggestions?term=${encodeURIComponent(searchTerm)}`);
  }

  // Get SKU data
  async getSkuData(sku: string): Promise<SkuDataResponse> {
    return this.request(`/api/sku-data?sku=${encodeURIComponent(sku)}`);
  }

  // Send OTP
  async sendOtp(email: string, sku: string): Promise<OtpResponse> {
    return this.request('/api/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, sku }),
    });
  }

  // Verify OTP
  async verifyOtp(email: string, sku: string, otp: string): Promise<OtpResponse & { submission?: Submission }> {
    return this.request('/api/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, sku, otp }),
    });
  }

  // Submit form
  async submitForm(formData: FormData): Promise<FormSubmissionResponse> {
    const url = `${this.baseUrl}/submit-form`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error;
    }
  }

  // Process sell transaction
  async processSellTransaction(submissionId: string): Promise<SellTransactionResponse> {
    return this.request('/orders/sell-confirmation', {
      method: 'POST',
      body: JSON.stringify({ submissionId }),
    });
  }

  // Create subscription
  async createSubscription(email: string, sku: string, plan: string): Promise<CreateSubscriptionResponse> {
    return this.request('/create-subscription', {
      method: 'POST',
      body: JSON.stringify({ email, sku, plan }),
    });
  }

  // Retrieve subscription payment
  async retrieveSubscriptionPayment(subscriptionId: string): Promise<RetrieveSubscriptionPaymentResponse> {
    return this.request('/retrieve-subscription-payment', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId }),
    });
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<CancelSubscriptionResponse> {
    return this.request(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  // Get order details
  async getOrderDetails(orderNumber: string): Promise<{
    success: boolean;
    order: Order;
  }> {
    return this.request(`/orders/${orderNumber}`);
  }

  // Check payment status
  async checkPaymentStatus(orderNumber: string): Promise<{
    success: boolean;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    hasInvoice: boolean;
    hasReceipt: boolean;
    createdAt: string;
    updatedAt: string;
  }> {
    return this.request(`/orders/status/${orderNumber}`);
  }

  // Admin Login
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Verify admin token
  async verifyAdminToken(token: string): Promise<AdminTokenVerification> {
    return this.request('/admin/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Check admin session
  async checkAdminSession(token: string): Promise<AdminSessionCheck> {
    return this.request('/admin/check-session', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Get admin dashboard data
  async getAdminDashboardData(token: string): Promise<AdminDashboardData> {
    const response = await this.request<{ success: boolean; submissions: AdminSubmission[]; orders: AdminOrder[]; subscriptions: AdminSubscription[]; claims: AdminClaim[]; ordersMap: Record<string, AdminOrder> }>('/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Admin dashboard response:', {
      submissions: response.submissions?.length || 0,
      orders: response.orders?.length || 0,
      subscriptions: response.subscriptions?.length || 0,
      claims: response.claims?.length || 0
    });
    
    // Return the data without the success wrapper
    return {
      submissions: response.submissions || [],
      orders: response.orders || [],
      subscriptions: response.subscriptions || [],
      claims: response.claims || [],
      ordersMap: response.ordersMap || {}
    };
  }

  // Get checkout submission
  async getCheckoutSubmission(submissionId: number): Promise<CheckoutResponse> {
    return this.request(`/orders/checkout/${submissionId}`);
  }

  // Process checkout
  async processCheckout(formData: CheckoutFormData): Promise<CheckoutResponse> {
    return this.request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // Get claim policy data
  async getClaimPolicyData(email: string, sku: string): Promise<ClaimPolicyData> {
    return this.request(`/claim-policy/${encodeURIComponent(email)}/${encodeURIComponent(sku)}`);
  }

  // Get my subscriptions
  async getMySubscriptions(email?: string): Promise<MySubscriptionsData> {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.request(`/my-subscriptions${params}`);
  }

  // Payment status pages
  async getPaymentAlreadyPaid(orderNumber: string): Promise<PaymentAlreadyPaidResponse> {
    return this.request(`/orders/payment-already-paid/${orderNumber}`);
  }

  async getPaymentCancel(orderNumber?: string): Promise<PaymentCancelResponse> {
    const params = orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : '';
    return this.request(`/orders/payment/cancel${params}`);
  }

  async getPaymentSuccess(orderNumber: string): Promise<PaymentSuccessResponse> {
    return this.request(`/orders/payment-success/${orderNumber}`);
  }

  // Payment page data
  async getPaymentPageData(orderNumber: string): Promise<PaymentPageResponse> {
    return this.request(`/orders/payment/${orderNumber}`);
  }

  // Process payment
  async processPayment(paymentData: PaymentProcessingRequest): Promise<PaymentProcessingResponse> {
    return this.request('/orders/process-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Sell confirmation
  async getSellConfirmation(orderNumber: string): Promise<SellConfirmationResponse> {
    return this.request(`/orders/sell-confirmation/${orderNumber}`);
  }

  // Subscription success
  async getSubscriptionSuccess(subscriptionId: string): Promise<SubscriptionSuccessResponse> {
    return this.request(`/subscription-success?subscription=${subscriptionId}`);
  }

  // Create claim
  async createClaim(claimData: CreateClaimRequest): Promise<CreateClaimResponse> {
    const formData = new FormData();
    formData.append('subscriptionId', claimData.subscriptionId);
    formData.append('productDescription', claimData.productDescription);
    formData.append('claimType', claimData.claimType);
    if (claimData.notes) {
      formData.append('notes', claimData.notes);
    }
    
    // Append images
    claimData.images.forEach((image) => {
      formData.append(`images`, image);
    });

    const url = `${this.baseUrl}/claims/create`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Claim creation failed:', error);
      throw error;
    }
  }

  // Get claims for a user
  async getClaims(email?: string): Promise<GetClaimsResponse> {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    console.log('Fetching claims for email:', email);
    const response = await this.request<GetClaimsResponse>(`/claims${params}`);
    console.log('Claims response:', response);
    return response;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export default ApiService; 