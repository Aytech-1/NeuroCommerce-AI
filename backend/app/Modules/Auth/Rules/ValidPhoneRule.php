<?php

declare(strict_types=1);

namespace App\Modules\Auth\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Class ValidPhoneRule
 *
 * Validates international E.164 phone format (+[1-9][0-9]{1,14}).
 *
 * @package App\Modules\Auth\Rules
 */
class ValidPhoneRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param string $attribute
     * @param mixed $value
     * @param Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString $fail
     * @return void
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if (! is_string($value)) {
            $fail('The :attribute must be a string.');
            return;
        }

        // Standard E.164 regex format
        if (! preg_match('/^\+[1-9]\d{1,14}$/', $value)) {
            $fail('The :attribute must be a valid international phone number in E.164 format (e.g. +14155552671).');
        }
    }
}
