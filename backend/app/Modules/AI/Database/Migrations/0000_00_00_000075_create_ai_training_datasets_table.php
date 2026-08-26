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
        Schema::create('ai_training_datasets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('model_version', 50)->index();
            $table->enum('dataset_type', ['training', 'validation', 'test'])->default('training');
            $table->string('file_path', 500);
            $table->unsignedBigInteger('record_count')->default(0);
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->string('checksum', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_training_datasets');
    }
};
