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
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->enum('strategy', [
                'personalized',
                'content_based',
                'trending',
                'cross_sell',
                'recently_viewed',
            ])->index();
            $table->uuid('product_id')->index();
            $table->decimal('score', 8, 6);
            $table->unsignedSmallInteger('rank');
            $table->string('model_version', 50)->default('v1.0');
            $table->json('context')->nullable();
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'strategy', 'expires_at'], 'idx_ai_rec_user');
            $table->index(['product_id'], 'idx_ai_rec_product');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
    }
};
