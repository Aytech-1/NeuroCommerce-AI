<?php

declare(strict_types=1);

namespace App\Modules\AI\Contracts;

/**
 * Interface AIProviderInterface
 *
 * @package App\Modules\AI\Contracts
 */
interface AIProviderInterface
{
    /**
     * Get personalized product predictions for a given user.
     *
     * @param string|null $userId
     * @param array $context
     * @param int $limit
     * @return array Array of items with ['product_id' => string, 'score' => float]
     */
    public function predict(?string $userId, array $context = [], int $limit = 10): array;

    /**
     * Get similar products based on content embeddings.
     *
     * @param string $productId
     * @param int $limit
     * @return array Array of items with ['product_id' => string, 'score' => float]
     */
    public function getSimilar(string $productId, int $limit = 10): array;

    /**
     * Check provider health and active model version.
     *
     * @return array
     */
    public function checkHealth(): array;
}
