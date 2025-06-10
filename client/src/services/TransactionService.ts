import AxiosInstance from "../utils/AxiosInstance";
import { Transaction } from "../types/Transaction";

const TransactionService = {
  getTransactions: () => {
    return AxiosInstance.get<Transaction[]>("/api/transactions");
  },

  getTransaction: (id: number) => {
    return AxiosInstance.get<Transaction>(`/api/transactions/${id}`);
  },

  createTransaction: (data: any) => {
    return AxiosInstance.post("/api/transactions", data);
  },

  submitFeedback: (
    id: number,
    data: { satisfaction_rating: number; feedback: string }
  ) => {
    return AxiosInstance.post(`/api/transactions/${id}/feedback`, data);
  },

  voidTransaction: (id: number) => {
    return AxiosInstance.post(`/api/transactions/${id}/void`);
  },

  getReceipt: (id: number) => {
    return AxiosInstance.get(`/api/transactions/${id}/receipt`);
  },
};

export default TransactionService;
