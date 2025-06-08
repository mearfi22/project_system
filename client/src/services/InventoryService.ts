import axios from "axios";
import { StockAdjustment } from "../interfaces/Inventory";

const InventoryService = {
  getStockMovements: (productId?: number) => {
    const url = productId
      ? `/api/inventory/movements/${productId}`
      : "/api/inventory/movements";
    return axios.get(url);
  },

  adjustStock: (data: StockAdjustment) => {
    return axios.post("/api/inventory/adjust", data);
  },

  getLowStockProducts: () => {
    return axios.get("/api/products/low-stock");
  },

  getStockHistory: (productId: number) => {
    return axios.get(`/api/inventory/history/${productId}`);
  },
};

export default InventoryService;
