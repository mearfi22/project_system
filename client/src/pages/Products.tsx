import React, { useEffect, useState } from "react";
import { Product } from "../interfaces/Products";
import ProductService from "../services/ProductService";
import ErrorHandler from "../handler/ErrorHandler";
import { toast } from "react-toastify";
import AddProductModal from "../components/modals/product/AddProductModal";
import EditProductModal from "../components/modals/product/EditProductModal";
import DeleteConfirmationModal from "../components/modals/common/DeleteConfirmationModal";
import { useAuth } from "../contexts/AuthContext";
import "./Products.css";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const { hasPermission, user } = useAuth();

  useEffect(() => {
    console.log("Current user:", user);
    console.log(
      "Has update_product permission:",
      hasPermission("update_product")
    );
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

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    ProductService.deleteProduct(selectedProduct.id)
      .then(() => {
        toast.success("Product deleted successfully");
        loadProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      })
      .catch((error) => {
        ErrorHandler(error, null);
      });
  };

  const handleProductAdded = (message: string) => {
    toast.success(message);
    setShowAddModal(false);
    loadProducts();
  };

  const handleProductUpdated = (product: Product, message: string) => {
    toast.success(message);
    setShowEditModal(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const getStatusBadge = (product: Product) => {
    if (!product.active) {
      return <span className="badge bg-danger">Inactive</span>;
    }
    if (product.stock_quantity <= product.alert_threshold) {
      return <span className="badge bg-warning">Low Stock</span>;
    }
    return <span className="badge bg-success">Active</span>;
  };

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
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
    <div className="container-fluid products-container px-4">
      {/* Header Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Products</h5>
              <p className="text-muted mb-0 small">
                Manage your product catalog
              </p>
            </div>
            {hasPermission("create_product") && (
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleAddProduct}
              >
                <i className="bi bi-plus-circle"></i>
                Add Product
              </button>
            )}
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
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-center" style={{ width: "30%" }}>
                    Product Info
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Category
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Price
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Stock
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    Status
                  </th>
                  <th className="text-center" style={{ width: "15%" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="no-data">
                        {searchTerm || categoryFilter ? (
                          <>
                            <i className="bi bi-search display-6 d-block mb-2"></i>
                            <p className="mb-0">
                              No products found with the current filters
                            </p>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box display-6 d-block mb-2"></i>
                            <p className="mb-0">No products available</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center">
                          <span className="fw-medium">{product.name}</span>
                          <small className="text-muted d-block">
                            {product.description || "No description"}
                          </small>
                          {product.barcode && (
                            <small className="text-muted d-block">
                              Barcode: {product.barcode}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="text-center">
                        ₱{Number(product.price).toFixed(2)}
                      </td>
                      <td className="text-center">{product.stock_quantity}</td>
                      <td className="text-center">{getStatusBadge(product)}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ minWidth: "70px" }}
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          {hasPermission("delete_product") && (
                            <button
                              className="btn btn-sm btn-danger"
                              style={{ minWidth: "70px" }}
                              onClick={() => handleDeleteClick(product)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setSelectedProduct(null);
        }}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={
          selectedProduct?.name
            ? `Are you sure you want to delete ${selectedProduct.name}?`
            : ""
        }
      />
    </div>
  );
};

export default Products;
