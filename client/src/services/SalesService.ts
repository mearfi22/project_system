import AxiosInstance from "../AxiosInstance";
import { SaleRequest } from "../interfaces/Sales";

const SalesService = {
  createSale: (data: SaleRequest) => {
    return AxiosInstance.post("/api/sales", data);
  },

  getSales: () => {
    return AxiosInstance.get("/api/sales");
  },

  getSale: (id: number) => {
    return AxiosInstance.get(`/api/sales/${id}`);
  },

  getReceipt: (id: number) => {
    return AxiosInstance.get(`/api/sales/${id}/receipt`);
  },

  getDailySales: () => {
    return AxiosInstance.get("/api/sales/daily");
  },
};

export default SalesService;
