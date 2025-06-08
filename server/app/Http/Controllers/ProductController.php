<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $this->authorize('view_product');
        $products = Product::where('active', true)->get();
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $this->authorize('create_product');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'alert_threshold' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products',
            'barcode' => 'nullable|string',
            'category' => 'nullable|string'
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        $this->authorize('view_product');
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorize('edit_product');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'alert_threshold' => 'sometimes|integer|min:0',
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string',
            'category' => 'nullable|string',
            'active' => 'sometimes|boolean'
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete_product');
        $product->active = false;
        $product->save();
        return response()->json(null, 204);
    }

    public function updateStock(Request $request, Product $product)
    {
        $this->authorize('manage_inventory');

        $validated = $request->validate([
            'quantity' => 'required|integer',
            'operation' => 'required|in:add,subtract'
        ]);

        $product->updateStock($validated['quantity'], $validated['operation']);
        return response()->json($product);
    }

    public function lowStock()
    {
        $this->authorize('view_inventory');

        $products = Product::where('active', true)
            ->whereRaw('stock_quantity <= alert_threshold')
            ->get();

        return response()->json($products);
    }
}
