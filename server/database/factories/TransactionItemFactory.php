<?php

namespace Database\Factories;

use App\Models\TransactionItem;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionItemFactory extends Factory
{
    protected $model = TransactionItem::class;

    public function definition()
    {
        $product = Product::factory()->create();
        $quantity = $this->faker->numberBetween(1, 10);

        return [
            'transaction_id' => Transaction::factory(),
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $product->price,
            'discount_amount' => $this->faker->randomFloat(2, 0, 20),
            'total_amount' => function (array $attributes) {
                return ($attributes['quantity'] * $attributes['unit_price']) - $attributes['discount_amount'];
            }
        ];
    }

    public function forProduct(Product $product)
    {
        return $this->state(function (array $attributes) use ($product) {
            $quantity = $this->faker->numberBetween(1, 10);

            return [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'total_amount' => ($quantity * $product->price) - ($attributes['discount_amount'] ?? 0)
            ];
        });
    }

    public function withDiscount($amount)
    {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'discount_amount' => $amount,
                'total_amount' => ($attributes['quantity'] * $attributes['unit_price']) - $amount
            ];
        });
    }
}
