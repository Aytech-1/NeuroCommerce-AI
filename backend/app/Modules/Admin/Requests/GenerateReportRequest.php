<?php

declare(strict_types=1);

namespace App\Modules\Admin\Requests;

use App\Modules\Admin\DTOs\GenerateReportDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class GenerateReportRequest
 *
 * @package App\Modules\Admin\Requests
 */
class GenerateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', 'string', 'in:orders,sales,customers,tax,inventory,products'],
            'format' => ['nullable', 'string', 'in:csv,json,pdf'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'filters' => ['nullable', 'array'],
        ];
    }

    public function toDTO(): GenerateReportDTO
    {
        return GenerateReportDTO::fromArray($this->validated(), (string) $this->user()->id);
    }
}
