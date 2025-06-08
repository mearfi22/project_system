import { Products } from "./Products";

export interface StockMovement {
  id: number;
  product_id: number;
  quantity: number;
  type: "in" | "out";
  reference: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Products;
}

export interface StockAdjustment {
  product_id: number;
  quantity: number;
  type: "in" | "out";
  reference: string;
  notes?: string;
}
