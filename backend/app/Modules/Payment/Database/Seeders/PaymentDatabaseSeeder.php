<?php

declare(strict_types=1);

namespace App\Modules\Payment\Database\Seeders;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\PaymentTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class PaymentDatabaseSeeder
 *
 * @package App\Modules\Payment\Database\Seeders
 */
class PaymentDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $orders = Order::query()->where('status', 'paid')->take(10)->get();

        foreach ($orders as $order) {
            $payment = Payment::query()->updateOrCreate(
                ['order_id' => $order->id],
                [
                    'gateway' => 'stripe',
                    'gateway_payment_id' => 'pi_' . Str::random(24),
                    'method' => 'credit_card',
                    'status' => PaymentStatus::COMPLETED,
                    'amount' => $order->total_amount,
                    'currency_code' => $order->currency_code,
                    'card_last_four' => '4242',
                    'card_brand' => 'visa',
                    'paid_at' => now(),
                ]
            );

            PaymentTransaction::query()->updateOrCreate(
                ['payment_id' => $payment->id],
                [
                    'type' => TransactionType::CAPTURE,
                    'amount' => $payment->amount,
                    'currency_code' => $payment->currency_code,
                    'gateway_transaction_id' => 'txn_' . Str::random(24),
                    'status' => TransactionStatus::SUCCESS,
                    'response_data' => ['status' => 'succeeded'],
                ]
            );
        }
    }
}
