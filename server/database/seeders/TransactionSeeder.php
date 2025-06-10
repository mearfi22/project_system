<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Models\Product;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    public function run()
    {
        // Get a cashier user
        $user = User::whereHas('role', function($query) {
            $query->where('name', 'cashier');
        })->first();

        if (!$user) {
            $user = User::first(); // Fallback to any user if no cashier found
        }

        // Get some products
        $products = Product::take(3)->get();

        if ($products->isEmpty()) {
            return; // No products to create transactions with
        }

        // Create transactions for the last 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // Create 2-4 transactions per day
            $transactionsPerDay = rand(2, 4);

            for ($j = 0; $j < $transactionsPerDay; $j++) {
                $transaction = Transaction::create([
                    'user_id' => $user->user_id,
                    'customer_name' => 'Customer ' . ($i * 3 + $j + 1),
                    'customer_email' => 'customer' . ($i * 3 + $j + 1) . '@example.com',
                    'payment_method' => ['cash', 'card', 'qr'][rand(0, 2)],
                    'payment_status' => 'completed',
                    'subtotal' => 0,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 0,
                    'created_at' => $date->copy()->addHours(rand(9, 17))->addMinutes(rand(0, 59)),
                ]);

                // Add 1-3 items to each transaction
                $itemCount = rand(1, 3);
                $subtotal = 0;

                for ($k = 0; $k < $itemCount; $k++) {
                    $product = $products->random();
                    $quantity = rand(1, 3);
                    $unitPrice = $product->price;
                    $totalAmount = $quantity * $unitPrice;
                    $subtotal += $totalAmount;

                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_amount' => $totalAmount,
                    ]);
                }

                // Update transaction totals
                $transaction->update([
                    'subtotal' => $subtotal,
                    'total_amount' => $subtotal, // For simplicity, not adding tax
                ]);
            }
        }
    }
}
