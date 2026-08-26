<?php

declare(strict_types=1);

namespace App\Core\Exceptions;

use Throwable;

/**
 * Class BusinessRuleException
 *
 * Thrown when a business rule is violated (e.g., insufficient stock).
 *
 * @package   App\Core\Exceptions
 * @author    NeuroCommerce AI
 * @since     1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class BusinessRuleException extends DomainException
{
    /**
     * The error code for the exception.
     *
     * @var string
     */
    protected string $errorCode = 'BUSINESS_RULE_VIOLATION';

    /**
     * The HTTP status code.
     *
     * @var int
     */
    protected int $statusCode = 422;

    /**
     * BusinessRuleException constructor.
     *
     * @param string $message
     * @param int|string|null $codeOrStatus
     * @param string|Throwable|null $errorCodeOrPrevious
     * @param Throwable|null $previous
     */
    public function __construct(
        string $message = "",
        int|string|null $codeOrStatus = 422,
        string|Throwable|null $errorCodeOrPrevious = null,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $codeOrStatus, $errorCodeOrPrevious, $previous);
    }
}
