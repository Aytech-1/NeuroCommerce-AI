<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Catalog\Contracts\AttributeRepositoryInterface;
use App\Modules\Catalog\Models\AttributeValue;
use App\Modules\Catalog\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentAttributeRepository
 *
 * @package App\Modules\Catalog\Repositories
 */
class EloquentAttributeRepository extends AbstractRepository implements AttributeRepositoryInterface
{
    public function __construct(ProductAttribute $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function getFilterable(): Collection
    {
        return $this->model->newQuery()
            ->filterable()
            ->with(['values' => function ($q) {
                $q->orderBy('sort_order', 'asc');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function addValue(string $attributeId, array $data): AttributeValue
    {
        $data['attribute_id'] = $attributeId;
        return AttributeValue::create($data);
    }

    /**
     * @inheritDoc
     */
    public function updateValue(string $valueId, array $data): AttributeValue
    {
        $value = AttributeValue::findOrFail($valueId);
        $value->update($data);
        return $value->fresh();
    }

    /**
     * @inheritDoc
     */
    public function deleteValue(string $valueId): bool
    {
        $value = AttributeValue::find($valueId);
        return $value ? (bool) $value->delete() : false;
    }
}
