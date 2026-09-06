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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('user_type', 100)->nullable()->after('user_id');
            $table->text('url')->nullable()->after('new_values');

            $table->index(['user_id', 'user_type'], 'idx_audit_user_morph');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_user_morph');
            $table->dropColumn(['user_type', 'url']);
        });
    }
};
