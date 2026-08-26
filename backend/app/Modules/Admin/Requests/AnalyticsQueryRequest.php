<?php

declare(strict_types=1);

namespace App\Modules\Admin\Requests;

use App\Modules\Admin\DTOs\AnalyticsPeriodDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AnalyticsQueryRequest
 *
 * @package App\Modules\Admin\Requests
 */
class AnalyticsQueryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'period' => ['nullable', 'string', 'in:today,yesterday,last_7_days,last_30_days,this_month,last_month,this_year,custom'],
            'date_from' => ['nullable', 'date', 'required_if:period,custom'],
            'date_to' => ['nullable', 'date', 'required_if:period,custom', 'after_or_equal:date_from'],
            'granularity' => ['nullable', 'string', 'in:hourly,daily,weekly,monthly'],
            'segment' => ['nullable', 'string', 'in:new,active,loyal,at_risk,churned'],
            'sort_by' => ['nullable', 'string', 'in:revenue,units'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toDTO(): AnalyticsPeriodDTO
    {
        return AnalyticsPeriodDTO::fromArray($this->validated());
    }
}
