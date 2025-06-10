<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'alert_threshold',
        'barcode',
        'category',
        'active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'alert_threshold' => 'integer',
        'active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            // If stock quantity is 0 or less, set active to false
            if ($product->stock_quantity <= 0) {
                $product->active = false;
            }
        });
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function isLowStock()
    {
        return $this->stock_quantity <= $this->alert_threshold;
    }

    public function updateStock($quantity, $operation = 'subtract')
    {
        if ($operation === 'add') {
            $this->stock_quantity += $quantity;
        } else {
            $this->stock_quantity -= $quantity;
        }

        // If stock becomes 0 or negative, set active to false
        if ($this->stock_quantity <= 0) {
            $this->active = false;
            $this->stock_quantity = 0; // Prevent negative stock
        }

        $this->save();
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
