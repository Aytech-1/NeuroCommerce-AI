<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Requests;

use App\Modules\Inventory\DTOs\AdjustStockDTO;
use App\Modules\Inventory\Enums\StockMovementType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class AdjustStockRequest
 *
 * @package App\Modules\Inventory\Requests
 */
class AdjustStockRequest extends FormRequest
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
            'warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'quantity_delta' => ['required', 'integer', 'not_in:0'],
            'movement_type' => ['required', Rule::enum(StockMovementType::class)],
            'notes' => ['nullable', 'string', 'max:500'],
            'reference_type' => ['nullable', 'string', 'max:100'],
            'reference_id' => ['nullable', 'uuid'],
        ];
    }

    public function toDTO(): AdjustStockDTO
    {
        return new AdjustStockDTO(
            product_id: (string) $this->validated('product_id'),
            variant_id: $this->validated('variant_id'),
            warehouse_id: (string) $this->validated('warehouse_id'),
            quantity_delta: (int) $this->validated('quantity_delta'),
            movement_type: StockMovementType::from((string) $this->validated('movement_type')),
            notes: $this->validated('notes'),
            reference_type: $this->validated('reference_type'),
            reference_id: $this->validated('reference_id')
        );
    }
}
