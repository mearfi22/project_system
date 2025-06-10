<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Create permissions
        $permissions = [
            // Transaction permissions
            'create_transaction' => 'Can create new transactions',
            'view_transaction' => 'Can view transaction details',
            'apply_discount' => 'Can apply discounts to transactions',
            'void_transaction' => 'Can void transactions',

            // Product permissions
            'create_product' => 'Can create new products',
            'edit_product' => 'Can edit product details',
            'delete_product' => 'Can delete products',
            'view_product' => 'Can view product details',

            // Inventory permissions
            'manage_inventory' => 'Can manage inventory levels',
            'view_inventory' => 'Can view inventory levels',

            // Report permissions
            'view_reports' => 'Can view reports',
            'export_reports' => 'Can export reports',

            // User management permissions
            'manage_users' => 'Can manage user accounts',
            'view_users' => 'Can view user details',

            // Settings permissions
            'manage_settings' => 'Can manage system settings',
        ];

        // Create or update permissions
        foreach ($permissions as $name => $description) {
            Permission::updateOrCreate(
                ['name' => $name],
                ['description' => $description]
            );
        }

        // Define roles with their permissions
        $roles = [
            'cashier' => [
                'description' => 'Basic transaction processing',
                'permissions' => [
                    'create_transaction',
                    'view_transaction',
                    'view_product',
                    'view_inventory'
                ]
            ],
            'manager' => [
                'description' => 'Store management and reporting',
                'permissions' => [
                    'create_transaction',
                    'view_transaction',
                    'apply_discount',
                    'void_transaction',
                    'edit_product',
                    'view_product',
                    'manage_inventory',
                    'view_inventory',
                    'view_reports',
                    'export_reports',
                    'view_users'
                ]
            ],
            'admin' => [
                'description' => 'Full system access',
                'permissions' => array_keys($permissions)
            ]
        ];

        // Create or update roles and assign permissions
        foreach ($roles as $name => $details) {
            $role = Role::updateOrCreate(
                ['name' => $name],
                ['description' => $details['description']]
            );

            // Get all permission models for this role
            $permissionModels = Permission::whereIn('name', $details['permissions'])->get();

            // Sync permissions (this will remove any permissions not in the array)
            $role->permissions()->sync($permissionModels->pluck('id'));
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
