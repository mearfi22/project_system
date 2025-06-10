<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'reference_number',
        'customer_name',
        'customer_email',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'payment_method',
        'payment_status',
        'notes',
        'receipt_sent',
        'satisfaction_rating',
        'feedback'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'receipt_sent' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            $transaction->reference_number = static::generateReferenceNumber();
        });
    }

    public static function generateReferenceNumber()
    {
        $prefix = date('Ymd');
        $lastTransaction = static::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastTransaction) {
            $lastNumber = intval(substr($lastTransaction->reference_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function calculateTotals()
    {
        $this->subtotal = (float)$this->items->sum('total_amount');
        $this->discount_amount = (float)($this->discount_amount ?? 0);
        $this->tax_amount = (float)($this->tax_amount ?? 0);

        $this->total_amount = $this->subtotal - $this->discount_amount + $this->tax_amount;
        $this->save();
    }

    public function markReceiptSent()
    {
        $this->receipt_sent = true;
        $this->save();
    }

    public function addFeedback($rating, $feedback = null)
    {
        $this->satisfaction_rating = $rating;
        $this->feedback = $feedback;
        $this->save();
    }
}
