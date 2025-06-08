<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReceiptEmail;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $this->authorize('view_transaction');
        $transactions = Transaction::with(['items.product', 'user'])->get();
        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $this->authorize('create_transaction');

        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $transaction = Transaction::create([
                'user_id' => Auth::id(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'completed',
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'notes' => $validated['notes']
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total_amount' => $product->price * $item['quantity']
                ]);

                $product->updateStock($item['quantity']);
            }

            $transaction->calculateTotals();

            if ($transaction->customer_email) {
                Mail::to($transaction->customer_email)->queue(new ReceiptEmail($transaction));
                $transaction->markReceiptSent();
            }

            DB::commit();
            return response()->json($transaction->load('items.product'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view_transaction');
        return response()->json($transaction->load('items.product'));
    }

    public function addFeedback(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string'
        ]);

        $transaction->addFeedback($validated['rating'], $validated['feedback']);
        return response()->json($transaction);
    }

    public function void(Transaction $transaction)
    {
        $this->authorize('void_transaction');

        try {
            DB::beginTransaction();

            foreach ($transaction->items as $item) {
                $item->product->updateStock($item->quantity, 'add');
            }

            $transaction->payment_status = 'voided';
            $transaction->save();

            DB::commit();
            return response()->json($transaction);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
