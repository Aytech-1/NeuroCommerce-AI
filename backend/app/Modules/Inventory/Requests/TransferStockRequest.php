<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Requests;

use App\Modules\Inventory\DTOs\TransferStockDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class TransferStockRequest
 *
 * @package App\Modules\Inventory\Requests
 */
class TransferStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'variant_id' => ['nullable', 'uuid', 'exists:product_variants,id'],
            'source_warehouse_id' => ['required', 'uuid', 'exists:warehouses,id', 'different:destination_warehouse_id'],
            'destination_warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function toDTO(): TransferStockDTO
    {
        return new TransferStockDTO(
            product_id: (string) $this->validated('product_id'),
            variant_id: $this->validated('variant_id'),
            source_warehouse_id: (string) $this->validated('source_warehouse_id'),
            destination_warehouse_id: (string) $this->validated('destination_warehouse_id'),
            quantity: (int) $this->validated('quantity'),
            notes: $this->validated('notes')
        );
    }
}
