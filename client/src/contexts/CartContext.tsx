import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "../interfaces/Products";
import { CartItem } from "../interfaces/Sales";
import { useSettings } from "./SettingsContext";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateDiscount: (
    id: number,
    discountAmount: number,
    discountPercentage: number
  ) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { settings } = useSettings();

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...currentItems,
        {
          id: Date.now(),
          product,
          quantity,
          price: Number(product.price),
          discount: 0,
          discountPercentage: 0,
          subtotal: quantity * Number(product.price),
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id) {
          const itemTotal = quantity * Number(item.product.price);
          const discountAmount = (itemTotal * item.discountPercentage) / 100;
          return {
            ...item,
            quantity,
            discount: discountAmount,
            subtotal: itemTotal - discountAmount,
          };
        }
        return item;
      })
    );
  }, []);

  const updateDiscount = useCallback(
    (id: number, discountAmount: number, discountPercentage: number) => {
      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id === id) {
            const itemTotal = item.quantity * Number(item.product.price);
            const calculatedDiscount = (itemTotal * discountPercentage) / 100;
            return {
              ...item,
              discount: calculatedDiscount,
              discountPercentage,
              subtotal: itemTotal - calculatedDiscount,
            };
          }
          return item;
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.quantity) * Number(item.product.price) -
        (item.discount || 0)),
    0
  );

  // Get tax rate from settings, default to 0 if not found
  const taxRate = Number(
    settings.find((s) => s.key === "tax_rate")?.value || 0
  );
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateDiscount,
        clearCart,
        subtotal,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
