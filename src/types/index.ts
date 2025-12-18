export interface ProductVariant {
  id: string;
  label: string;
  sku: string;
  barcode: string;
  price: number;
  stock_qty: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  design_id: string;
  hsn: string;
  tax_percent: number;
  active: boolean;
  variants: ProductVariant[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  pin: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  delivery_address?: string;
  billing_address?: string;
  gst_number?: string;
  tag?: 'Silver' | 'Gold' | 'VIP';
}

export interface OrderItem {
  id: string;
  variant_id: string;
  product_name: string;
  design_id: string;
  variant_label: string;
  price: number;
  qty: number;
  tax_percent: number;
  value: number;
  gst: number;
  total: number;
}

export type PaymentStatus = 'paid' | 'pending' | 'partial';
export type OrderStatus = 'created' | 'confirmed' | 'cancelled' | 'printed' | 'dispatched';
export type OrderType = 'POS' | 'Online';

export interface Order {
  id: string;
  order_no: string;
  customer_id: string;
  customer_name: string;
  group?: string;
  marketer?: string;
  transporter?: string;
  delivery_address?: string;
  item_value: number;
  gst_value: number;
  grand_total: number;
  advance_amount: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  type?: OrderType;
  created_at: string;
  updated_at: string;
  created_by: string;
  items: OrderItem[];
  note?: string;
}

export interface GridCell {
  customer_id: string;
  variant_id: string;
  qty: number;
}

export interface SessionData {
  customers: string[];
  products: string[];
  cells: GridCell[];
  orderDetails: Record<string, { group_name: string; marketer_name: string; transporter_name: string; delivery_address: string }>;
  customItems: Record<string, Array<{ id: string; name: string; quantity: number; unitPrice: number; price: number }>>;
  discounts: Record<string, number>;
  advanceAmounts: Record<string, number>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  status: 'active' | 'inactive' | 'deleted';
  permissions?: {
    products?: boolean;         // View product, add product, update inventory
    customers?: boolean;        // View customer, add customer
    onlineOrders?: boolean;     // See only online orders
    posOrders?: boolean;        // See only POS orders
    paymentManagement?: boolean;
    imageViewRequests?: boolean;
    appAccess?: boolean;
    hr?: boolean;               // Can add team
    admin?: boolean;            // Full access
  };
}

export type ImageRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ImageViewRequest {
  id: string;
  request_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  requests_today: number;
  request_date: string;
  last_request_date: string;
  status: ImageRequestStatus;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
}

export type AppAccountStatus = 'pending' | 'accepted' | 'rejected';

export interface AppAccountRequest {
  id: string;
  request_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  gst_number?: string;
  request_date: string;
  request_time: string;
  status: AppAccountStatus;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
}
