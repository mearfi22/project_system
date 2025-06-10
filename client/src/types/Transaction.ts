export interface Transaction {
  id: number;
  user_id: number;
  reference_number: string;
  customer_name: string | null;
  customer_email: string | null;
  subtotal: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  payment_method: string;
  payment_status: "completed" | "pending" | "voided";
  notes: string | null;
  receipt_sent: boolean;
  satisfaction_rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  items: TransactionItem[];
  user: User;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  unit_price: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
}
