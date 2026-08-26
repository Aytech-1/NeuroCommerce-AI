<?php

declare(strict_types=1);

namespace App\Modules\Admin\Enums;

/**
 * Enum ReportType
 *
 * @package App\Modules\Admin\Enums
 */
enum ReportType: string
{
    case ORDERS = 'orders';
    case SALES = 'sales';
    case CUSTOMERS = 'customers';
    case TAX = 'tax';
    case INVENTORY = 'inventory';
    case PRODUCTS = 'products';
}
