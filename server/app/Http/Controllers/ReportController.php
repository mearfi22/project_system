<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function sales(Request $request)
    {
        $this->authorize('view_reports');

        $period = $request->get('period', 'daily');
        $start = $request->get('start', Carbon::now()->startOfMonth());
        $end = $request->get('end', Carbon::now());

        $sales = Transaction::where('payment_status', 'completed')
            ->whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('AVG(total_amount) as average_sale')
            )
            ->groupBy('date')
            ->get();

        $topProducts = TransactionItem::whereBetween('created_at', [$start, $end])
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return response()->json([
            'period' => $period,
            'start_date' => $start,
            'end_date' => $end,
            'sales_data' => $sales,
            'top_products' => $topProducts,
            'summary' => [
                'total_sales' => $sales->sum('total_sales'),
                'total_transactions' => $sales->sum('total_transactions'),
                'average_sale' => $sales->avg('average_sale')
            ]
        ]);
    }

    public function inventory()
    {
        $this->authorize('view_inventory');

        $inventory = Product::select(
            'category',
            DB::raw('COUNT(*) as total_products'),
            DB::raw('SUM(stock_quantity) as total_stock'),
            DB::raw('SUM(CASE WHEN stock_quantity <= alert_threshold THEN 1 ELSE 0 END) as low_stock_count')
        )
            ->where('active', true)
            ->groupBy('category')
            ->get();

        $lowStockProducts = Product::where('active', true)
            ->whereRaw('stock_quantity <= alert_threshold')
            ->select('name', 'stock_quantity', 'alert_threshold')
            ->get();

        return response()->json([
            'inventory_by_category' => $inventory,
            'low_stock_products' => $lowStockProducts,
            'summary' => [
                'total_products' => Product::where('active', true)->count(),
                'total_low_stock' => $lowStockProducts->count(),
                'categories_count' => $inventory->count()
            ]
        ]);
    }

    public function feedback()
    {
        $this->authorize('view_reports');

        $feedback = Transaction::whereNotNull('satisfaction_rating')
            ->select(
                'satisfaction_rating',
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(satisfaction_rating) as average_rating')
            )
            ->groupBy('satisfaction_rating')
            ->get();

        $recentFeedback = Transaction::whereNotNull('feedback')
            ->select('id', 'customer_name', 'satisfaction_rating', 'feedback', 'created_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'rating_distribution' => $feedback,
            'recent_feedback' => $recentFeedback,
            'summary' => [
                'average_rating' => Transaction::whereNotNull('satisfaction_rating')->avg('satisfaction_rating'),
                'total_feedback_count' => Transaction::whereNotNull('satisfaction_rating')->count(),
                'feedback_with_comments' => Transaction::whereNotNull('feedback')->count()
            ]
        ]);
    }
}
