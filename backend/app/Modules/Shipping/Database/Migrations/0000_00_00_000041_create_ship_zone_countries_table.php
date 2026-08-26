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
        Schema::create('ship_zone_countries', function (Blueprint $table) {
            $table->foreignUuid('zone_id')->constrained('ship_zones')->cascadeOnDelete();
            $table->char('country_code', 2);

            $table->primary(['zone_id', 'country_code']);
            $table->index('country_code', 'idx_ship_zone_country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ship_zone_countries');
    }
};
