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
        Schema::create('discount_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->enum('rule_type', ['product', 'category', 'brand', 'customer_group', 'minimum_quantity']);
            $table->uuid('rule_entity_id')->nullable();
            $table->string('rule_value', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['coupon_id', 'rule_type'], 'idx_discount_rules_coupon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_rules');
    }
};
