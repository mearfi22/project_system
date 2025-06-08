import axios from "axios";
import { SaleRequest } from "../interfaces/Sales";

const SalesService = {
  createSale: (data: SaleRequest) => {
    return axios.post("/api/sales", data);
  },

  getSales: () => {
    return axios.get("/api/sales");
  },

  getSale: (id: number) => {
    return axios.get(`/api/sales/${id}`);
  },

  getReceipt: (id: number) => {
    return axios.get(`/api/sales/${id}/receipt`);
  },

  getDailySales: () => {
    return axios.get("/api/sales/daily");
  },
};

export default SalesService;
