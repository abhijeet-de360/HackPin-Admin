import { OrderItem } from '@/types';

export function calculateLineItem(price: number, qty: number, taxPercent: number): {
  value: number;
  gst: number;
  total: number;
} {
  const value = price * qty;
  const gst = (value * taxPercent) / 100;
  const total = value + gst;
  
  return {
    value: Math.round(value * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function calculateOrderTotals(items: OrderItem[]): {
  item_value: number;
  gst_value: number;
  grand_total: number;
} {
  const item_value = items.reduce((sum, item) => sum + item.value, 0);
  const gst_value = items.reduce((sum, item) => sum + item.gst, 0);
  const grand_total = items.reduce((sum, item) => sum + item.total, 0);
  
  return {
    item_value: Math.round(item_value * 100) / 100,
    gst_value: Math.round(gst_value * 100) / 100,
    grand_total: Math.round(grand_total * 100) / 100,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}
