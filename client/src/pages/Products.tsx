import React, { useEffect, useState } from "react";
import { Products as ProductInterface } from "../interfaces/Products";
import ProductService from "../services/ProductService";
import ErrorHandler from "../handler/ErrorHandler";
import AddProductModal from "../components/modals/product/AddProductModal";
import EditProductModal from "../components/modals/product/EditProductModal";
import { toast } from "react-toastify";
import Swal, { SweetAlertResult } from "sweetalert2";

const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductInterface | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    ProductService.loadProducts()
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleProductAdded = (message: string) => {
    setShowAddModal(false);
    loadProducts();
    toast.success(message);
  };

  const handleProductUpdated = (message: string) => {
    setShowEditModal(false);
    setSelectedProduct(null);
    loadProducts();
    toast.success(message);
  };

  const handleEdit = (product: ProductInterface) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product: ProductInterface) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        ProductService.deleteProduct(product.id)
          .then(() => {
            loadProducts();
            toast.success("Product deleted successfully");
          })
          .catch((error) => {
            ErrorHandler(error, null);
          });
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>
                    $
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : Number(product.price).toFixed(2)}
                  </td>
                  <td>
                    {product.stock_quantity}
                    {product.stock_quantity <= product.alert_threshold && (
                      <span className="badge bg-warning ms-2">Low Stock</span>
                    )}
                  </td>
                  <td>{product.category || "-"}</td>
                  <td>
                    {product.active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddProductModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      {selectedProduct && (
        <EditProductModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
};

export default Products;
