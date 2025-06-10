import AxiosInstance from "../AxiosInstance";
import { Product } from "../interfaces/Products";

const ProductService = {
  loadProducts: () => {
    return AxiosInstance.get("/api/products");
  },

  getProduct: (id: number) => {
    return AxiosInstance.get(`/api/products/${Number(id)}`);
  },

  createProduct: (data: Partial<Product>) => {
    return AxiosInstance.post("/api/products", data);
  },

  updateProduct: (id: number, data: Partial<Product>) => {
    return AxiosInstance.put(`/api/products/${Number(id)}`, data);
  },

  deleteProduct: (id: number) => {
    return AxiosInstance.delete(`/api/products/${Number(id)}`);
  },

  updateStock: (productId: number, quantity: number) => {
    return AxiosInstance.post(`/api/products/${Number(productId)}/stock`, {
      quantity,
    });
  },
};

export default ProductService;
