import React, { useEffect, useState } from "react";
import { Product } from "../../interfaces/Products";
import { StockMovement } from "../../interfaces/Inventory";
import ProductService from "../../services/ProductService";
import InventoryService from "../../services/InventoryService";
import ErrorHandler from "../../handler/ErrorHandler";
import { toast } from "react-toastify";
import StockAdjustmentModal from "../../components/modals/inventory/StockAdjustmentModal";
import { format } from "date-fns";
import "./Inventory.css";

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [movementSearchTerm, setMovementSearchTerm] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      ProductService.loadProducts(),
      InventoryService.getStockMovements(),
    ])
      .then(([productsRes, movementsRes]) => {
        setProducts(productsRes.data.products);
        setMovements(movementsRes.data.movements);
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleStockAdjusted = (message: string) => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    loadData();
    toast.success(message);
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  const handleCheckLowStock = () => {
    InventoryService.getLowStockProducts()
      .then((res) => {
        const lowStockCount = res.data.products.length;
        toast.warning(
          `${lowStockCount} product${
            lowStockCount === 1 ? " is" : "s are"
          } low on stock!`
        );
      })
      .catch((error) => {
        ErrorHandler(error, null);
      });
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter movements based on search term, type, and date
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      !movementSearchTerm ||
      movement.product?.name
        .toLowerCase()
        .includes(movementSearchTerm.toLowerCase()) ||
      movement.reference
        .toLowerCase()
        .includes(movementSearchTerm.toLowerCase());

    const matchesType =
      !movementTypeFilter || movement.type === movementTypeFilter;

    const matchesDate =
      !dateFilter ||
      format(new Date(movement.created_at), "yyyy-MM-dd") === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="container-fluid px-4">
      {/* Header Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Inventory Management</h5>
              <p className="text-muted mb-0 small">
                Track and manage your product stock levels
              </p>
            </div>
            <button
              type="button"
              className="btn btn-warning d-flex align-items-center gap-2"
              style={{ minWidth: "140px" }}
              onClick={handleCheckLowStock}
            >
              <i className="bi bi-exclamation-triangle"></i>
              Check Low Stock
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Stock Movements Section */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0">Stock Movements</h6>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search movements..."
                        value={movementSearchTerm}
                        onChange={(e) => setMovementSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={movementTypeFilter}
                      onChange={(e) => setMovementTypeFilter(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="text-center" style={{ width: "20%" }}>
                          Date & Time
                        </th>
                        <th className="text-center" style={{ width: "20%" }}>
                          Product
                        </th>
                        <th className="text-center" style={{ width: "15%" }}>
                          Type
                        </th>
                        <th className="text-center" style={{ width: "15%" }}>
                          Quantity
                        </th>
                        <th className="text-center" style={{ width: "15%" }}>
                          Reference
                        </th>
                        <th className="text-center" style={{ width: "15%" }}>
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovements.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-4 text-muted"
                          >
                            {movementSearchTerm ||
                            movementTypeFilter ||
                            dateFilter ? (
                              <>
                                <i className="bi bi-search display-6 d-block mb-2"></i>
                                No movements found with the current filters
                              </>
                            ) : (
                              <>
                                <i className="bi bi-inbox display-6 d-block mb-2"></i>
                                No stock movements recorded yet
                              </>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredMovements.map((movement) => (
                          <tr key={movement.id}>
                            <td className="text-center">
                              {format(
                                new Date(movement.created_at),
                                "MMM d, yyyy h:mm a"
                              )}
                            </td>
                            <td className="text-center">
                              {movement.product?.name}
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill bg-${
                                  movement.type === "in" ? "success" : "danger"
                                }`}
                              >
                                {movement.type === "in"
                                  ? "Stock In"
                                  : "Stock Out"}
                              </span>
                            </td>
                            <td className="text-center">{movement.quantity}</td>
                            <td className="text-center">
                              {movement.reference}
                            </td>
                            <td className="text-center">
                              {movement.notes || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Current Stock Section */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0">Current Stock</h6>
              </div>
              <div className="card-body">
                <div className="input-group mb-4">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="text-center" style={{ width: "50%" }}>
                          Product
                        </th>
                        <th className="text-center" style={{ width: "25%" }}>
                          Stock
                        </th>
                        <th className="text-center" style={{ width: "25%" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-4 text-muted"
                          >
                            {searchTerm ? (
                              <>
                                <i className="bi bi-search display-6 d-block mb-2"></i>
                                No products found matching "{searchTerm}"
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
                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center">
                                <span className="fw-medium">
                                  {product.name}
                                </span>
                                <small className="text-muted">
                                  ID: {product.id}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center gap-2">
                                <span className="fw-medium">
                                  {product.stock_quantity}
                                </span>
                                {product.stock_quantity <=
                                  product.alert_threshold && (
                                  <span className="badge bg-warning rounded-pill">
                                    Low Stock
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="actions-group justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  style={{ minWidth: "100px" }}
                                  onClick={() => handleAdjustStock(product)}
                                >
                                  Adjust Stock
                                </button>
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
          </div>
        </div>
      )}

      {showAdjustModal && selectedProduct && (
        <StockAdjustmentModal
          show={showAdjustModal}
          onHide={() => {
            setShowAdjustModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onStockAdjusted={handleStockAdjusted}
        />
      )}
    </div>
  );
};

export default Inventory;
