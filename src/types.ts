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
  status: 'RECEIVED' | 'PICKED_UP' | 'DELIVERING' | 'PENDING_SETTLEMENT' | 'SETTLED';
  recipient?: Recipient;
  boxCount: string | number;
  fee?: number;
  settlement: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED';
  businessName?: string;
  notes?: string;
  wholesaler?: string;
}

export interface Contact {
  id: string;
  businessName: string;
  phones: string[]; // Changed from single phone to array of phones
  address: string;
  note?: string;
}

export interface ContactFormData {
  businessName: string;
  phones: string[]; // Changed from single phone to array of phones
  address: string;
  note: string;
}

export type BottomTabType = 'delivery' | 'stats' | 'contact';

export interface FormData {
  businessName: string;
  phone: string;
  address: string;
  fee: string;
  settlementMethod: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED';
  notes: string;
  wholesaler?: string;
  boxCount?: string;
}
