<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Catalog\Contracts\AttributeRepositoryInterface;
use App\Modules\Catalog\DTOs\CreateAttributeDTO;
use App\Modules\Catalog\DTOs\CreateAttributeValueDTO;
use App\Modules\Catalog\DTOs\UpdateAttributeDTO;
use App\Modules\Catalog\DTOs\UpdateAttributeValueDTO;
use App\Modules\Catalog\Models\AttributeValue;
use App\Modules\Catalog\Models\ProductAttribute;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/**
 * Class AttributeService
 *
 * @package App\Modules\Catalog\Services
 */
class AttributeService extends AbstractService
{
    public function __construct(
        protected AttributeRepositoryInterface $attributeRepository
    ) {
    }

    /**
     * Get filterable attributes with options.
     */
    public function getFilterableAttributes(): Collection
    {
        return $this->attributeRepository->getFilterable();
    }

    /**
     * Get all attributes paginated for admin.
     */
    public function getAllAttributes(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->attributeRepository->findAll($filters, $perPage);
    }

    /**
     * Get attribute by ID.
     */
    public function getAttributeById(string $id): ?ProductAttribute
    {
        return $this->attributeRepository->findById($id);
    }

    /**
     * Create an attribute.
     */
    public function createAttribute(CreateAttributeDTO $dto): ProductAttribute
    {
        return $this->executeInTransaction(function () use ($dto) {
            $data = $dto->toArray();

            if (empty($data['slug'])) {
                $baseSlug = Str::slug($data['name']);
                $slug = $baseSlug;
                $counter = 1;
                while (ProductAttribute::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
                $data['slug'] = $slug;
            }

            /** @var ProductAttribute $attribute */
            $attribute = $this->attributeRepository->create($data);

            return $attribute;
        });
    }

    /**
     * Update an attribute.
     */
    public function updateAttribute(string $id, UpdateAttributeDTO $dto): ProductAttribute
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $data = array_filter($dto->toArray(), fn ($v) => $v !== null);

            /** @var ProductAttribute $attribute */
            $attribute = $this->attributeRepository->update($id, $data);

            return $attribute;
        });
    }

    /**
     * Delete an attribute.
     */
    public function deleteAttribute(string $id): bool
    {
        return $this->attributeRepository->delete($id);
    }

    /**
     * Add an option value to an attribute.
     */
    public function addAttributeValue(string $attributeId, CreateAttributeValueDTO $dto): AttributeValue
    {
        $data = $dto->toArray();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['value']);
        }

        return $this->attributeRepository->addValue($attributeId, $data);
    }

    /**
     * Update an attribute option value.
     */
    public function updateAttributeValue(string $valueId, UpdateAttributeValueDTO $dto): AttributeValue
    {
        $data = array_filter($dto->toArray(), fn ($v) => $v !== null);
        return $this->attributeRepository->updateValue($valueId, $data);
    }

    /**
     * Delete an attribute option value.
     */
    public function deleteAttributeValue(string $valueId): bool
    {
        return $this->attributeRepository->deleteValue($valueId);
    }
}
