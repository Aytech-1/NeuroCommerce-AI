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
        Schema::create('analytics_customer', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique('uq_analytics_customer_user_id');
            $table->unsignedInteger('total_orders')->default(0);
            $table->decimal('total_spent', 15, 4)->default(0.0000);
            $table->decimal('avg_order_value', 15, 4)->default(0.0000);
            $table->timestamp('first_order_at')->nullable();
            $table->timestamp('last_order_at')->nullable();
            $table->enum('customer_segment', ['new', 'active', 'loyal', 'at_risk', 'churned'])->default('new');
            $table->decimal('lifetime_value', 15, 4)->default(0.0000);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['customer_segment', 'total_spent'], 'idx_analytics_customer_segment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_customer');
    }
};
