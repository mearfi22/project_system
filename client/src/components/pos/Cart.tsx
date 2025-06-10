import React from "react";
import { CartItem } from "../../interfaces/Sales";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  total: number;
  onCheckout: () => void;
  canApplyDiscount?: boolean;
  onUpdateDiscount: (
    productId: number,
    discountAmount: number,
    discountPercentage: number
  ) => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  total,
  onCheckout,
  canApplyDiscount = false,
  onUpdateDiscount,
}) => {
  return (
    <div className="d-flex flex-column h-100">
      <h4 className="mb-3">Shopping Cart</h4>

      <div className="flex-grow-1 overflow-auto mb-3">
        {items.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-cart3 display-1 mb-3"></i>
            <p className="lead">Your cart is empty</p>
            <p className="small">Add products by clicking on them</p>
          </div>
        ) : (
          <div className="list-group">
            {items.map((item) => (
              <div key={item.product.id} className="list-group-item p-3">
                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0">{item.product.name}</h6>
                    <button
                      className="btn btn-link text-danger p-0 ms-2"
                      onClick={() => onRemoveItem(item.product.id)}
                    >
                      Remove item
                    </button>
                  </div>
                  <div className="text-muted">
                    ₱{item.product.price.toFixed(2)} each
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <div className="d-flex align-items-center border rounded">
                      <button
                        className="btn border-0 px-3"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <div
                        className="px-3 border-start border-end"
                        style={{ minWidth: "40px", textAlign: "center" }}
                      >
                        {item.quantity}
                      </div>
                      <button
                        className="btn border-0 px-3 bg-secondary text-white"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Discount %"
                        min="0"
                        max="100"
                        value={item.discountPercentage || ""}
                        onChange={(e) => {
                          const percentage = Math.min(
                            Math.max(Number(e.target.value), 0),
                            100
                          );
                          const itemTotal = item.product.price * item.quantity;
                          const discountAmount = (itemTotal * percentage) / 100;
                          onUpdateDiscount(
                            item.product.id,
                            discountAmount,
                            percentage
                          );
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                </div>

                <div className="text-end mt-2">
                  <h5 className="mb-0">
                    ₱
                    {(
                      item.product.price * item.quantity -
                      (item.discount ?? 0)
                    ).toFixed(2)}
                  </h5>
                  {(item.discount ?? 0) > 0 && (
                    <small className="text-success">
                      -{item.discountPercentage}% (-₱
                      {(item.discount ?? 0).toFixed(2)})
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-top pt-3">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tax (10%):</span>
          <span>₱{(total * 0.1).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold">Total:</span>
          <span className="fw-bold">₱{(total * 1.1).toFixed(2)}</span>
        </div>

        <button
          className="btn btn-primary btn-lg w-100"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          <i className="bi bi-credit-card me-2"></i>
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default Cart;
