<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $manager;
    private User $cashier;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RolesAndPermissionsSeeder::class,
            DefaultUsersSeeder::class,
        ]);

        $this->admin = User::where('email', 'admin@example.com')->first();
        $this->manager = User::where('email', 'manager@example.com')->first();
        $this->cashier = User::where('email', 'cashier@example.com')->first();
    }

    public function test_admin_can_create_product()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/products', [
            'name' => 'Test Product',
            'description' => 'Test Description',
            'price' => 99.99,
            'stock_quantity' => 100,
            'alert_threshold' => 10,
            'sku' => 'TEST001',
            'category' => 'Test Category'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'name' => 'Test Product',
                'price' => 99.99,
                'stock_quantity' => 100
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'sku' => 'TEST001'
        ]);
    }

    public function test_manager_can_update_product()
    {
        Sanctum::actingAs($this->manager);

        $product = Product::factory()->create([
            'name' => 'Original Name',
            'price' => 50.00
        ]);

        $response = $this->putJson("/api/products/{$product->id}", [
            'name' => 'Updated Name',
            'price' => 75.00
        ]);

        $response->assertOk()
            ->assertJson([
                'name' => 'Updated Name',
                'price' => 75.00
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name',
            'price' => 75.00
        ]);
    }

    public function test_cashier_cannot_create_product()
    {
        Sanctum::actingAs($this->cashier);

        $response = $this->postJson('/api/products', [
            'name' => 'Test Product',
            'price' => 99.99,
            'stock_quantity' => 100,
            'sku' => 'TEST001'
        ]);

        $response->assertForbidden();
    }

    public function test_manager_can_update_stock()
    {
        Sanctum::actingAs($this->manager);

        $product = Product::factory()->create([
            'stock_quantity' => 100
        ]);

        $response = $this->postJson("/api/products/{$product->id}/stock", [
            'quantity' => 50,
            'operation' => 'add'
        ]);

        $response->assertOk();

        $this->assertEquals(150, $product->fresh()->stock_quantity);

        $response = $this->postJson("/api/products/{$product->id}/stock", [
            'quantity' => 30,
            'operation' => 'subtract'
        ]);

        $response->assertOk();

        $this->assertEquals(120, $product->fresh()->stock_quantity);
    }

    public function test_low_stock_alert()
    {
        Sanctum::actingAs($this->manager);

        Product::factory()->create([
            'name' => 'Low Stock Product',
            'stock_quantity' => 5,
            'alert_threshold' => 10
        ]);

        $response = $this->getJson('/api/products/low-stock');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'name' => 'Low Stock Product'
            ]);
    }
}
