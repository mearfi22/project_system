import AxiosInstance from "../AxiosInstance";
import { StockAdjustment } from "../interfaces/Inventory";

const InventoryService = {
  getStockMovements: (productId?: number) => {
    const url = productId
      ? `/api/inventory/movements/${productId}`
      : "/api/inventory/movements";
    return AxiosInstance.get(url);
  },

  adjustStock: (data: StockAdjustment) => {
    return AxiosInstance.post("/api/inventory/adjust", data);
  },

  getLowStockProducts: () => {
    return AxiosInstance.get("/api/products/low-stock");
  },

  getStockHistory: (productId: number) => {
    return AxiosInstance.get(`/api/inventory/history/${productId}`);
  },
};

export default InventoryService;
