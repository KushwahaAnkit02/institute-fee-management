export type PaymentMethod = "cash" | "online" | "cheque" | "card";

export type PaymentStatus = "paid" | "pending" | "overdue";

export interface Payment {
  id: string;
  student_id: string;
  admin_id: string;
  month: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  notes: string | null;
  payment_date: string;
  created_at: string;
}

export interface RecordPaymentForm {
  student_id: string;
  month: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  notes?: string;
  payment_date: string;
}

export interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  revenueChartData: Array<{ month: string; revenue: number }>;
  paymentStatusData: Array<{ name: string; value: number }>;
}
