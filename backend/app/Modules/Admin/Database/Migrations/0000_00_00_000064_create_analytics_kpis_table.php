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
        Schema::create('analytics_kpis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('metric_name', 100);
            $table->decimal('metric_value', 15, 4)->default(0.0000);
            $table->enum('period_type', ['realtime', 'hourly', 'daily', 'weekly', 'monthly'])->default('daily');
            $table->string('period_value', 20); // '2026-08-20', '2026-W34', '2026-08'
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['metric_name', 'period_type', 'period_value'], 'uq_kpi');
            $table->index(['metric_name', 'period_type'], 'idx_kpi_name_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_kpis');
    }
};
