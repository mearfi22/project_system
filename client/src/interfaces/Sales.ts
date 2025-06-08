import { Products } from "./Products";

export interface CartItem {
  id: number;
  product: Products;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Payment {
  amount: number;
  method: "cash" | "card";
  received?: number;
  change?: number;
}

export interface Sale {
  id: number;
  reference: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment: Payment;
  created_at: string;
  updated_at: string;
  cashier_id: number;
}

export interface SaleRequest {
  items: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  payment: Payment;
}
