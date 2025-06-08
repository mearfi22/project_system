<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SalesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Api\RoleController;

Route::controller(AuthController::class)->group(function () {
    Route::post('/login', 'login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::controller(AuthController::class)->group(function () {
        Route::get('/user', 'user');
        Route::post('/logout', 'logout');
    });

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

    // Product routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/low-stock', [ProductController::class, 'getLowStock']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{product}/stock', [ProductController::class, 'updateStock']);

    // Transaction routes
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::post('/transactions/{transaction}/feedback', [TransactionController::class, 'addFeedback']);
    Route::post('/transactions/{transaction}/void', [TransactionController::class, 'void']);

    // Reports routes
    Route::get('/reports/sales', [ReportController::class, 'sales']);
    Route::get('/reports/inventory', [ReportController::class, 'inventory']);
    Route::get('/reports/feedback', [ReportController::class, 'feedback']);

    // Role routes
    Route::get('/roles', [RoleController::class, 'loadRoles']);

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
});

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
