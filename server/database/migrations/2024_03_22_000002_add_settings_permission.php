<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Add the new permission
        DB::table('permissions')->insert([
            'name' => 'manage_settings',
            'description' => 'Can manage system settings',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Get the permission ID and admin role ID
        $permissionId = DB::table('permissions')
            ->where('name', 'manage_settings')
            ->value('id');

        $adminRoleId = DB::table('roles')
            ->where('name', 'admin')
            ->value('id');

        // Assign permission to admin role
        if ($permissionId && $adminRoleId) {
            DB::table('permission_role')->insert([
                'role_id' => $adminRoleId,
                'permission_id' => $permissionId
            ]);
        }
    }

    public function down()
    {
        // Get the permission ID
        $permissionId = DB::table('permissions')
            ->where('name', 'manage_settings')
            ->value('id');

        if ($permissionId) {
            // Remove role-permission assignments
            DB::table('permission_role')
                ->where('permission_id', $permissionId)
                ->delete();

            // Remove the permission
            DB::table('permissions')
                ->where('id', $permissionId)
                ->delete();
        }
    }
};
