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
        Schema::create('ai_feature_store', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('entity_type', ['user', 'product'])->index();
            $table->uuid('entity_id')->index();
            $table->json('feature_vector');
            $table->string('model_version', 50);
            $table->timestamp('computed_at')->useCurrent();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['entity_type', 'entity_id', 'model_version'], 'uq_ai_fs_entity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_feature_store');
    }
};
