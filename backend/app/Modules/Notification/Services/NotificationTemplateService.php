<?php

declare(strict_types=1);

namespace App\Modules\Notification\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Notification\Contracts\NotificationTemplateRepositoryInterface;
use App\Modules\Notification\DTOs\CreateNotificationTemplateDTO;
use App\Modules\Notification\DTOs\UpdateNotificationTemplateDTO;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class NotificationTemplateService
 *
 * @package App\Modules\Notification\Services
 */
class NotificationTemplateService extends AbstractService
{
    public function __construct(
        protected readonly NotificationTemplateRepositoryInterface $templateRepository
    ) {
    }

    public function paginateTemplates(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->templateRepository->paginateTemplates($filters, $perPage);
    }

    public function getById(string $id): NotificationTemplate
    {
        /** @var NotificationTemplate|null $template */
        $template = $this->templateRepository->findById($id);

        if (!$template) {
            throw new EntityNotFoundException('NotificationTemplate', $id);
        }

        return $template;
    }

    public function getTemplateForNotification(string $type, string $channel): ?NotificationTemplate
    {
        return $this->templateRepository->findByTypeAndChannel($type, $channel);
    }

    public function createTemplate(CreateNotificationTemplateDTO $dto): NotificationTemplate
    {
        if ($this->templateRepository->existsByName($dto->name)) {
            throw new BusinessRuleException(
                "A notification template with name '{$dto->name}' already exists.",
                409,
                'TEMPLATE_ALREADY_EXISTS'
            );
        }

        $data = [
            'name' => strip_tags($dto->name),
            'channel' => $dto->channel instanceof \BackedEnum ? $dto->channel->value : $dto->channel,
            'notification_type' => $dto->notificationType instanceof \BackedEnum ? $dto->notificationType->value : $dto->notificationType,
            'subject' => $dto->subject !== null ? strip_tags($dto->subject) : null,
            'body_template' => $dto->bodyTemplate,
            'variables' => $dto->variables,
            'is_active' => $dto->isActive,
        ];

        /** @var NotificationTemplate */
        return $this->templateRepository->create($data);
    }

    public function updateTemplate(string $id, UpdateNotificationTemplateDTO $dto): NotificationTemplate
    {
        $template = $this->getById($id);

        $data = [];

        if ($dto->name !== null) {
            if ($this->templateRepository->existsByName($dto->name, $id)) {
                throw new BusinessRuleException(
                    "A notification template with name '{$dto->name}' already exists.",
                    409,
                    'TEMPLATE_ALREADY_EXISTS'
                );
            }
            $data['name'] = strip_tags($dto->name);
        }

        if ($dto->channel !== null) {
            $data['channel'] = $dto->channel instanceof \BackedEnum ? $dto->channel->value : $dto->channel;
        }

        if ($dto->notificationType !== null) {
            $data['notification_type'] = $dto->notificationType instanceof \BackedEnum ? $dto->notificationType->value : $dto->notificationType;
        }

        if ($dto->subject !== null) {
            $data['subject'] = strip_tags($dto->subject);
        }

        if ($dto->bodyTemplate !== null) {
            $data['body_template'] = $dto->bodyTemplate;
        }

        if ($dto->variables !== null) {
            $data['variables'] = $dto->variables;
        }

        if ($dto->isActive !== null) {
            $data['is_active'] = $dto->isActive;
        }

        /** @var NotificationTemplate */
        return $this->templateRepository->update($template->id, $data);
    }

    public function deleteTemplate(string $id): bool
    {
        $template = $this->getById($id);
        return $this->templateRepository->delete($template->id);
    }

    /**
     * Safely interpolate template placeholders with variables: {{ variable_name }}
     */
    public function render(string $templateContent, array $variables = []): string
    {
        $rendered = $templateContent;

        foreach ($variables as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $sanitizedValue = htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
                $rendered = str_replace(["{{ {$key} }}", "{{{$key}}}"], $sanitizedValue, $rendered);
            }
        }

        return $rendered;
    }
}
