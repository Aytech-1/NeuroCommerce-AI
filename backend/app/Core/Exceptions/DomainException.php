<?php

declare(strict_types=1);

namespace App\Core\Exceptions;

use RuntimeException;
use Throwable;

/**
 * Class DomainException
 *
 * Base exception for all domain-level errors.
 *
 * @package   App\Core\Exceptions
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class DomainException extends RuntimeException
{
    /**
     * The error code for the exception.
     *
     * @var string
     */
    protected string $errorCode = 'DOMAIN_EXCEPTION';

    /**
     * The HTTP status code.
     *
     * @var int
     */
    protected int $statusCode = 500;

    /**
     * DomainException constructor.
     *
     * @param string $message
     * @param int|string|null $codeOrStatus
     * @param string|Throwable|null $errorCodeOrPrevious
     * @param Throwable|null $previous
     */
    public function __construct(
        string $message = "",
        int|string|null $codeOrStatus = null,
        string|Throwable|null $errorCodeOrPrevious = null,
        ?Throwable $previous = null
    ) {
        if (is_int($codeOrStatus)) {
            $this->statusCode = $codeOrStatus;
        } elseif (is_string($codeOrStatus)) {
            $this->errorCode = $codeOrStatus;
        }

        if (is_string($errorCodeOrPrevious)) {
            $this->errorCode = $errorCodeOrPrevious;
        } elseif ($errorCodeOrPrevious instanceof Throwable) {
            $previous = $errorCodeOrPrevious;
        }

        parent::__construct($message, 0, $previous);
    }

    /**
     * Get the error code.
     *
     * @return string
     */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Get the HTTP status code.
     *
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * Convert the exception to an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'message' => $this->getMessage(),
            'code'    => $this->getErrorCode(),
            'status'  => $this->getStatusCode(),
        ];
    }
}
