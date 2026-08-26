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
        Schema::create('ship_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('zone_id')->constrained('ship_zones')->cascadeOnDelete();
            $table->string('carrier', 50);
            $table->string('service_level', 100);
            $table->decimal('min_weight', 10, 4)->default(0.0000);
            $table->decimal('max_weight', 10, 4)->nullable();
            $table->decimal('min_order_amount', 15, 4)->default(0.0000);
            $table->decimal('rate', 15, 4);
            $table->char('currency_code', 3)->default('USD');
            $table->unsignedSmallInteger('estimated_days_min')->default(1);
            $table->unsignedSmallInteger('estimated_days_max')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['zone_id', 'is_active'], 'idx_ship_rates_zone');
            $table->index(['carrier', 'is_active'], 'idx_ship_rates_carrier');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ship_rates');
    }
};
