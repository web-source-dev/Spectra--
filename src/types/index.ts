export interface MetalPrices {
  Gold: number;
  Silver: number;
  Platinum: number;
  Palladium: number;
}

export interface ChartData {
  dates: string[];
  prices: number[];
}

export interface Submission {
  name: string;
  email: string;
  sku: string;
  description: string;
  metal: string;
  grams: number;
  imagePath?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SkuDataResponse {
  success: boolean;
  verified?: boolean;
  requiresVerification?: boolean;
  email?: string;
  submission?: Submission;
  message?: string;
}

export interface SkuSuggestionsResponse {
  success: boolean;
  suggestions: string[];
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  id?: string;
}

export interface SellTransactionResponse {
  success: boolean;
  message: string;
  orderNumber?: string;
  receiptUrl?: string;
}

export interface Order {
  _id: string;
  submissionId: string;
  customerId?: string;
  orderNumber: string;
  name: string;
  email: string;
  phone?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  metal: string;
  grams: number;
  calculatedPrice: string;
  priceNumeric: number;
  action: 'buy' | 'sell' | 'invest';
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  customerId: string;
  email: string;
  sku: string;
  plan: 'monthly' | 'yearly';
  stripeSubscriptionId: string;
  status: 'incomplete' | 'incomplete_expired' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd: string;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    name: string;
    metal: string;
    grams: number;
    calculatedPrice: string;
    imagePath?: string;
  };
}

export interface FormData {
  name: string;
  email: string;
  sku: string;
  description: string;
  metal: string;
  grams: string;
  calculatedPrice: string;
}

export interface OtpData {
  email: string;
  sku: string;
  originalEmail: string;
  otp: string;
}

// Admin Login Types
export interface AdminLoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  redirect?: string;
  error?: string;
}

export interface AdminTokenVerification {
  valid: boolean;
}

export interface AdminSessionCheck {
  valid: boolean;
}

// Admin Dashboard Types
export interface AdminDashboardData {
  submissions: AdminSubmission[];
  orders: AdminOrder[];
  subscriptions: AdminSubscription[];
  ordersMap: Record<string, AdminOrder>;
}

export interface AdminSubmission {
  _id: string;
  id: number;
  name: string;
  email: string;
  sku?: string;
  description?: string;
  metal: string;
  grams: number;
  calculatedPrice: string;
  action: string;
  imagePath?: string;
  timestamp: string;
}

export interface AdminOrder {
  _id: string;
  submissionId: string;
  customerId?: string;
  orderNumber: string;
  name: string;
  email: string;
  phone?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  metal: string;
  grams: number;
  calculatedPrice: string;
  priceNumeric: number;
  action: 'buy' | 'sell' | 'invest';
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscription {
  _id: string;
  customerId: string;
  email: string;
  sku: string;
  plan: 'monthly' | 'yearly';
  stripeSubscriptionId: string;
  status: 'incomplete' | 'incomplete_expired' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd: string;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    name: string;
    metal: string;
    grams: number;
    calculatedPrice: string;
    imagePath?: string;
  };
}

// Checkout Types
export interface CheckoutSubmission {
  id: number;
  name: string;
  email: string;
  metal: string;
  grams: number;
  calculatedPrice: string;
  description?: string;
  imagePath?: string;
}

export interface CheckoutFormData {
  submissionId: number;
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  submission?: CheckoutSubmission;
  already_paid?: boolean;
  message?: string;
  order?: Order;
  redirectUrl?: string;
  orderNumber?: string;
}

// Claim Policy Types
export interface ClaimPolicyData {
  email: string;
  sku: string;
  submission: ClaimPolicySubmission;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePublicKey: string;
  existingSubscription?: ExistingSubscription;
}

export interface ClaimPolicySubmission {
  name: string;
  email: string;
  sku: string;
  description?: string;
  metal: string;
  grams: number;
  calculatedPrice: string;
  imagePath?: string;
}

export interface ExistingSubscription {
  _id: string;
  customerId: string;
  email: string;
  sku: string;
  plan: 'monthly' | 'yearly';
  stripeSubscriptionId: string;
  status: 'incomplete' | 'incomplete_expired' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd: string;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  email: string;
  sku: string;
  plan: 'monthly' | 'yearly';
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}

export interface RetrieveSubscriptionPaymentRequest {
  subscriptionId: string;
}

export interface RetrieveSubscriptionPaymentResponse {
  clientSecret: string;
}

// My Subscriptions Types
export interface MySubscriptionsData {
  subscriptions: Subscription[];
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
}

// Error Types
export interface ErrorData {
  message: string;
  error?: {
    status?: number;
    stack?: string;
  };
}

// Payment Status Types
export interface PaymentAlreadyPaidData {
  success: boolean;
  order: Order;
}

export interface PaymentCancelData {
  success: boolean;
  orderNumber?: string;
}

export interface PaymentSuccessData {
  success: boolean;
  order: Order;
}

// API Response Types for Payment Pages
export interface PaymentAlreadyPaidResponse {
  success: boolean;
  order: Order;
}

export interface PaymentCancelResponse {
  success: boolean;
  orderNumber?: string;
}

export interface PaymentSuccessResponse {
  success: boolean;
  order: Order;
}

// Payment Page Types
export interface PaymentPageData {
  order: Order;
  stripePublicKey: string;
}

export interface PaymentPageResponse {
  success: boolean;
  order: Order;
  stripePublicKey: string;
  already_paid?: boolean;
  message?: string;
}

// Sell Confirmation Types
export interface SellConfirmationData {
  order: Order;
}

export interface SellConfirmationResponse {
  success: boolean;
  order: Order;
}

// Subscription Success Types
export interface SubscriptionSuccessData {
  subscription: Subscription;
}

export interface SubscriptionSuccessResponse {
  success: boolean;
  subscription: Subscription;
}

// Payment Processing Types
export interface PaymentProcessingRequest {
  payment_method_id?: string;
  payment_intent_id?: string;
  order_id?: string;
  order_number?: string;
}

export interface PaymentProcessingResponse {
  success: boolean;
  already_paid?: boolean;
  requires_action?: boolean;
  payment_intent_client_secret?: string;
  error?: {
    message: string;
  };
} 