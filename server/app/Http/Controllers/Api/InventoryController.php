<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function getMovements(Request $request, $productId = null)
    {
        $query = StockMovement::with('product');

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $movements = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'movements' => $movements
        ]);
    }

    public function adjustStock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:in,out',
            'reference' => 'required|string|max:255',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $product = Product::findOrFail($validated['product_id']);

            // Create stock movement record
            $movement = StockMovement::create($validated);

            // Update product stock
            if ($validated['type'] === 'in') {
                $product->stock_quantity += $validated['quantity'];
            } else {
                if ($product->stock_quantity < $validated['quantity']) {
                    throw new \Exception('Insufficient stock quantity');
                }
                $product->stock_quantity -= $validated['quantity'];
            }

            $product->save();

            DB::commit();

            return response()->json([
                'message' => 'Stock adjusted successfully',
                'movement' => $movement,
                'product' => $product
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function getHistory($productId)
    {
        $product = Product::findOrFail($productId);
        $movements = $product->stockMovements()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'product' => $product,
            'movements' => $movements
        ]);
    }
}
