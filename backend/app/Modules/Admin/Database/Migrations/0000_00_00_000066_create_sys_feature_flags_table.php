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
        Schema::create('sys_feature_flags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100)->unique('uq_sys_feature_flag_name');
            $table->boolean('is_enabled')->default(false)->index();
            $table->unsignedTinyInteger('rollout_percentage')->default(0);
            $table->string('description', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sys_feature_flags');
    }
};
