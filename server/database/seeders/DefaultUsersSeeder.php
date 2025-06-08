<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@example.com',
                'password' => 'password',
                'role' => 'admin',
                'age' => 30,
                'birth_date' => '1994-01-01',
                'gender_id' => 1,
                'address' => '123 Admin Street',
                'contact_number' => '1234567890'
            ],
            [
                'first_name' => 'Manager',
                'last_name' => 'User',
                'email' => 'manager@example.com',
                'password' => 'password',
                'role' => 'manager',
                'age' => 28,
                'birth_date' => '1996-01-01',
                'gender_id' => 1,
                'address' => '456 Manager Avenue',
                'contact_number' => '2345678901'
            ],
            [
                'first_name' => 'Cashier',
                'last_name' => 'User',
                'email' => 'cashier@example.com',
                'password' => 'password',
                'role' => 'cashier',
                'age' => 25,
                'birth_date' => '1999-01-01',
                'gender_id' => 2,
                'address' => '789 Cashier Road',
                'contact_number' => '3456789012'
            ]
        ];

        foreach ($users as $userData) {
            $role = Role::where('name', $userData['role'])->first();

            if ($role) {
                User::create([
                    'first_name' => $userData['first_name'],
                    'last_name' => $userData['last_name'],
                    'email' => $userData['email'],
                    'password' => Hash::make($userData['password']),
                    'role_id' => $role->id,
                    'age' => $userData['age'],
                    'birth_date' => $userData['birth_date'],
                    'gender_id' => $userData['gender_id'],
                    'address' => $userData['address'],
                    'contact_number' => $userData['contact_number'],
                    'is_deleted' => false
                ]);
            }
        }
    }
}
