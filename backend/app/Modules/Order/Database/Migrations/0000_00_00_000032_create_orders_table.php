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
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number', 30)->unique();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', [
                'pending',
                'processing',
                'paid',
                'shipped',
                'delivered',
                'cancelled',
                'refunded',
                'on_hold',
            ])->default('pending');
            $table->char('currency_code', 3)->default('USD');
            $table->decimal('subtotal', 15, 4);
            $table->decimal('tax_amount', 15, 4)->default(0.0000);
            $table->decimal('shipping_amount', 15, 4)->default(0.0000);
            $table->decimal('discount_amount', 15, 4)->default(0.0000);
            $table->decimal('total_amount', 15, 4);
            $table->unsignedInteger('item_count')->default(0);
            $table->uuid('coupon_id')->nullable()->index();
            $table->string('coupon_code', 50)->nullable();
            $table->uuid('billing_address_id')->nullable();
            $table->uuid('shipping_address_id')->nullable();
            $table->string('shipping_method', 100)->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('placed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'created_at'], 'idx_orders_user');
            $table->index(['status', 'created_at'], 'idx_orders_status');
            $table->index('placed_at', 'idx_orders_placed');
            $table->index(['payment_method', 'status'], 'idx_orders_payment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
