import React, { useEffect, useState } from "react";
import { Product } from "../../interfaces/Products";
import ProductService from "../../services/ProductService";
import { useCart } from "../../contexts/CartContext";
import { useSettings } from "../../contexts/SettingsContext";
import ErrorHandler from "../../handler/ErrorHandler";
import { toast } from "react-toastify";
import PaymentModal from "../../components/modals/pos/PaymentModal";
import "./POS.css";

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [reservedStock, setReservedStock] = useState<{ [key: number]: number }>(
    {}
  );
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    subtotal,
    tax,
    total,
    clearCart,
  } = useCart();
  const { settings } = useSettings();

  // Get tax rate from settings
  const taxRate = settings.find((s) => s.key === "tax_rate")?.value || 0;

  useEffect(() => {
    loadProducts();
  }, []);

  // Update reserved stock when cart changes
  useEffect(() => {
    const newReservedStock: { [key: number]: number } = {};
    items.forEach((item) => {
      newReservedStock[item.product.id] = item.quantity;
    });
    setReservedStock(newReservedStock);
  }, [items]);

  const loadProducts = () => {
    setLoading(true);
    ProductService.loadProducts()
      .then((res) => {
        setProducts(res.data.products.filter((p: Product) => p.active));
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getAvailableStock = (product: Product) => {
    const reserved = reservedStock[product.id] || 0;
    return product.stock_quantity - reserved;
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    const cartItem = items.find((item) => item.id === itemId);
    if (!cartItem) return;

    const product = products.find((p) => p.id === cartItem.product.id);
    if (!product) return;

    // Don't allow quantity to exceed stock
    if (newQuantity > product.stock_quantity) {
      toast.warning(`Only ${product.stock_quantity} items available`);
      return;
    }

    // Allow empty or 0 value while typing
    if (newQuantity === 0) {
      updateQuantity(itemId, newQuantity);
      return;
    }

    // Only update if quantity is valid
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.warning("Product is out of stock");
      return;
    }

    const existingItem = items.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast.warning(`Only ${product.stock_quantity} items available`);
        return;
      }
      handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
      toast.success(`Added another ${product.name} to cart`);
    } else {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    clearCart();
    loadProducts(); // Reload products to get updated stock quantities
    toast.success("Payment completed successfully");
  };

  const categories = Array.from(
    new Set(products.map((product) => product.category || "Uncategorized"))
  );

  const filteredProducts = products.filter((product) =>
    searchTerm
      ? (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedCategory || product.category === selectedCategory)
      : !selectedCategory || product.category === selectedCategory
  );

  return (
    <div className="pos-container row g-0">
      {/* Products Section */}
      <div className="col-md-8 h-100 d-flex flex-column products-section">
        <div className="search-section">
          <div className="row g-2">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control search-input border-start-0 ps-0"
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto p-3 products-grid">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-products">
              <i className="bi bi-box display-1 mb-3"></i>
              <p className="lead mb-0">No products found</p>
              {searchTerm && (
                <p className="text-muted">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          ) : (
            <div className="row g-3">
              {filteredProducts.map((product) => {
                const availableStock = getAvailableStock(product);
                return (
                  <div key={product.id} className="col-md-3">
                    <div
                      className={`card product-card ${
                        availableStock === 0 ? "opacity-75" : ""
                      }`}
                      onClick={() => handleAddToCart(product)}
                      style={{
                        cursor: availableStock > 0 ? "pointer" : "not-allowed",
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">{product.name}</h6>
                          <span className="badge bg-primary">
                            {product.category || "Uncategorized"}
                          </span>
                        </div>
                        <p className="card-text text-muted small mb-2">
                          {product.barcode || "No barcode"}
                        </p>
                        <div className="mt-auto">
                          <p className="price mb-1">
                            ₱{Number(product.price).toFixed(2)}
                          </p>
                          <span
                            className={`badge ${
                              availableStock <= product.alert_threshold
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                          >
                            Stock: {availableStock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="col-md-4 h-100 d-flex flex-column cart-section">
        <div className="cart-header">
          <h5 className="mb-0 d-flex align-items-center">
            <i className="bi bi-cart3 me-2"></i>Shopping Cart
          </h5>
        </div>

        <div className="flex-grow-1 overflow-auto p-3 cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <i className="bi bi-cart3 display-1"></i>
              <p className="lead mb-1">Your cart is empty</p>
              <p className="text-muted mb-0">
                Add products by clicking on them
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">{item.product.name}</h6>
                      <small className="text-muted">
                        ₱{Number(item.product.price).toFixed(2)} each
                      </small>
                    </div>
                    <button
                      className="btn btn-link remove-btn p-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">Qty</span>
                        <input
                          type="number"
                          className="form-control quantity-input text-center"
                          value={item.quantity || ""}
                          min="1"
                          max={item.product.stock_quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newQuantity =
                              value === "" ? 0 : parseInt(value);
                            handleUpdateQuantity(item.id, newQuantity);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            const newQuantity =
                              value === "" || parseInt(value) <= 0
                                ? 1
                                : parseInt(value);
                            handleUpdateQuantity(item.id, newQuantity);
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="input-group input-group-sm">
                        <input
                          type="number"
                          className="form-control discount-input"
                          placeholder="Discount"
                          value={item.discountPercentage || ""}
                          min="0"
                          max="100"
                          onChange={(e) => {
                            const percentage = Math.min(
                              Math.max(Number(e.target.value) || 0, 0),
                              100
                            );
                            const itemTotal =
                              Number(item.product.price) * item.quantity;
                            const discountAmount =
                              (itemTotal * percentage) / 100;
                            updateDiscount(item.id, discountAmount, percentage);
                          }}
                        />
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-baseline mt-2">
                    <div>
                      {(item.discount ?? 0) > 0 && (
                        <small className="text-success">
                          <i className="bi bi-tag-fill me-1"></i>
                          {item.discountPercentage}% off
                        </small>
                      )}
                    </div>
                    <span className="fw-bold">
                      ₱
                      {(
                        Number(item.product.price) * item.quantity -
                        (item.discount || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Subtotal:</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tax ({taxRate}%):</span>
            <span>₱{tax.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <span className="fw-bold">Total:</span>
            <span className="cart-total">₱{total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={items.length === 0}
            onClick={() => setShowPayment(true)}
          >
            <i className="bi bi-credit-card"></i>
            Proceed to Payment
          </button>
        </div>
      </div>

      <PaymentModal
        show={showPayment}
        onHide={() => setShowPayment(false)}
        total={total}
        items={items}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default POS;
