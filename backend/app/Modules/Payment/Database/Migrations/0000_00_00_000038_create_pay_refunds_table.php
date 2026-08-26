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
        Schema::create('pay_refunds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->decimal('amount', 15, 4);
            $table->string('reason', 500)->nullable();
            $table->enum('status', ['pending', 'approved', 'processed', 'rejected'])->default('pending');
            $table->string('gateway_refund_id', 255)->nullable();
            $table->foreignUuid('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('payment_id', 'idx_pay_refunds_payment');
            $table->index('order_id', 'idx_pay_refunds_order');
            $table->index('gateway_refund_id', 'idx_pay_refunds_gateway_id');
            $table->index('status', 'idx_pay_refunds_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_refunds');
    }
};
