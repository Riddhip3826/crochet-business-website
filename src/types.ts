export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  size?: string;
  colors: string[];
  isBestSeller: boolean;
  isFeatured: boolean;
  details?: string[];
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  avatarUrl?: string;
  verified_email?: boolean;
  verified_phone?: boolean;
  auth_provider?: string;
  created_at?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentMethod: string;
  paymentId?: string;
  shippingStatus: 'ordered' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  address: string;
  phone: string;
  notes?: string;
  createdAt: string;
  estimatedDeliveryDate: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CustomOrder {
  id: string;
  userId: string;
  name: string;
  email: string;
  itemType: string;
  description: string;
  quantity: number;
  dimensions?: string;
  colors: string;
  referenceImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priceEstimate?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface PaymentSimulation {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: 'success' | 'failed';
  gatewayId: string;
  createdAt: string;
}
