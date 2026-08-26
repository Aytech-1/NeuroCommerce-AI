<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\ProductAttribute;
use App\Modules\Catalog\Requests\StoreAttributeRequest;
use App\Modules\Catalog\Requests\StoreAttributeValueRequest;
use App\Modules\Catalog\Requests\UpdateAttributeRequest;
use App\Modules\Catalog\Requests\UpdateAttributeValueRequest;
use App\Modules\Catalog\Resources\AttributeResource;
use App\Modules\Catalog\Resources\AttributeValueResource;
use App\Modules\Catalog\Services\AttributeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class AttributeController
 *
 * Admin Backoffice Attribute Management API Controller
 *
 * @package App\Modules\Catalog\Controllers\Admin
 */
class AttributeController extends Controller
{
    public function __construct(
        protected AttributeService $attributeService
    ) {
    }

    /**
     * List all attributes (with options).
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', ProductAttribute::class);

        $perPage = PaginationHelper::getPerPage($request);
        $paginator = $this->attributeService->getAllAttributes([], $perPage);

        return ResponseHelper::paginated($paginator, AttributeResource::class);
    }

    /**
     * Create an attribute.
     */
    public function store(StoreAttributeRequest $request): JsonResponse
    {
        Gate::authorize('create', ProductAttribute::class);

        $dto = $request->toDTO();
        $attribute = $this->attributeService->createAttribute($dto);

        return ResponseHelper::created(
            new AttributeResource($attribute),
            'Attribute created successfully.'
        );
    }

    /**
     * Update an attribute.
     */
    public function update(UpdateAttributeRequest $request, string $id): JsonResponse
    {
        $attribute = $this->attributeService->getAttributeById($id);
        if (!$attribute) {
            return ResponseHelper::notFound('Attribute not found.');
        }

        Gate::authorize('update', $attribute);

        $dto = $request->toDTO();
        $updated = $this->attributeService->updateAttribute($id, $dto);

        return ResponseHelper::success(
            new AttributeResource($updated),
            'Attribute updated successfully.'
        );
    }

    /**
     * Delete an attribute.
     */
    public function destroy(string $id): JsonResponse
    {
        $attribute = $this->attributeService->getAttributeById($id);
        if (!$attribute) {
            return ResponseHelper::notFound('Attribute not found.');
        }

        Gate::authorize('delete', $attribute);

        $this->attributeService->deleteAttribute($id);

        return ResponseHelper::success(null, 'Attribute deleted successfully.');
    }

    /**
     * Add option value to an attribute.
     */
    public function storeValue(StoreAttributeValueRequest $request, string $id): JsonResponse
    {
        $attribute = $this->attributeService->getAttributeById($id);
        if (!$attribute) {
            return ResponseHelper::notFound('Attribute not found.');
        }

        Gate::authorize('update', $attribute);

        $dto = $request->toDTO();
        $value = $this->attributeService->addAttributeValue($id, $dto);

        return ResponseHelper::created(
            new AttributeValueResource($value),
            'Attribute option value created successfully.'
        );
    }

    /**
     * Update option value.
     */
    public function updateValue(UpdateAttributeValueRequest $request, string $id, string $valueId): JsonResponse
    {
        $attribute = $this->attributeService->getAttributeById($id);
        if (!$attribute) {
            return ResponseHelper::notFound('Attribute not found.');
        }

        Gate::authorize('update', $attribute);

        $dto = $request->toDTO();
        $updated = $this->attributeService->updateAttributeValue($valueId, $dto);

        return ResponseHelper::success(
            new AttributeValueResource($updated),
            'Attribute option value updated successfully.'
        );
    }

    /**
     * Delete option value.
     */
    public function deleteValue(string $id, string $valueId): JsonResponse
    {
        $attribute = $this->attributeService->getAttributeById($id);
        if (!$attribute) {
            return ResponseHelper::notFound('Attribute not found.');
        }

        Gate::authorize('update', $attribute);

        $this->attributeService->deleteAttributeValue($valueId);

        return ResponseHelper::success(null, 'Attribute option value deleted successfully.');
    }
}
