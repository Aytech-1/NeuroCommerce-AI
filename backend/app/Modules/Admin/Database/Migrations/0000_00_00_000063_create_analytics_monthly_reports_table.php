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
        Schema::create('analytics_monthly_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('year_month', 7)->unique('uq_analytics_mr_year_month'); // '2026-07'
            $table->decimal('total_revenue', 15, 4)->default(0.0000);
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('total_new_customers')->default(0);
            $table->unsignedInteger('total_returning_customers')->default(0);
            $table->decimal('avg_order_value', 15, 4)->default(0.0000);
            $table->json('top_products')->nullable();
            $table->json('top_categories')->nullable();
            $table->decimal('conversion_rate', 5, 4)->default(0.0000);
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('year_month', 'idx_mr_year_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_monthly_reports');
    }
};
