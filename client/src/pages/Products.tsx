import React, { useEffect, useState } from "react";
import { Product } from "../interfaces/Products";
import ProductService from "../services/ProductService";
import ErrorHandler from "../handler/ErrorHandler";
import AddProductModal from "../components/modals/product/AddProductModal";
import EditProductModal from "../components/modals/product/EditProductModal";
import { toast } from "react-toastify";
import Swal, { SweetAlertResult } from "sweetalert2";
import AxiosInstance from "../utils/AxiosInstance";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    loadProducts();
  }, [showDeleted]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(
        showDeleted ? "/api/products/deleted" : "/api/products"
      );
      setProducts(response.data.products || response.data);
    } catch (error) {
      ErrorHandler(error, null);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (message: string) => {
    setShowAddModal(false);
    loadProducts();
    toast.success(message);
  };

  const handleProductUpdated = (updatedProduct: Product, message: string) => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id
          ? { ...updatedProduct, active: updatedProduct.stock_quantity > 0 }
          : product
      )
    );
    toast.success(message);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product: Product) => {
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
          .then((res) => {
            loadProducts();
            toast.success(res.data.message);
          })
          .catch((error) => {
            ErrorHandler(error, null);
          });
      }
    });
  };

  const getStatusBadge = (product: Product) => {
    if (showDeleted) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    const isActive = product.stock_quantity > 0;
    return (
      <span
        className={`badge rounded-pill ${
          isActive ? "bg-success" : "bg-danger"
        }`}
      >
        {isActive ? "Active" : "Out of Stock"}
      </span>
    );
  };

  // Get unique categories from products
  const categories = Array.from(
    new Set(products.map((product) => product.category || "Uncategorized"))
  );

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return Number(a.price) - Number(b.price);
        case "stock":
          return a.stock_quantity - b.stock_quantity;
        default:
          return 0;
      }
    });

  return (
    <div className="container-fluid px-4">
      {/* Header Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Products Management</h5>
              <p className="text-muted mb-0 small">
                Manage your product catalog
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className={`btn ${
                  showDeleted ? "btn-outline-secondary" : "btn-outline-info"
                } d-flex align-items-center gap-2`}
                onClick={() => setShowDeleted(!showDeleted)}
              >
                <i
                  className={`bi ${showDeleted ? "bi-eye" : "bi-archive"}`}
                ></i>
                {showDeleted ? "Show Active Products" : "Show Archived"}
              </button>
              {!showDeleted && (
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="bi bi-plus-circle"></i>
                  Add Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by name, description, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-nowrap">Product Info</th>
                    <th className="text-nowrap">Category</th>
                    <th className="text-nowrap">Price</th>
                    <th className="text-nowrap">Stock</th>
                    <th className="text-nowrap">Status</th>
                    {!showDeleted && <th className="text-nowrap">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={showDeleted ? 5 : 6}
                        className="text-center py-4 text-muted"
                      >
                        {searchTerm || categoryFilter ? (
                          <>
                            <i className="bi bi-search display-6 d-block mb-2"></i>
                            No products found matching your filters
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box display-6 d-block mb-2"></i>
                            No products available
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-medium">{product.name}</span>
                            <small className="text-muted">
                              {product.description || "No description"}
                            </small>
                            {product.barcode && (
                              <small className="text-muted">
                                Barcode: {product.barcode}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>
                        <td>₱{Number(product.price).toFixed(2)}</td>
                        <td>{product.stock_quantity}</td>
                        <td>{getStatusBadge(product)}</td>
                        {!showDeleted && (
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(product)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddProductModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        show={showEditModal}
        product={selectedProduct}
        onHide={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default Products;
