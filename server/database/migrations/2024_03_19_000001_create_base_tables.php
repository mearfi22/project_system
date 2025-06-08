<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tbl_genders', function (Blueprint $table) {
            $table->id('gender_id');
            $table->string('gender', 55);
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::create('tbl_users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('first_name', 55);
            $table->string('middle_name', 55)->nullable();
            $table->string('last_name', 55);
            $table->string('suffix_name', 55)->nullable();
            $table->integer('age');
            $table->date('birth_date');
            $table->unsignedBigInteger('gender_id');
            $table->string('address', 255);
            $table->string('contact_number', 55);
            $table->string('email', 55)->unique();
            $table->string('password', 255);
            $table->tinyInteger('is_deleted')->default(false);
            $table->timestamps();

            $table->foreign('gender_id')
                ->references('gender_id')
                ->on('tbl_genders')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_users');
        Schema::dropIfExists('tbl_genders');
        Schema::enableForeignKeyConstraints();
    }
};
