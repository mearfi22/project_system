import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Product } from "../../types/Product";
import { CartItem } from "../../types/CartItem";
import ProductList from "./ProductList";
import Cart from "./Cart";
import PaymentModal from "./PaymentModal";
import { toast } from "react-toastify";
import axios from "axios";

const POS: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch products");
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast.warning("Cannot exceed available stock");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock_quantity === 0) {
        toast.warning("Product out of stock");
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity > product.stock_quantity) {
      toast.warning("Cannot exceed available stock");
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warning("Cart is empty");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async (paymentDetails: any) => {
    try {
      const transaction = {
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        payment_method: paymentDetails.method,
        customer_name: paymentDetails.customerName,
        customer_email: paymentDetails.customerEmail,
        discount_amount: paymentDetails.discount || 0,
        tax_amount: paymentDetails.tax || 0,
        notes: paymentDetails.notes,
      };

      await axios.post("/api/transactions", transaction);
      toast.success("Transaction completed successfully");
      setCart([]);
      setIsPaymentModalOpen(false);
      fetchProducts(); // Refresh product list to update stock
    } catch (error) {
      toast.error("Failed to process transaction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <ProductList products={products} onAddToCart={addToCart} />
      </div>
      <div className="w-1/3 bg-white p-6 shadow-lg">
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          total={calculateTotal()}
          onCheckout={handleCheckout}
          canApplyDiscount={user?.isManager() || user?.isAdmin()}
        />
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onComplete={handlePaymentComplete}
        total={calculateTotal()}
        canApplyDiscount={user?.isManager() || user?.isAdmin()}
      />
    </div>
  );
};

export default POS;
