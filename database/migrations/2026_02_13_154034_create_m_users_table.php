<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('m_users')) {
            Schema::create('m_users', function (Blueprint $table) {
                $table->increments('user_id');
                $table->string('username', 50)->unique();
                $table->string('password_hash', 255);
                $table->string('nama_lengkap', 100);
                $table->string('email', 100)->unique();
                $table->unsignedInteger('role_id')->nullable();
                $table->rememberToken();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->foreign('role_id')
                    ->references('role_id')
                    ->on('m_roles')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_users');
    }
};
