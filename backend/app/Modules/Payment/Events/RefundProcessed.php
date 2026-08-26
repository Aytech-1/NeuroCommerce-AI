<?php

declare(strict_types=1);

namespace App\Modules\Payment\Events;

use App\Modules\Payment\Models\Refund;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class RefundProcessed
 *
 * @package App\Modules\Payment\Events
 */
class RefundProcessed
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly Refund $refund
    ) {
    }
}
