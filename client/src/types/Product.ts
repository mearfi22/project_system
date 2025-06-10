export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  alert_threshold: number;
  barcode: string | null;
  category: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
