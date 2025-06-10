<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SalesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\WebhookController;

Route::controller(AuthController::class)->group(function () {
    Route::post('/login', 'login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::controller(AuthController::class)->group(function () {
        Route::get('/user', 'user');
        Route::post('/logout', 'logout');
    });

    Route::middleware('can:manage_users')->group(function () {
    Route::controller(GenderController::class)->group(function () {
        Route::get('/loadGenders', 'loadGenders');
        Route::get('/getGender/{genderId}', 'getGender');
        Route::post('/storeGender', 'storeGender');
        Route::put('/updateGender/{gender}', 'updateGender');
        Route::put('/destroyGender/{gender}', 'destroyGender');
    });

    Route::controller(UserController::class)->group(function () {
        Route::get('/loadUsers', 'loadUsers');
        Route::post('/storeUser', 'storeUser');
        Route::put('/updateUser/{user}', 'updateUser');
        Route::put('/destroyUser/{user}', 'destroyUser');
        });
    });

    // Product routes
    Route::middleware('can:view_product')->group(function () {
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/low-stock', [ProductController::class, 'getLowStock']);
        Route::get('/products/deleted', [ProductController::class, 'getDeleted']);
        Route::get('/products/{product}', [ProductController::class, 'show']);
    });

    Route::middleware('can:edit_product')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Transaction routes
    Route::middleware('can:view_transaction')->group(function () {
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/{id}', [TransactionController::class, 'show']);
        Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'generateReceipt']);
    });

    Route::middleware('can:create_transaction')->group(function () {
        Route::post('/transactions', [TransactionController::class, 'store']);
    });

    Route::middleware('can:void_transaction')->group(function () {
        Route::post('/transactions/{id}/void', [TransactionController::class, 'void']);
    });

    // Add feedback route without permission middleware since customers submit it
    Route::post('/transactions/{id}/feedback', [TransactionController::class, 'submitFeedback']);

    // Report routes
    Route::middleware('can:view_reports')->group(function () {
        Route::get('/reports/sales', [ReportController::class, 'sales']);
        Route::get('/reports/inventory', [ReportController::class, 'inventory']);
        Route::get('/reports/feedback', [ReportController::class, 'feedback']);
    });

    // Role routes
    Route::middleware('can:manage_users')->group(function () {
    Route::get('/roles', [RoleController::class, 'loadRoles']);
    });

    // Settings routes
    Route::get('/settings/public', [SettingController::class, 'getPublicSettings']);
    Route::middleware('can:manage_settings')->group(function () {
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'store']);
        Route::put('/settings/{setting}', [SettingController::class, 'update']);
        Route::post('/settings/bulk-update', [SettingController::class, 'bulkUpdate']);
    });

    // Inventory routes
    Route::get('/inventory/movements/{product?}', [InventoryController::class, 'getMovements']);
    Route::post('/inventory/adjust', [InventoryController::class, 'adjustStock']);
    Route::get('/inventory/history/{product}', [InventoryController::class, 'getHistory']);

    // Sales routes
    Route::get('/sales', [SalesController::class, 'index']);
    Route::post('/sales', [SalesController::class, 'store']);
    Route::get('/sales/{id}', [SalesController::class, 'show']);
    Route::get('/sales/{id}/receipt', [SalesController::class, 'getReceipt']);
    Route::get('/sales/daily', [SalesController::class, 'getDailySales']);

    // Webhook routes
    Route::post('/webhooks/transaction-created', [WebhookController::class, 'transactionCreated']);
});

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
