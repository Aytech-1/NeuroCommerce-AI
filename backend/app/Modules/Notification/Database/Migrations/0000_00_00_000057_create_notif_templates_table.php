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
        Schema::create('notif_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100)->unique('uq_notif_template_name');
            $table->enum('channel', ['email', 'sms', 'push', 'database'])->default('email');
            $table->string('notification_type', 100);
            $table->string('subject', 255)->nullable();
            $table->text('body_template');
            $table->json('variables')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index(['channel', 'is_active'], 'idx_notif_tpl_channel_active');
            $table->index(['notification_type', 'channel'], 'idx_notif_tpl_type_channel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notif_templates');
    }
};
