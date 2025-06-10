<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;

class DebugTransactions extends Command
{
    protected $signature = 'debug:transactions';
    protected $description = 'Debug transactions and their revenue';

    public function handle()
    {
        $this->info('Checking transactions...');

        // Get all completed transactions
        $transactions = Transaction::where('payment_status', 'completed')
            ->with('items.product')
            ->get();

        $this->info("Found " . $transactions->count() . " completed transactions");

        foreach ($transactions as $transaction) {
            $this->info("\nTransaction #{$transaction->id}");
            $this->info("Created at: " . $transaction->created_at);
            $this->info("Total amount: " . $transaction->total_amount);

            foreach ($transaction->items as $item) {
                $this->info("\n  Item #{$item->id}");
                $this->info("  Product: " . $item->product->name);
                $this->info("  Quantity: " . $item->quantity);
                $this->info("  Unit price: " . $item->unit_price);
                $this->info("  Total amount: " . $item->total_amount);
            }
        }

        // Check top products revenue
        $this->info("\n\nChecking top products revenue...");

        $topProducts = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.payment_status', 'completed')
            ->select(
                'transaction_items.product_id',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.total_amount) as total_revenue')
            )
            ->with('product:id,name')
            ->groupBy('transaction_items.product_id')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        foreach ($topProducts as $product) {
            $this->info("\nProduct: " . $product->product->name);
            $this->info("Total quantity: " . $product->total_quantity);
            $this->info("Total revenue: " . $product->total_revenue);
        }
    }
}
