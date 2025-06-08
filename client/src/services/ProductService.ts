import axios from "axios";
import { Products } from "../interfaces/Products";

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

const ProductService = {
  loadProducts: () => {
    return axios.get("/api/products");
  },

  getProduct: (id: number) => {
    return axios.get(`/api/products/${id}`);
  },

  createProduct: (data: Partial<Products>) => {
    return axios.post("/api/products", data);
  },

  updateProduct: (id: number, data: Partial<Products>) => {
    return axios.put(`/api/products/${id}`, data);
  },

  deleteProduct: (id: number) => {
    return axios.delete(`/api/products/${id}`);
  },

  updateStock: (productId: number, quantity: number) => {
    return axios.post(`/api/products/${productId}/stock`, { quantity });
  },
};

export default ProductService;
