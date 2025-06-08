<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function loadRoles()
    {
        $roles = Role::all();

        return response()->json([
            'roles' => $roles
        ], 200);
    }
}
