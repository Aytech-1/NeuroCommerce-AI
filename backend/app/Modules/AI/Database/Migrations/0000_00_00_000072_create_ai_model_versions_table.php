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
        Schema::create('ai_model_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version', 50)->unique('uq_ai_model_version');
            $table->string('model_type', 100);
            $table->string('file_path', 500)->nullable();
            $table->string('training_data_range', 100)->nullable();
            $table->unsignedBigInteger('training_records')->default(0);
            $table->json('metrics')->nullable();
            $table->boolean('is_active')->default(false)->index();
            $table->timestamp('trained_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_model_versions');
    }
};
