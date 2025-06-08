<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenderSeeder extends Seeder
{
    public function run()
    {
        $genders = [
            ['gender' => 'Male', 'is_deleted' => false],
            ['gender' => 'Female', 'is_deleted' => false],
            ['gender' => 'Other', 'is_deleted' => false],
        ];

        foreach ($genders as $gender) {
            DB::table('tbl_genders')->insert([
                'gender' => $gender['gender'],
                'is_deleted' => $gender['is_deleted'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
