<?php

declare(strict_types=1);

namespace App\Core\Exceptions;

use Throwable;

/**
 * Class EntityNotFoundException
 *
 * Thrown when a requested entity is not found.
 *
 * @package   App\Core\Exceptions
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class EntityNotFoundException extends DomainException
{
    /**
     * The error code for the exception.
     *
     * @var string
     */
    protected string $errorCode = 'RESOURCE_NOT_FOUND';

    /**
     * The HTTP status code.
     *
     * @var int
     */
    protected int $statusCode = 404;

    /**
     * EntityNotFoundException constructor.
     *
     * @param string $entity The name of the entity
     * @param string|int $id The ID of the entity
     * @param Throwable|null $previous
     */
    public function __construct(string $entity, string|int $id, ?Throwable $previous = null)
    {
        $message = sprintf('%s with ID %s not found.', $entity, $id);
        parent::__construct($message, 404, 'RESOURCE_NOT_FOUND', $previous);
    }
}
