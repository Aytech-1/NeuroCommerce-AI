<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Catalog\Models\AttributeValue;
use App\Modules\Catalog\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface AttributeRepositoryInterface
 *
 * @package App\Modules\Catalog\Contracts
 */
interface AttributeRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get filterable attributes with their options.
     */
    public function getFilterable(): Collection;

    /**
     * Add option value to an attribute.
     */
    public function addValue(string $attributeId, array $data): AttributeValue;

    /**
     * Update attribute option value.
     */
    public function updateValue(string $valueId, array $data): AttributeValue;

    /**
     * Delete attribute option value.
     */
    public function deleteValue(string $valueId): bool;
}
