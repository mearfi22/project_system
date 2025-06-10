import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Product } from "../../types/Product";
import { CartItem } from "../../types/CartItem";
import ProductList from "./ProductList";
import Cart from "./Cart";
import PaymentModal from "../modals/pos/PaymentModal";
import { toast } from "react-toastify";
import ProductService from "../../services/ProductService";

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
      const response = await ProductService.loadProducts();
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

  const updateDiscount = (productId: number, discount: number) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, discount } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + (item.product.price * item.quantity - (item.discount || 0)),
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

  const handlePaymentComplete = () => {
    setCart([]);
    setIsPaymentModalOpen(false);
    fetchProducts(); // Refresh products to get updated stock
    toast.success("Payment completed successfully");
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
      <div className="flex-1 p-4">
        <ProductList products={products} onAddToCart={addToCart} />
      </div>
      <div className="w-1/3 bg-white p-4 shadow-lg">
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          total={calculateTotal()}
          onUpdateDiscount={updateDiscount}
          canApplyDiscount={true}
        />
      </div>
      <PaymentModal
        show={isPaymentModalOpen}
        onHide={() => setIsPaymentModalOpen(false)}
        total={calculateTotal()}
        items={cart}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default POS;
