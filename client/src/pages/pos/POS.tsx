import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
    <div>
      <h1>Point of Sale</h1>
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                />
              </div>
              <div className="row">
                {/* Product grid will go here */}
                <div className="col-md-3 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Sample Product</h6>
                      <p className="card-text">₱100.00</p>
                      <button className="btn btn-primary btn-sm">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Shopping Cart</h5>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <p className="text-muted">No items in cart</p>
                ) : (
                  <div>Cart items will go here</div>
                )}
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₱0.00</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (12%):</span>
                <span>₱0.00</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold">₱0.00</span>
              </div>
              <button
                className="btn btn-success w-100"
                disabled={cart.length === 0}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
