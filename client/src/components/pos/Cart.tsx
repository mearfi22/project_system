import React from "react";
import { CartItem } from "../../types/CartItem";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  total: number;
  onCheckout: () => void;
  canApplyDiscount: boolean;
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  total,
  onCheckout,
  canApplyDiscount,
}) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Cart is empty</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x">{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold">${total.toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className={`w-full py-3 rounded-lg ${
            items.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          Proceed to Checkout
        </button>

        {canApplyDiscount && (
          <p className="text-sm text-gray-600 text-center mt-2">
            You can apply discounts during checkout
          </p>
        )}
      </div>
    </div>
  );
};

export default Cart;
