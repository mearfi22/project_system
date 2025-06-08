import React, { useEffect, useState } from "react";
import { Products } from "../../interfaces/Products";
import ProductService from "../../services/ProductService";
import { useCart } from "../../contexts/CartContext";
import ErrorHandler from "../../handler/ErrorHandler";
import { toast } from "react-toastify";
import PaymentModal from "../../components/modals/pos/PaymentModal";

const POS: React.FC = () => {
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { items, addItem, removeItem, updateQuantity, subtotal, tax, total } =
    useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    ProductService.loadProducts()
      .then((res) => {
        setProducts(
          res.data.products.filter(
            (p: Products) => p.active && p.stock_quantity > 0
          )
        );
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        {/* Products Section */}
        <div className="col-md-8 h-100 overflow-auto">
          <div className="p-3">
            <div className="mb-4">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search products by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="col-md-3">
                    <div
                      className="card h-100 cursor-pointer"
                      onClick={() => {
                        if (product.stock_quantity > 0) {
                          addItem(product);
                          toast.success(`${product.name} added to cart`);
                        }
                      }}
                    >
                      <div className="card-body">
                        <h6 className="card-title mb-1">{product.name}</h6>
                        <p className="card-text text-muted small mb-1">
                          SKU: {product.sku}
                        </p>
                        <p className="card-text text-success fw-bold mb-1">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        <p className="card-text text-muted small mb-0">
                          Stock: {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="col-md-4 h-100 bg-light">
          <div className="p-3 h-100 d-flex flex-column">
            <h4 className="mb-3">Shopping Cart</h4>

            <div className="flex-grow-1 overflow-auto mb-3">
              {items.length === 0 ? (
                <p className="text-muted text-center">Cart is empty</p>
              ) : (
                <div className="list-group">
                  {items.map((item) => (
                    <div key={item.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">{item.product.name}</h6>
                          <small className="text-muted">
                            ${item.price.toFixed(2)} each
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="btn-group btn-group-sm mb-2">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              disabled
                            >
                              {item.quantity}
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <div className="d-block">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-end mt-1">
                        <strong>${item.subtotal.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-top pt-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold">${total.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary w-100"
                disabled={items.length === 0}
                onClick={() => setShowPayment(true)}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        show={showPayment}
        onHide={() => setShowPayment(false)}
        total={total}
        items={items}
      />
    </div>
  );
};

export default POS;
