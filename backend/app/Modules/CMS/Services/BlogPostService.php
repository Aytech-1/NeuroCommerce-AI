<?php

declare(strict_types=1);

namespace App\Modules\CMS\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\CMS\Contracts\BlogPostRepositoryInterface;
use App\Modules\CMS\DTOs\CreateBlogPostDTO;
use App\Modules\CMS\DTOs\UpdateBlogPostDTO;
use App\Modules\CMS\Events\BlogPostPublished;
use App\Modules\CMS\Models\BlogPost;
use App\Shared\Enums\PageStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Class BlogPostService
 *
 * @package App\Modules\CMS\Services
 */
class BlogPostService extends AbstractService
{
    public function __construct(
        protected readonly BlogPostRepositoryInterface $blogPostRepository,
        protected readonly PageService $pageService
    ) {
    }

    public function getPublishedBySlug(string $slug): BlogPost
    {
        $cacheKey = "cms:blog:{$slug}";

        $post = Cache::remember($cacheKey, 3600, function () use ($slug) {
            $post = $this->blogPostRepository->findPublishedBySlug($slug);

            if (!$post) {
                throw new EntityNotFoundException('BlogPost', $slug);
            }

            return $post;
        });

        // Increment view count asynchronously or synchronously
        $this->blogPostRepository->incrementViews($post->id);

        return $post;
    }

    public function getPublishedPosts(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->blogPostRepository->getPublishedPosts($filters, $perPage);
    }

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->blogPostRepository->paginateAdmin($filters, $perPage);
    }

    public function getById(string $id): BlogPost
    {
        /** @var BlogPost|null $post */
        $post = $this->blogPostRepository->findById($id);

        if (!$post) {
            throw new EntityNotFoundException('BlogPost', $id);
        }

        return $post;
    }

    public function createPost(CreateBlogPostDTO $dto): BlogPost
    {
        $slug = $dto->slug ? Str::slug($dto->slug) : Str::slug($dto->title);

        if ($this->blogPostRepository->existsBySlug($slug)) {
            throw new BusinessRuleException(
                "A blog post with the slug '{$slug}' already exists.",
                409,
                'SLUG_ALREADY_EXISTS'
            );
        }

        $sanitizedContent = $dto->content !== null ? $this->pageService->sanitizeHtml($dto->content) : null;
        $publishedAt = $dto->publishedAt;
        if ($dto->status === PageStatus::PUBLISHED && $publishedAt === null) {
            $publishedAt = now();
        }

        $data = [
            'title' => strip_tags($dto->title),
            'slug' => $slug,
            'content' => $sanitizedContent,
            'excerpt' => $dto->excerpt !== null ? strip_tags($dto->excerpt) : null,
            'author_id' => $dto->authorId,
            'category' => $dto->category !== null ? strip_tags($dto->category) : null,
            'tags' => $dto->tags,
            'featured_image' => $dto->featuredImage,
            'status' => $dto->status->value,
            'is_featured' => $dto->isFeatured,
            'meta_title' => $dto->metaTitle !== null ? strip_tags($dto->metaTitle) : null,
            'meta_description' => $dto->metaDescription !== null ? strip_tags($dto->metaDescription) : null,
            'published_at' => $publishedAt,
        ];

        /** @var BlogPost $post */
        $post = $this->blogPostRepository->create($data);

        $this->clearBlogCache($post->slug);

        if ($post->isPublished()) {
            $this->dispatchDomainEvent(new BlogPostPublished($post));
        }

        return $post;
    }

    public function updatePost(string $id, UpdateBlogPostDTO $dto): BlogPost
    {
        $post = $this->getById($id);
        $oldSlug = $post->slug;

        $data = [];

        if ($dto->title !== null) {
            $data['title'] = strip_tags($dto->title);
        }

        if ($dto->slug !== null) {
            $slug = Str::slug($dto->slug);
            if ($slug !== $post->slug && $this->blogPostRepository->existsBySlug($slug, $post->id)) {
                throw new BusinessRuleException(
                    "A blog post with the slug '{$slug}' already exists.",
                    409,
                    'SLUG_ALREADY_EXISTS'
                );
            }
            $data['slug'] = $slug;
        }

        if ($dto->content !== null) {
            $data['content'] = $this->pageService->sanitizeHtml($dto->content);
        }

        if ($dto->excerpt !== null) {
            $data['excerpt'] = strip_tags($dto->excerpt);
        }

        if ($dto->category !== null) {
            $data['category'] = strip_tags($dto->category);
        }

        if ($dto->tags !== null) {
            $data['tags'] = $dto->tags;
        }

        if ($dto->featuredImage !== null) {
            $data['featured_image'] = $dto->featuredImage;
        }

        if ($dto->status !== null) {
            $data['status'] = $dto->status->value;
            if ($dto->status === PageStatus::PUBLISHED && $post->published_at === null) {
                $data['published_at'] = now();
            }
        }

        if ($dto->isFeatured !== null) {
            $data['is_featured'] = $dto->isFeatured;
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

        /** @var BlogPost $updatedPost */
        $updatedPost = $this->blogPostRepository->update($post->id, $data);

        $this->clearBlogCache($oldSlug);
        if ($updatedPost->slug !== $oldSlug) {
            $this->clearBlogCache($updatedPost->slug);
        }

        return $updatedPost;
    }

    public function deletePost(string $id): bool
    {
        $post = $this->getById($id);
        $slug = $post->slug;

        $deleted = $this->blogPostRepository->delete($id);

        if ($deleted) {
            $this->clearBlogCache($slug);
        }

        return $deleted;
    }

    public function clearBlogCache(string $slug): void
    {
        Cache::forget("cms:blog:{$slug}");
        Cache::forget('cms:homepage');
    }
}
