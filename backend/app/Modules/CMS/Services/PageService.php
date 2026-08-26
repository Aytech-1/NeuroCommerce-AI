<?php

declare(strict_types=1);

namespace App\Modules\CMS\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\CMS\Contracts\PageRepositoryInterface;
use App\Modules\CMS\DTOs\CreatePageDTO;
use App\Modules\CMS\DTOs\UpdatePageDTO;
use App\Modules\CMS\Events\PageCreated;
use App\Modules\CMS\Events\PageDeleted;
use App\Modules\CMS\Events\PagePublished;
use App\Modules\CMS\Events\PageUpdated;
use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Class PageService
 *
 * @package App\Modules\CMS\Services
 */
class PageService extends AbstractService
{
    public function __construct(
        protected readonly PageRepositoryInterface $pageRepository
    ) {
    }

    public function getPublishedBySlug(string $slug): Page
    {
        $cacheKey = "cms:page:{$slug}";

        return Cache::remember($cacheKey, 3600, function () use ($slug) {
            $page = $this->pageRepository->findPublishedBySlug($slug);

            if (!$page) {
                throw new EntityNotFoundException('Page', $slug);
            }

            return $page;
        });
    }

    public function getPublishedPages(int $perPage = 20): LengthAwarePaginator
    {
        return $this->pageRepository->getPublishedPages($perPage);
    }

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->pageRepository->paginateAdmin($filters, $perPage);
    }

    public function getById(string $id): Page
    {
        /** @var Page|null $page */
        $page = $this->pageRepository->findById($id);

        if (!$page) {
            throw new EntityNotFoundException('Page', $id);
        }

        return $page;
    }

    public function createPage(CreatePageDTO $dto): Page
    {
        $slug = $dto->slug ? Str::slug($dto->slug) : Str::slug($dto->title);

        if ($this->pageRepository->existsBySlug($slug)) {
            throw new BusinessRuleException(
                "A page with the slug '{$slug}' already exists.",
                409,
                'SLUG_ALREADY_EXISTS'
            );
        }

        $sanitizedContent = $dto->content !== null ? $this->sanitizeHtml($dto->content) : null;
        $sanitizedMetaTitle = $dto->metaTitle !== null ? strip_tags($dto->metaTitle) : null;
        $sanitizedMetaDesc = $dto->metaDescription !== null ? strip_tags($dto->metaDescription) : null;

        $publishedAt = $dto->publishedAt;
        if ($dto->status === PageStatus::PUBLISHED && $publishedAt === null) {
            $publishedAt = now();
        }

        $data = [
            'title' => strip_tags($dto->title),
            'slug' => $slug,
            'content' => $sanitizedContent,
            'excerpt' => $dto->excerpt !== null ? strip_tags($dto->excerpt) : null,
            'template' => $dto->template,
            'status' => $dto->status->value,
            'author_id' => $dto->authorId,
            'featured_image' => $dto->featuredImage,
            'meta_title' => $sanitizedMetaTitle,
            'meta_description' => $sanitizedMetaDesc,
            'published_at' => $publishedAt,
        ];

        /** @var Page $page */
        $page = $this->pageRepository->create($data);

        $this->clearPageCache($page->slug);
        $this->dispatchDomainEvent(new PageCreated($page));

        if ($page->isPublished()) {
            $this->dispatchDomainEvent(new PagePublished($page));
        }

        return $page;
    }

    public function updatePage(string $id, UpdatePageDTO $dto): Page
    {
        $page = $this->getById($id);
        $oldSlug = $page->slug;

        $data = [];

        if ($dto->title !== null) {
            $data['title'] = strip_tags($dto->title);
        }

        if ($dto->slug !== null) {
            $slug = Str::slug($dto->slug);
            if ($slug !== $page->slug && $this->pageRepository->existsBySlug($slug, $page->id)) {
                throw new BusinessRuleException(
                    "A page with the slug '{$slug}' already exists.",
                    409,
                    'SLUG_ALREADY_EXISTS'
                );
            }
            $data['slug'] = $slug;
        }

        if ($dto->content !== null) {
            $data['content'] = $this->sanitizeHtml($dto->content);
        }

        if ($dto->excerpt !== null) {
            $data['excerpt'] = strip_tags($dto->excerpt);
        }

        if ($dto->template !== null) {
            $data['template'] = $dto->template;
        }

        if ($dto->status !== null) {
            $data['status'] = $dto->status->value;
            if ($dto->status === PageStatus::PUBLISHED && $page->published_at === null) {
                $data['published_at'] = now();
            }
        }

        if ($dto->featuredImage !== null) {
            $data['featured_image'] = $dto->featuredImage;
        }

        if ($dto->metaTitle !== null) {
            $data['meta_title'] = strip_tags($dto->metaTitle);
        }

        if ($dto->metaDescription !== null) {
            $data['meta_description'] = strip_tags($dto->metaDescription);
        }

        if ($dto->publishedAt !== null) {
            $data['published_at'] = $dto->publishedAt;
        }

        /** @var Page $updatedPage */
        $updatedPage = $this->pageRepository->update($page->id, $data);

        $this->clearPageCache($oldSlug);
        if ($updatedPage->slug !== $oldSlug) {
            $this->clearPageCache($updatedPage->slug);
        }

        $this->dispatchDomainEvent(new PageUpdated($updatedPage));

        return $updatedPage;
    }

    public function togglePublish(string $id): Page
    {
        $page = $this->getById($id);

        $newStatus = $page->status === PageStatus::PUBLISHED ? PageStatus::DRAFT : PageStatus::PUBLISHED;
        $publishedAt = $newStatus === PageStatus::PUBLISHED ? ($page->published_at ?? now()) : null;

        /** @var Page $updatedPage */
        $updatedPage = $this->pageRepository->update($page->id, [
            'status' => $newStatus->value,
            'published_at' => $publishedAt,
        ]);

        $this->clearPageCache($updatedPage->slug);

        if ($updatedPage->isPublished()) {
            $this->dispatchDomainEvent(new PagePublished($updatedPage));
        }

        return $updatedPage;
    }

    public function deletePage(string $id): bool
    {
        $page = $this->getById($id);
        $slug = $page->slug;

        $deleted = $this->pageRepository->delete($id);

        if ($deleted) {
            $this->clearPageCache($slug);
            $this->dispatchDomainEvent(new PageDeleted($page));
        }

        return $deleted;
    }

    public function sanitizeHtml(string $html): string
    {
        // Strip dangerous tags: <script>, <iframe>, <object>, <embed>, <applet>, <meta>, <link>, <form>, <style>
        $dangerousTags = '/<\/?(script|iframe|object|embed|applet|meta|link|form|style|base|svg)[^>]*>/i';
        $cleaned = preg_replace($dangerousTags, '', $html);

        // Strip inline event handlers: onclick=, onload=, onerror=, onmouseover=, etc.
        $eventHandlers = '/\s+on[a-z]+\s*=\s*(["\'][^"\']*["\']|[^\s>]+)/i';
        $cleaned = preg_replace($eventHandlers, '', (string) $cleaned);

        // Strip javascript: and data: URIs in href or src
        $javascriptUris = '/(href|src)\s*=\s*["\']\s*(javascript|vbscript|data):[^"\']*["\']/i';
        $cleaned = preg_replace($javascriptUris, '$1="#"', (string) $cleaned);

        return (string) $cleaned;
    }

    public function clearPageCache(string $slug): void
    {
        Cache::forget("cms:page:{$slug}");
        Cache::forget('cms:pages:published');
        Cache::forget('cms:homepage');
    }
}
