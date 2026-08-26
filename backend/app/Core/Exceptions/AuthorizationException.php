<?php

declare(strict_types=1);

namespace App\Core\Exceptions;

/**
 * Class AuthorizationException
 *
 * Thrown when an unauthorized action is attempted.
 *
 * @package   App\Core\Exceptions
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class AuthorizationException extends DomainException
{
    /**
     * The error code for the exception.
     *
     * @var string
     */
    protected string $errorCode = 'FORBIDDEN';

    /**
     * The HTTP status code.
     *
     * @var int
     */
    protected int $statusCode = 403;
}
