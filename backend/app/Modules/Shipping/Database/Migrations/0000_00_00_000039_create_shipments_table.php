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
        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->string('carrier', 50);
            $table->string('service_level', 100)->nullable();
            $table->string('tracking_number', 100)->nullable()->index();
            $table->string('tracking_url', 500)->nullable();
            $table->enum('status', [
                'pending',
                'label_created',
                'picked_up',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed',
                'returned',
            ])->default('pending');
            $table->timestamp('shipped_at')->nullable();
            $table->date('estimated_delivery')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->decimal('weight', 10, 4)->nullable();
            $table->decimal('cost', 15, 4)->nullable();
            $table->string('label_url', 500)->nullable();
            $table->timestamps();

            $table->index('order_id', 'idx_shipments_order');
            $table->index('warehouse_id', 'idx_shipments_warehouse');
            $table->index(['status', 'created_at'], 'idx_shipments_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
