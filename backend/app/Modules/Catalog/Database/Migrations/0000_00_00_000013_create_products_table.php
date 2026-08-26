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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sku', 100)->unique();
            $table->string('slug', 255)->unique();
            $table->string('name', 300);
            $table->text('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->uuid('category_id')->nullable();
            $table->uuid('brand_id')->nullable();
            $table->decimal('base_price', 15, 4)->default(0.0000);
            $table->decimal('compare_at_price', 15, 4)->nullable();
            $table->decimal('cost_price', 15, 4)->nullable();
            $table->char('currency_code', 3)->default('USD');
            $table->string('tax_class', 50)->default('standard');
            $table->decimal('weight', 10, 4)->nullable();
            $table->enum('weight_unit', ['kg', 'g', 'lb', 'oz'])->default('kg');
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->boolean('is_digital')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->enum('visibility', ['visible', 'hidden', 'search_only', 'catalog_only'])->default('visible');
            $table->decimal('avg_rating', 3, 2)->default(0.00);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('total_sold')->default(0);
            $table->string('meta_title', 200)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status', 'is_active']);
            $table->index('brand_id');
            $table->index('base_price');
            $table->index(['status', 'visibility', 'deleted_at']);
            $table->index(['is_featured', 'is_active']);

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('set null');
            $table->foreign('currency_code')->references('code')->on('currencies')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
