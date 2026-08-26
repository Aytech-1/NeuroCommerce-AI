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
        Schema::create('pay_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->enum('type', [
                'authorization',
                'capture',
                'void',
                'refund',
                'chargeback',
            ]);
            $table->decimal('amount', 15, 4);
            $table->char('currency_code', 3)->default('USD');
            $table->string('gateway_transaction_id', 255)->nullable();
            $table->enum('status', ['success', 'failed', 'pending']);
            $table->json('response_data')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('payment_id', 'idx_pay_trans_payment');
            $table->index('gateway_transaction_id', 'idx_pay_trans_gateway_id');
            $table->index(['type', 'status'], 'idx_pay_trans_type_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_transactions');
    }
};
