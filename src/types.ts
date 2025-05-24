// Define types for the delivery data
export interface Address {
  full: string;
}

export interface Recipient {
  address?: Address;
  phone?: string;
}

export interface Delivery {
  id: string;
  status: 'PICKED_UP' | 'DELIVERED' | 'SETTLED';
  recipient?: Recipient;
  boxCount: number;
  fee?: number;
  settlement: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED';
}

export type TopTabType = 'pickup' | 'delivered' | 'settled';
export type BottomTabType = 'delivery' | 'stats' | 'address';

export interface FormData {
  businessName: string;
  phone: string;
  address: string;
  fee: string;
  settlementMethod: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED';
  notes: string;
}