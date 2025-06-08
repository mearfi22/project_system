<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        return [
            'name' => $this->faker->productName(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 1, 1000),
            'stock_quantity' => $this->faker->numberBetween(0, 1000),
            'alert_threshold' => $this->faker->numberBetween(5, 50),
            'sku' => $this->faker->unique()->ean8(),
            'barcode' => $this->faker->ean13(),
            'category' => $this->faker->randomElement(['Electronics', 'Clothing', 'Food', 'Books', 'Toys']),
            'active' => true
        ];
    }

    public function lowStock()
    {
        return $this->state(function (array $attributes) {
            return [
                'stock_quantity' => 5,
                'alert_threshold' => 10
            ];
        });
    }

    public function outOfStock()
    {
        return $this->state(function (array $attributes) {
            return [
                'stock_quantity' => 0
            ];
        });
    }
}
