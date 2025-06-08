<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::all();
        return response()->json([
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'alert_threshold' => 'required|integer|min:0',
            'sku' => 'required|string|max:50|unique:products',
            'barcode' => 'nullable|string|max:50|unique:products',
            'category' => 'required|string|max:50',
            'active' => 'boolean'
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json([
            'product' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'alert_threshold' => 'required|integer|min:0',
            'sku' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
            'barcode' => ['nullable', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
            'category' => 'required|string|max:50',
            'active' => 'boolean'
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    public function getLowStock()
    {
        $lowStockProducts = Product::where('stock_quantity', '<=', DB::raw('alert_threshold'))
            ->where('active', true)
            ->get();

        return response()->json([
            'products' => $lowStockProducts
        ]);
    }

    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer'
        ]);

        $product->updateStock($validated['quantity']);

        return response()->json([
            'message' => 'Stock updated successfully',
            'product' => $product
        ]);
    }
}
