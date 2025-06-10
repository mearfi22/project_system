<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function sales(Request $request)
    {
        try {
            $this->authorize('view_reports');

            $period = $request->get('period', 'today');

            // Set date range based on period
            $end = now();
            $start = match($period) {
                'today' => now()->startOfDay(),
                'week' => now()->startOfWeek(),
                'month' => now()->startOfMonth(),
                'year' => now()->startOfYear(),
                default => now()->startOfDay(),  // Default to today
            };

            Log::info('Report date range:', [
                'period' => $period,
                'start' => $start->toDateTimeString(),
                'end' => $end->toDateTimeString()
            ]);

            // Get sales data grouped by date
            $salesData = Transaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('AVG(total_amount) as average_sale')
            )
            ->whereBetween('created_at', [$start, $end])
            ->where('payment_status', 'completed')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

            // Get top products by revenue
            $topProducts = TransactionItem::select(
                'product_id',
                'product_name',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->whereHas('transaction', function($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end])
                    ->where('payment_status', 'completed');
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name ?: 'Unknown Product',
                    'total_quantity' => $item->total_quantity,
                    'total_revenue' => $item->total_revenue
                ];
            });

            // Get feedback data
            $feedbackTransactions = Transaction::whereNotNull('satisfaction_rating')
                ->whereBetween('created_at', [$start, $end])
                ->select('id', 'reference_number', 'customer_name', 'satisfaction_rating', 'feedback', 'created_at')
                ->orderByDesc('created_at')
                ->limit(20)
                ->get();

            $ratingDistribution = Transaction::whereNotNull('satisfaction_rating')
                ->whereBetween('created_at', [$start, $end])
                ->select('satisfaction_rating', DB::raw('COUNT(*) as count'))
                ->groupBy('satisfaction_rating')
                ->get()
                ->pluck('count', 'satisfaction_rating')
                ->toArray();

            // Ensure all ratings (1-5) are represented in the distribution
            $ratingDistribution = array_replace(
                array_fill(1, 5, 0),
                $ratingDistribution
            );

            $totalFeedback = array_sum($ratingDistribution);
            $averageRating = $totalFeedback > 0
                ? Transaction::whereNotNull('satisfaction_rating')
                    ->whereBetween('created_at', [$start, $end])
                    ->avg('satisfaction_rating')
                : 0;

            // Calculate summary
            $summary = [
                'total_sales' => $salesData->sum('total_sales'),
                'total_transactions' => $salesData->sum('total_transactions'),
                'average_sale' => $salesData->avg('average_sale'),
                'total_products' => Product::where('active', true)->whereNull('deleted_at')->count()
            ];

            return response()->json([
                'period' => $period,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'sales_data' => $salesData,
                'top_products' => $topProducts,
                'summary' => $summary,
                'feedback_data' => [
                    'transactions' => $feedbackTransactions,
                    'summary' => [
                        'average_rating' => round($averageRating, 2),
                        'total_feedback' => $totalFeedback,
                        'rating_distribution' => $ratingDistribution
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in sales report:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error generating sales report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function inventory()
    {
        try {
        $this->authorize('view_reports');

        $products = Product::select(
            'id',
            'name',
                'stock_quantity',
                'alert_threshold',
                'price',
                DB::raw('(stock_quantity * price) as stock_value')
        )->get();

        $lowStock = $products->filter(function ($product) {
                return $product->stock_quantity <= $product->alert_threshold;
        })->values();

        $inventoryMovement = TransactionItem::with('product:id,name')
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_amount) as total_value')
            )
            ->whereHas('transaction', function ($query) {
                $query->where('payment_status', 'completed')
                    ->where('created_at', '>=', now()->subDays(30));
            })
            ->groupBy('product_id')
            ->get();

        return response()->json([
            'current_inventory' => $products,
            'low_stock_alerts' => $lowStock,
            'inventory_movement' => $inventoryMovement,
            'summary' => [
                'total_products' => $products->count(),
                'total_stock_value' => $products->sum('stock_value'),
                'low_stock_count' => $lowStock->count(),
                'average_stock_value' => $products->avg('stock_value')
            ]
        ]);

        } catch (\Exception $e) {
            Log::error('Error in inventory report:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to generate inventory report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function feedback(Request $request)
    {
        try {
            $this->authorize('view_reports');

            $period = $request->get('period', 'today');

            // Set date range based on period
            $end = now();
            $start = match($period) {
                'today' => now()->startOfDay(),
                'week' => now()->startOfWeek(),
                'month' => now()->startOfMonth(),
                'year' => now()->startOfYear(),
                default => now()->startOfDay(),  // Default to today
            };

            // Get feedback data with date range
            $feedbackTransactions = Transaction::whereNotNull('satisfaction_rating')
                ->whereBetween('created_at', [$start, $end])
                ->select(
                    'id',
                    'reference_number',
                    'customer_name',
                    'satisfaction_rating',
                    'feedback',
                    'created_at'
                )
                ->orderByDesc('created_at')
                ->limit(20)
                ->get();

            $ratingDistribution = Transaction::whereNotNull('satisfaction_rating')
                ->whereBetween('created_at', [$start, $end])
                ->select('satisfaction_rating', DB::raw('COUNT(*) as count'))
                ->groupBy('satisfaction_rating')
                ->get()
                ->pluck('count', 'satisfaction_rating')
                ->toArray();

            // Ensure all ratings (1-5) are represented in the distribution
            $ratingDistribution = array_replace(
                array_fill(1, 5, 0),
                $ratingDistribution
            );

            $totalFeedback = array_sum($ratingDistribution);
            $averageRating = $totalFeedback > 0
                ? Transaction::whereNotNull('satisfaction_rating')
                    ->whereBetween('created_at', [$start, $end])
                    ->avg('satisfaction_rating')
                : 0;

            return response()->json([
                'period' => $period,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'transactions' => $feedbackTransactions,
                'summary' => [
                    'average_rating' => round($averageRating, 2),
                    'total_feedback' => $totalFeedback,
                    'rating_distribution' => $ratingDistribution
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in feedback report:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to generate feedback report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
