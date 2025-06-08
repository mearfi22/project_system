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
        'sku',
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
        $this->save();
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
