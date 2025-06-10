<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'alert_threshold' => 'required|integer|min:0',
            'barcode' => 'nullable|string|max:50|unique:products',
            'category' => 'nullable|string|max:50',
            'active' => 'boolean'
        ]);

        $product = Product::create($validatedData);
        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json([
            'product' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        try {
            Log::info('Updating product', [
                'product_id' => $product->id,
                'request_data' => $request->all()
            ]);

            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'alert_threshold' => 'required|integer|min:0',
                'barcode' => ['nullable', 'string', 'max:50', Rule::unique('products')->ignore($product->id)],
                'category' => 'nullable|string|max:50',
                'active' => 'boolean'
            ]);

            // If stock quantity is 0, force active to false
            if ($validatedData['stock_quantity'] <= 0) {
                $validatedData['active'] = false;
                $validatedData['stock_quantity'] = 0; // Prevent negative stock
            }

            Log::info('Validated data', [
                'product_id' => $product->id,
                'validated_data' => $validatedData
            ]);

            $product->update($validatedData);

            Log::info('Product updated successfully', [
                'product_id' => $product->id,
                'updated_data' => $product->toArray()
            ]);

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed while updating product', [
                'product_id' => $product->id,
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating product', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Product $product)
    {
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

    public function getDeleted()
    {
        $deletedProducts = Product::onlyTrashed()->get();

        return response()->json([
            'products' => $deletedProducts
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
