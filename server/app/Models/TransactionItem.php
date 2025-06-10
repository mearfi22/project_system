<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'product_name',
        'quantity',
        'unit_price',
        'discount_amount',
        'total_amount'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function calculateTotal()
    {
        $quantity = (float)$this->quantity;
        $unit_price = (float)$this->unit_price;
        $discount_amount = (float)($this->discount_amount ?? 0);

        $subtotal = $quantity * $unit_price;
        $this->total_amount = $subtotal - $discount_amount;
        $this->save();
    }
}
