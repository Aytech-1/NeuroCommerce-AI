<?php

declare(strict_types=1);

namespace App\Modules\Order\Database\Seeders;

use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Enums\InvoiceStatus;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Invoice;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\OrderStatusHistory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class OrderDatabaseSeeder
 *
 * @package App\Modules\Order\Database\Seeders
 */
class OrderDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'customer@neurocommerce.test')->first() ?? User::factory()->create([
            'email' => 'customer@neurocommerce.test',
            'first_name' => 'Demo',
            'last_name' => 'Customer',
        ]);

        $product = Product::where('status', 'active')->first();

        if (! $product) {
            return;
        }

        $billingAddress = Address::firstOrCreate([
            'addressable_type' => User::class,
            'addressable_id' => $user->id,
            'address_type' => 'billing',
        ], [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'address_line_1' => '123 Enterprise Blvd',
            'city' => 'San Francisco',
            'state_province' => 'CA',
            'postal_code' => '94105',
            'country_code' => 'US',
            'phone' => '+15551234567',
        ]);

        $shippingAddress = Address::firstOrCreate([
            'addressable_type' => User::class,
            'addressable_id' => $user->id,
            'address_type' => 'shipping',
        ], [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'address_line_1' => '123 Enterprise Blvd',
            'city' => 'San Francisco',
            'state_province' => 'CA',
            'postal_code' => '94105',
            'country_code' => 'US',
            'phone' => '+15551234567',
        ]);

        $orderNumber = 'NC-' . date('Ymd') . '-DEMO01';
        $subtotal = (float) $product->base_price * 2;
        $total = $subtotal + 10.00;

        $order = Order::firstOrCreate([
            'order_number' => $orderNumber,
        ], [
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'status' => OrderStatus::PAID,
            'currency_code' => 'USD',
            'subtotal' => $subtotal,
            'tax_amount' => 0.00,
            'shipping_amount' => 10.00,
            'discount_amount' => 0.00,
            'total_amount' => $total,
            'item_count' => 2,
            'billing_address_id' => $billingAddress->id,
            'shipping_address_id' => $shippingAddress->id,
            'shipping_method' => 'Standard Delivery',
            'payment_method' => 'stripe',
            'notes' => 'Seeded demo order for testing',
            'placed_at' => now(),
            'paid_at' => now(),
        ]);

        OrderItem::firstOrCreate([
            'order_id' => $order->id,
            'product_id' => $product->id,
        ], [
            'id' => (string) Str::uuid(),
            'product_name' => $product->name,
            'product_sku' => $product->sku,
            'quantity' => 2,
            'unit_price' => (float) $product->base_price,
            'tax_amount' => 0.00,
            'discount_amount' => 0.00,
            'line_total' => $subtotal,
        ]);

        OrderStatusHistory::firstOrCreate([
            'order_id' => $order->id,
            'to_status' => OrderStatus::PAID->value,
        ], [
            'id' => (string) Str::uuid(),
            'from_status' => OrderStatus::PENDING->value,
            'comment' => 'Initial payment capture',
            'changed_by' => null,
            'created_at' => now(),
        ]);

        Invoice::firstOrCreate([
            'order_id' => $order->id,
        ], [
            'id' => (string) Str::uuid(),
            'invoice_number' => 'INV-' . date('Y') . '-DEMO01',
            'status' => InvoiceStatus::PAID,
            'subtotal' => $subtotal,
            'tax_amount' => 0.00,
            'total_amount' => $total,
            'currency_code' => 'USD',
            'issued_at' => now(),
            'paid_at' => now(),
        ]);
    }
}
