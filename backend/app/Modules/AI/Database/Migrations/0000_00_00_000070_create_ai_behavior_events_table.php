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
        Schema::create('ai_behavior_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->index();
            $table->string('session_id', 100)->index();
            $table->enum('event_type', [
                'page_view',
                'product_view',
                'search',
                'add_to_cart',
                'remove_from_cart',
                'add_to_wishlist',
                'purchase',
                'review',
                'click',
                'scroll',
            ])->index();
            $table->uuid('product_id')->nullable()->index();
            $table->uuid('category_id')->nullable()->index();
            $table->string('search_query', 500)->nullable();
            $table->string('page_url', 500)->nullable();
            $table->string('referrer_url', 500)->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedTinyInteger('scroll_depth')->nullable();
            $table->enum('device_type', ['desktop', 'mobile', 'tablet'])->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['user_id', 'event_type', 'created_at'], 'idx_ai_be_user_type');
            $table->index(['product_id', 'event_type', 'created_at'], 'idx_ai_be_product');
            $table->index(['session_id', 'created_at'], 'idx_ai_be_session');
            $table->index(['event_type', 'created_at'], 'idx_ai_be_type_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_behavior_events');
    }
};
