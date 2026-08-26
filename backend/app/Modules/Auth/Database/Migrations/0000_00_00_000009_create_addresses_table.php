<?php

declare(strict_types=1);

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
        Schema::create('addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('addressable_type', 100);
            $table->uuid('addressable_id');
            $table->enum('address_type', ['billing', 'shipping', 'warehouse', 'other'])->default('shipping');
            $table->string('label', 100)->nullable();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('company', 200)->nullable();
            $table->string('address_line_1', 255);
            $table->string('address_line_2', 255)->nullable();
            $table->string('city', 100);
            $table->string('state_province', 100)->nullable();
            $table->string('postal_code', 20);
            $table->char('country_code', 2);
            $table->string('phone', 20)->nullable();
            $table->boolean('is_default')->default(false);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['addressable_type', 'addressable_id'], 'idx_addr_poly');
            $table->index('country_code', 'idx_addr_country');
            $table->index(['country_code', 'postal_code'], 'idx_addr_postal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
