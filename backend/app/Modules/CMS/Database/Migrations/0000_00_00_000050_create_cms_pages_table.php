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
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 300);
            $table->string('slug', 255)->unique();
            $table->longText('content')->nullable();
            $table->string('excerpt', 500)->nullable();
            $table->string('template', 100)->default('default');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->uuid('author_id')->nullable();
            $table->string('featured_image', 500)->nullable();
            $table->string('meta_title', 200)->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('author_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->index(['status', 'published_at'], 'idx_cms_pages_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_pages');
    }
};
