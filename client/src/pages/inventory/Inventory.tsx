import React, { useEffect, useState } from "react";
import { Products as ProductInterface } from "../../interfaces/Products";
import { StockMovement } from "../../interfaces/Inventory";
import ProductService from "../../services/ProductService";
import InventoryService from "../../services/InventoryService";
import ErrorHandler from "../../handler/ErrorHandler";
import { toast } from "react-toastify";
import StockAdjustmentModal from "../../components/modals/inventory/StockAdjustmentModal";

const Inventory = () => {
  const [products, setProducts] = useState<ProductInterface[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductInterface | null>(null);

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

  const handleAdjustStock = (product: ProductInterface) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1>Inventory Management</h1>
        </div>
        <div className="col-md-6 text-end">
          <button
            type="button"
            className="btn btn-warning me-2"
            onClick={() => {
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
            }}
          >
            Check Low Stock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Stock Movements</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Reference</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement) => (
                        <tr key={movement.id}>
                          <td>
                            {new Date(movement.created_at).toLocaleDateString()}
                          </td>
                          <td>{movement.product?.name}</td>
                          <td>
                            <span
                              className={`badge ${
                                movement.type === "in"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {movement.type.toUpperCase()}
                            </span>
                          </td>
                          <td>{movement.quantity}</td>
                          <td>{movement.reference}</td>
                          <td>{movement.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Current Stock</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>
                            {product.stock_quantity}
                            {product.stock_quantity <=
                              product.alert_threshold && (
                              <span className="badge bg-warning ms-2">
                                Low Stock
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAdjustStock(product)}
                            >
                              Adjust
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
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
