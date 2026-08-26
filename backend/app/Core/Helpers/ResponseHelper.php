<?php

declare(strict_types=1);

namespace App\Core\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Class ResponseHelper
 *
 * Standard API response envelope matching the REST API Specification.
 *
 * @package App\Core\Helpers
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class ResponseHelper
{
    /**
     * Return a success response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $status
     * @param array|null $meta
     * @param array|null $links
     * @return JsonResponse
     */
    public static function success(
        mixed $data = null,
        string $message = 'Success',
        int $status = 200,
        ?array $meta = null,
        ?array $links = null
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        if ($links !== null) {
            $response['links'] = $links;
        }

        return response()->json($response, $status);
    }

    /**
     * Return a resource created response.
     *
     * @param mixed $data
     * @param string $message
     * @return JsonResponse
     */
    public static function created(mixed $data = null, string $message = 'Created successfully'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    /**
     * Return a no content response.
     *
     * @param string $message
     * @return JsonResponse
     */
    public static function noContent(string $message = 'Deleted successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => null,
        ], 204);
    }

    /**
     * Return an error response.
     *
     * @param string $message
     * @param int $status
     * @param string|null $code
     * @param array|null $errors
     * @return JsonResponse
     */
    public static function error(
        string $message,
        int $status = 400,
        ?string $code = null,
        ?array $errors = null
    ): JsonResponse {
        $response = [
            'success'  => false,
            'message'  => $message,
            'data'     => null,
            'code'     => $code,
            'trace_id' => (string) Str::uuid(),
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    /**
     * Return a validation error response.
     *
     * @param array $errors
     * @param string $message
     * @return JsonResponse
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return self::error($message, 422, 'VALIDATION_ERROR', $errors);
    }

    /**
     * Return a not found response.
     *
     * @param string $message
     * @return JsonResponse
     */
    public static function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return self::error($message, 404, 'NOT_FOUND');
    }

    /**
     * Return an unauthorized response.
     *
     * @param string $message
     * @return JsonResponse
     */
    public static function unauthorized(string $message = 'Unauthenticated'): JsonResponse
    {
        return self::error($message, 401, 'UNAUTHORIZED');
    }

    /**
     * Return a forbidden response.
     *
     * @param string $message
     * @return JsonResponse
     */
    public static function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return self::error($message, 403, 'FORBIDDEN');
    }

    /**
     * Return a paginated response.
     *
     * @param LengthAwarePaginator $paginator
     * @param string $resourceClass
     * @return JsonResponse
     */
    public static function paginated(LengthAwarePaginator $paginator, string $resourceClass): JsonResponse
    {
        $meta = PaginationHelper::buildMeta($paginator);
        $links = PaginationHelper::buildLinks($paginator);

        return self::success(
            $resourceClass::collection($paginator->items()),
            'Success',
            200,
            $meta,
            $links
        );
    }
}
