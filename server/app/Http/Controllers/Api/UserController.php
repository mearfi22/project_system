<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function loadUsers()
    {
        $users = User::with(['gender', 'role'])
            ->where('tbl_users.is_deleted', false)
            ->get();

        return response()->json([
            'users' => $users
        ], 200);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required'],
            'middle_name' => ['nullable'],
            'last_name' => ['required'],
            'suffix_name' => ['nullable'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required'],
            'role' => ['required'],
            'address' => ['required'],
            'contact_number' => ['required'],
            'email' => ['required', 'email', Rule::unique('tbl_users', 'email')],
            'password' => ['required', 'confirmed', 'min:8', 'max:15'],
            'password_confirmation' => ['required', 'min:8', 'max:15'],
        ]);

        $age = date_diff(date_create($validated['birth_date']), date_create('now'))->y;

        User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'age' => $age,
            'birth_date' => $validated['birth_date'],
            'gender_id' => $validated['gender'],
            'role_id' => $validated['role'],
            'address' => $validated['address'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password'])
        ]);

        return response()->json([
            'message' => 'User Successfully Added.'
        ], 200);
    }

    public function updateUser(Request $request, User $user)
    {
        $validationRules = [
            'first_name' => ['required'],
            'middle_name' => ['nullable'],
            'last_name' => ['required'],
            'suffix_name' => ['nullable'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required'],
            'role' => ['required'],
            'address' => ['required'],
            'contact_number' => ['required'],
            'email' => ['required', 'email', Rule::unique('tbl_users', 'email')->ignore($user)],
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $validationRules['password'] = ['required', 'confirmed', 'min:8', 'max:15'];
            $validationRules['password_confirmation'] = ['required', 'min:8', 'max:15'];
        }

        $validated = $request->validate($validationRules);

        $age = date_diff(date_create($validated['birth_date']), date_create('now'))->y;

        $userData = [
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'age' => $age,
            'birth_date' => $validated['birth_date'],
            'gender_id' => $validated['gender'],
            'role_id' => $validated['role'],
            'address' => $validated['address'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'],
        ];

        // Only update password if it's provided
        if ($request->filled('password')) {
            $userData['password'] = bcrypt($validated['password']);
        }

        $user->update($userData);

        return response()->json([
            'message' => 'User Successfully Updated.'
        ], 200);
    }

    public function destroyUser(User $user)
    {
        $user->update([
            'is_deleted' => true
        ]);

        return response()->json([
            'message' => 'User Successfully Deleted.'
        ], 200);
    }
}
