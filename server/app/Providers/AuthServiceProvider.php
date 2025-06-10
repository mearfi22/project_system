<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Gate::define('manage_users', function ($user) {
            return $user->hasPermission('manage_users');
        });

        Gate::define('view_transaction', function ($user) {
            return $user->hasPermission('view_transaction');
        });

        Gate::define('create_transaction', function ($user) {
            return $user->hasPermission('create_transaction');
        });

        Gate::define('void_transaction', function ($user) {
            return $user->hasPermission('void_transaction');
        });

        Gate::define('view_product', function ($user) {
            return $user->hasPermission('view_product');
        });

        Gate::define('edit_product', function ($user) {
            return $user->hasPermission('edit_product');
        });

        Gate::define('view_reports', function ($user) {
            return $user->hasPermission('view_reports');
        });

        Gate::define('view_inventory', function ($user) {
            return $user->hasPermission('view_inventory');
        });

        Gate::define('manage_settings', function ($user) {
            return $user->hasPermission('manage_settings');
        });
    }
}
