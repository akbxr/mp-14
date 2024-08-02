export interface Event {
  id: number;
  name: string;
  date: string;
  capacity: number;
  attendees: { id: number }[];
  transactions: { finalAmount: number }[];
}

export interface Registration {
  registrationId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  attendeeId: number;
  attendeeName: string;
  attendeeEmail: string;
  registrationDate: string;
}

export interface Transaction {
  transactionId: number;
  eventId: number;
  eventName: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  discountApplied: number;
  finalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  usedReferralCode: string | null;
  transactionDate: string;
  tickets: Array<{
    type: string;
    price: number;
    quantity: number;
  }>;
}

export interface DiscountCoupon {
  id: number;
  code: string;
  discount: number;
  expiresAt: string;
  isUsed: boolean;
}

export interface User {
  name: string;
  email: string;
  role: string;
  referralCode: string;
  points: number;
  discountCoupons: DiscountCoupon[];
}

export interface ChartData {
  revenue: number;
  attendees: number;
}