import React, { useState } from "react";
import { Product } from "../../types/Product";

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = Array.from(
    new Set(products.map((p) => p.category || "Uncategorized"))
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
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

      <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-1">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex flex-col h-full">
              <div className="mb-auto">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg leading-tight">
                    {product.name}
                  </h3>
                  <span className="badge bg-primary text-white text-xs px-2 py-1 rounded">
                    {product.category || "Uncategorized"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-primary">
                    ₱{Number(product.price).toFixed(2)}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      product.stock_quantity <= product.alert_threshold
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Stock: {product.stock_quantity}
                  </span>
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    product.stock_quantity === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  <i
                    className={`bi ${
                      product.stock_quantity === 0
                        ? "bi-x-circle"
                        : "bi-cart-plus"
                    }`}
                  ></i>
                  {product.stock_quantity === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
