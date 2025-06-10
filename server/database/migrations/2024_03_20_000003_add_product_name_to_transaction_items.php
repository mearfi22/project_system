<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('product_id');
        });

        // Populate product_name for existing records
        $items = DB::table('transaction_items')->get();
        foreach ($items as $item) {
            $product = Product::withTrashed()->find($item->product_id);
            if ($product) {
                DB::table('transaction_items')
                    ->where('id', $item->id)
                    ->update(['product_name' => $product->name]);
            }
        }
    }

    public function down()
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropColumn('product_name');
        });
    }
};
