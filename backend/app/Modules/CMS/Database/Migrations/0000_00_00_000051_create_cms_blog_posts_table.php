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
        Schema::create('cms_blog_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 300);
            $table->string('slug', 255)->unique();
            $table->longText('content')->nullable();
            $table->string('excerpt', 500)->nullable();
            $table->uuid('author_id')->nullable();
            $table->string('category', 100)->nullable();
            $table->json('tags')->nullable();
            $table->string('featured_image', 500)->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('view_count')->default(0);
            $table->string('meta_title', 200)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('author_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->index(['status', 'published_at'], 'idx_cms_blog_status');
            $table->index('category', 'idx_cms_blog_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_blog_posts');
    }
};
