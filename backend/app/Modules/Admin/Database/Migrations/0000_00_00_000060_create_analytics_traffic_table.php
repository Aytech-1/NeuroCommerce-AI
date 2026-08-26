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
        Schema::create('analytics_traffic', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date');
            $table->unsignedInteger('page_views')->default(0);
            $table->unsignedInteger('unique_visitors')->default(0);
            $table->unsignedInteger('sessions')->default(0);
            $table->unsignedInteger('avg_session_duration')->default(0); // in seconds
            $table->decimal('bounce_rate', 5, 4)->default(0.0000); // 0.0000 - 1.0000
            $table->string('source', 100)->default('direct');
            $table->enum('device_type', ['desktop', 'mobile', 'tablet'])->default('desktop');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['date', 'source', 'device_type'], 'uq_analytics_traffic');
            $table->index(['date', 'source'], 'idx_analytics_traffic_date_source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_traffic');
    }
};
