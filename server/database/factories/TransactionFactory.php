<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'subtotal' => $this->faker->randomFloat(2, 10, 1000),
            'discount_amount' => $this->faker->randomFloat(2, 0, 100),
            'tax_amount' => $this->faker->randomFloat(2, 0, 50),
            'total_amount' => function (array $attributes) {
                return $attributes['subtotal'] - $attributes['discount_amount'] + $attributes['tax_amount'];
            },
            'payment_method' => $this->faker->randomElement(['cash', 'card', 'qr']),
            'payment_status' => 'completed',
            'notes' => $this->faker->optional()->sentence(),
            'receipt_sent' => $this->faker->boolean(),
            'satisfaction_rating' => $this->faker->optional()->numberBetween(1, 5),
            'feedback' => $this->faker->optional()->paragraph()
        ];
    }

    public function withFeedback()
    {
        return $this->state(function (array $attributes) {
            return [
                'satisfaction_rating' => $this->faker->numberBetween(1, 5),
                'feedback' => $this->faker->paragraph()
            ];
        });
    }

    public function voided()
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_status' => 'voided'
            ];
        });
    }
}
