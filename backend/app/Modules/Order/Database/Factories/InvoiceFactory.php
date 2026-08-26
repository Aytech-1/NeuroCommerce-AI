<?php

declare(strict_types=1);

namespace App\Modules\Order\Database\Factories;

use App\Modules\Order\Enums\InvoiceStatus;
use App\Modules\Order\Models\Invoice;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class InvoiceFactory
 *
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $total = $this->faker->randomFloat(2, 50, 500);

        return [
            'id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'invoice_number' => 'INV-' . date('Y') . '-' . strtoupper(Str::random(6)),
            'status' => InvoiceStatus::PAID,
            'subtotal' => $total,
            'tax_amount' => 0.00,
            'total_amount' => $total,
            'currency_code' => 'USD',
            'issued_at' => now(),
            'paid_at' => now(),
        ];
    }
}
