<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private User $cashier;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RolesAndPermissionsSeeder::class,
            DefaultUsersSeeder::class,
        ]);

        $this->cashier = User::where('email', 'cashier@example.com')->first();

        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 100.00,
            'stock_quantity' => 50
        ]);
    }

    public function test_cashier_can_create_transaction()
    {
        Sanctum::actingAs($this->cashier);

        $response = $this->postJson('/api/transactions', [
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2
                ]
            ],
            'payment_method' => 'cash',
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'payment_status' => 'completed',
                'total_amount' => 200.00
            ]);

        $this->assertEquals(48, $this->product->fresh()->stock_quantity);
    }

    public function test_cannot_create_transaction_with_insufficient_stock()
    {
        Sanctum::actingAs($this->cashier);

        $response = $this->postJson('/api/transactions', [
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 100
                ]
            ],
            'payment_method' => 'cash'
        ]);

        $response->assertStatus(400)
            ->assertJsonFragment([
                'error' => 'Insufficient stock for product: Test Product'
            ]);

        $this->assertEquals(50, $this->product->fresh()->stock_quantity);
    }

    public function test_manager_can_void_transaction()
    {
        $manager = User::where('email', 'manager@example.com')->first();
        Sanctum::actingAs($manager);

        $transaction = Transaction::factory()
            ->has(
                TransactionItem::factory()
                    ->forProduct($this->product)
                    ->state([
                        'quantity' => 2,
                        'unit_price' => 100.00,
                        'total_amount' => 200.00
                    ])
            )
            ->create([
                'payment_status' => 'completed',
                'total_amount' => 200.00
            ]);

        $initialStock = $this->product->stock_quantity;

        $response = $this->postJson("/api/transactions/{$transaction->id}/void");

        $response->assertOk();

        $transaction->refresh();
        $this->product->refresh();

        $this->assertEquals('voided', $transaction->payment_status);
        $this->assertEquals($initialStock + 2, $this->product->stock_quantity);
    }

    public function test_cashier_cannot_void_transaction()
    {
        Sanctum::actingAs($this->cashier);

        $transaction = Transaction::factory()->create();

        $response = $this->postJson("/api/transactions/{$transaction->id}/void");

        $response->assertForbidden();
    }

    public function test_can_add_feedback_to_transaction()
    {
        $transaction = Transaction::factory()->create();

        $response = $this->postJson("/api/transactions/{$transaction->id}/feedback", [
            'rating' => 5,
            'feedback' => 'Great service!'
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'satisfaction_rating' => 5,
            'feedback' => 'Great service!'
        ]);
    }

    public function test_email_receipt_is_sent()
    {
        Sanctum::actingAs($this->cashier);

        $response = $this->postJson('/api/transactions', [
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1
                ]
            ],
            'payment_method' => 'cash',
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com'
        ]);

        $response->assertStatus(201);

        $transaction = Transaction::first();
        $this->assertTrue($transaction->receipt_sent);
    }
}
