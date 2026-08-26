<?php

declare(strict_types=1);

namespace App\Modules\Payment\Database\Factories;

use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\PaymentTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PaymentTransaction>
 */
class PaymentTransactionFactory extends Factory
{
    protected $model = PaymentTransaction::class;

    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'type' => TransactionType::CAPTURE,
            'amount' => 100.00,
            'currency_code' => 'USD',
            'gateway_transaction_id' => 'txn_' . Str::random(24),
            'status' => TransactionStatus::SUCCESS,
            'response_data' => ['status' => 'succeeded'],
        ];
    }
}
