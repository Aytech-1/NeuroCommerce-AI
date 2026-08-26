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
        Schema::create('analytics_daily_sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date')->unique('uq_analytics_daily_sales_date');
            $table->unsignedInteger('total_orders')->default(0);
            $table->decimal('total_revenue', 15, 4)->default(0.0000);
            $table->decimal('total_tax', 15, 4)->default(0.0000);
            $table->decimal('total_shipping', 15, 4)->default(0.0000);
            $table->decimal('total_discounts', 15, 4)->default(0.0000);
            $table->decimal('net_revenue', 15, 4)->default(0.0000);
            $table->decimal('avg_order_value', 15, 4)->default(0.0000);
            $table->unsignedInteger('total_items_sold')->default(0);
            $table->unsignedInteger('unique_customers')->default(0);
            $table->unsignedInteger('new_customers')->default(0);
            $table->unsignedInteger('returning_customers')->default(0);
            $table->unsignedInteger('refund_count')->default(0);
            $table->decimal('refund_amount', 15, 4)->default(0.0000);
            $table->char('currency_code', 3)->default('USD');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('date', 'idx_daily_sales_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily_sales');
    }
};
