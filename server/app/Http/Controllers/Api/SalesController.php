<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalesController extends Controller
{
    public function index()
    {
        $sales = Sale::with(['items.product', 'cashier'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'sales' => $sales
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'payment.method' => 'required|in:cash,card',
            'payment.amount' => 'required|numeric|min:0',
            'payment.received' => 'required_if:payment.method,cash|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Calculate totals
            $subtotal = collect($validated['items'])->sum(function ($item) {
                return $item['quantity'] * $item['price'];
            });

            $tax = $subtotal * 0.1; // 10% tax
            $total = $subtotal + $tax;

            // Validate payment amount
            if ($validated['payment']['amount'] < $total) {
                throw new \Exception('Payment amount is insufficient');
            }

            // Create sale
            $sale = Sale::create([
                'reference' => 'SALE-' . strtoupper(Str::random(8)),
                'cashier_id' => auth()->id(),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $validated['payment']['method'],
                'amount_received' => $validated['payment']['received'] ?? null,
                'change_amount' => isset($validated['payment']['received'])
                    ? $validated['payment']['received'] - $total
                    : null
            ]);

            // Create sale items and update stock
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check stock
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                // Create sale item
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price']
                ]);

                // Update stock
                $product->stock_quantity -= $item['quantity'];
                $product->save();
            }

            DB::commit();

            $sale->load(['items.product', 'cashier']);

            return response()->json([
                'message' => 'Sale completed successfully',
                'sale' => $sale
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function show($id)
    {
        $sale = Sale::with(['items.product', 'cashier'])
            ->findOrFail($id);

        return response()->json([
            'sale' => $sale
        ]);
    }

    public function getReceipt($id)
    {
        $sale = Sale::with(['items.product', 'cashier'])
            ->findOrFail($id);

        return response()->json([
            'receipt' => [
                'sale' => $sale,
                'business' => [
                    'name' => 'Your Business Name',
                    'address' => 'Your Business Address',
                    'phone' => 'Your Business Phone',
                    'email' => 'your@email.com',
                    'tax_no' => 'Your Tax Number'
                ]
            ]
        ]);
    }

    public function getDailySales()
    {
        $sales = Sale::with(['items.product'])
            ->whereDate('created_at', today())
            ->get();

        $totalSales = $sales->sum('total');
        $totalItems = $sales->sum(function ($sale) {
            return $sale->items->sum('quantity');
        });

        return response()->json([
            'total_sales' => $totalSales,
            'total_items' => $totalItems,
            'sales_count' => $sales->count(),
            'sales' => $sales
        ]);
    }
}
