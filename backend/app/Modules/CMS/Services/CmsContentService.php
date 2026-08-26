<?php

declare(strict_types=1);

namespace App\Modules\CMS\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\CMS\Contracts\BannerRepositoryInterface;
use App\Modules\CMS\Contracts\BlogPostRepositoryInterface;
use App\Modules\CMS\Contracts\FaqRepositoryInterface;
use App\Modules\CMS\Contracts\PageRepositoryInterface;
use App\Modules\CMS\Contracts\TestimonialRepositoryInterface;
use App\Modules\CMS\DTOs\ContactMessageDTO;
use App\Modules\CMS\DTOs\CreateBannerDTO;
use App\Modules\CMS\DTOs\CreateFaqDTO;
use App\Modules\CMS\DTOs\CreateTestimonialDTO;
use App\Modules\CMS\DTOs\UpdateBannerDTO;
use App\Modules\CMS\DTOs\UpdateFaqDTO;
use App\Modules\CMS\DTOs\UpdateTestimonialDTO;
use App\Modules\CMS\Events\ContactMessageReceived;
use App\Modules\CMS\Models\Banner;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Models\Testimonial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Class CmsContentService
 *
 * @package App\Modules\CMS\Services
 */
class CmsContentService extends AbstractService
{
    public function __construct(
        protected readonly BannerRepositoryInterface $bannerRepository,
        protected readonly FaqRepositoryInterface $faqRepository,
        protected readonly TestimonialRepositoryInterface $testimonialRepository,
        protected readonly PageRepositoryInterface $pageRepository,
        protected readonly BlogPostRepositoryInterface $blogPostRepository
    ) {
    }

    // ── Public Aggregations ──────────────────────────────────────────────

    public function getHomepageContent(): array
    {
        return Cache::remember('cms:homepage', 1800, function () {
            $banners = $this->bannerRepository->getActiveBanners();
            $faqs = $this->faqRepository->getActiveFaqs();
            $testimonials = $this->testimonialRepository->getActiveTestimonials();
            $featuredPosts = $this->blogPostRepository->getPublishedPosts(['is_featured' => true], 4)->items();

            return [
                'hero_banners' => $banners->where('position', 'hero')->values(),
                'promo_banners' => $banners->where('position', 'promo')->values(),
                'featured_posts' => $featuredPosts,
                'testimonials' => $testimonials->take(6),
                'faqs' => $faqs->take(5),
            ];
        });
    }

    public function getNavigation(): array
    {
        return Cache::remember('cms:navigation', 86400, function () {
            $pages = $this->pageRepository->getPublishedPages(50);

            $menu = [];
            foreach ($pages->items() as $page) {
                $menu[] = [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'url' => "/pages/{$page->slug}",
                    'template' => $page->template,
                ];
            }

            return [
                'header' => $menu,
                'footer' => $menu,
            ];
        });
    }

    public function processContactMessage(ContactMessageDTO $dto): void
    {
        $this->dispatchDomainEvent(new ContactMessageReceived($dto));
    }

    // ── Banners ──────────────────────────────────────────────────────────

    public function getActiveBanners(?string $position = null): Collection
    {
        $cacheKey = 'cms:banners:' . ($position ?? 'all');

        return Cache::remember($cacheKey, 1800, function () use ($position) {
            return $this->bannerRepository->getActiveBanners($position);
        });
    }

    public function paginateBannersAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->bannerRepository->paginateAdmin($filters, $perPage);
    }

    public function getBannerById(string $id): Banner
    {
        /** @var Banner|null $banner */
        $banner = $this->bannerRepository->findById($id);
        if (!$banner) {
            throw new EntityNotFoundException('Banner', $id);
        }

        return $banner;
    }

    public function createBanner(CreateBannerDTO $dto): Banner
    {
        $data = [
            'title' => strip_tags($dto->title),
            'image_url' => $dto->imageUrl,
            'subtitle' => $dto->subtitle !== null ? strip_tags($dto->subtitle) : null,
            'link_url' => $dto->linkUrl,
            'button_text' => $dto->buttonText !== null ? strip_tags($dto->buttonText) : null,
            'position' => $dto->position,
            'sort_order' => $dto->sortOrder,
            'is_active' => $dto->isActive,
            'starts_at' => $dto->startsAt,
            'expires_at' => $dto->expiresAt,
        ];

        /** @var Banner $banner */
        $banner = $this->bannerRepository->create($data);
        $this->clearBannerCache();

        return $banner;
    }

    public function updateBanner(string $id, UpdateBannerDTO $dto): Banner
    {
        $banner = $this->getBannerById($id);

        $data = [];
        if ($dto->title !== null) {
            $data['title'] = strip_tags($dto->title);
        }
        if ($dto->imageUrl !== null) {
            $data['image_url'] = $dto->imageUrl;
        }
        if ($dto->subtitle !== null) {
            $data['subtitle'] = strip_tags($dto->subtitle);
        }
        if ($dto->linkUrl !== null) {
            $data['link_url'] = $dto->linkUrl;
        }
        if ($dto->buttonText !== null) {
            $data['button_text'] = strip_tags($dto->buttonText);
        }
        if ($dto->position !== null) {
            $data['position'] = $dto->position;
        }
        if ($dto->sortOrder !== null) {
            $data['sort_order'] = $dto->sortOrder;
        }
        if ($dto->isActive !== null) {
            $data['is_active'] = $dto->isActive;
        }
        if ($dto->startsAt !== null) {
            $data['starts_at'] = $dto->startsAt;
        }
        if ($dto->expiresAt !== null) {
            $data['expires_at'] = $dto->expiresAt;
        }

        /** @var Banner $updated */
        $updated = $this->bannerRepository->update($banner->id, $data);
        $this->clearBannerCache();

        return $updated;
    }

    public function deleteBanner(string $id): bool
    {
        $banner = $this->getBannerById($id);
        $deleted = $this->bannerRepository->delete($banner->id);
        if ($deleted) {
            $this->clearBannerCache();
        }

        return $deleted;
    }

    public function clearBannerCache(): void
    {
        Cache::forget('cms:banners:all');
        Cache::forget('cms:banners:hero');
        Cache::forget('cms:banners:promo');
        Cache::forget('cms:homepage');
    }

    // ── FAQs ─────────────────────────────────────────────────────────────

    public function getActiveFaqs(?string $category = null): Collection
    {
        $cacheKey = 'cms:faqs:' . ($category ?? 'all');

        return Cache::remember($cacheKey, 86400, function () use ($category) {
            return $this->faqRepository->getActiveFaqs($category);
        });
    }

    public function paginateFaqsAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->faqRepository->paginateAdmin($filters, $perPage);
    }

    public function getFaqById(string $id): Faq
    {
        /** @var Faq|null $faq */
        $faq = $this->faqRepository->findById($id);
        if (!$faq) {
            throw new EntityNotFoundException('Faq', $id);
        }

        return $faq;
    }

    public function createFaq(CreateFaqDTO $dto): Faq
    {
        $data = [
            'question' => strip_tags($dto->question),
            'answer' => strip_tags($dto->answer),
            'category' => $dto->category !== null ? strip_tags($dto->category) : null,
            'sort_order' => $dto->sortOrder,
            'is_active' => $dto->isActive,
        ];

        /** @var Faq $faq */
        $faq = $this->faqRepository->create($data);
        $this->clearFaqCache();

        return $faq;
    }

    public function updateFaq(string $id, UpdateFaqDTO $dto): Faq
    {
        $faq = $this->getFaqById($id);

        $data = [];
        if ($dto->question !== null) {
            $data['question'] = strip_tags($dto->question);
        }
        if ($dto->answer !== null) {
            $data['answer'] = strip_tags($dto->answer);
        }
        if ($dto->category !== null) {
            $data['category'] = strip_tags($dto->category);
        }
        if ($dto->sortOrder !== null) {
            $data['sort_order'] = $dto->sortOrder;
        }
        if ($dto->isActive !== null) {
            $data['is_active'] = $dto->isActive;
        }

        /** @var Faq $updated */
        $updated = $this->faqRepository->update($faq->id, $data);
        $this->clearFaqCache();

        return $updated;
    }

    public function deleteFaq(string $id): bool
    {
        $faq = $this->getFaqById($id);
        $deleted = $this->faqRepository->delete($faq->id);
        if ($deleted) {
            $this->clearFaqCache();
        }

        return $deleted;
    }

    public function clearFaqCache(): void
    {
        Cache::forget('cms:faqs:all');
        Cache::forget('cms:homepage');
    }

    // ── Testimonials ─────────────────────────────────────────────────────

    public function getActiveTestimonials(): Collection
    {
        return Cache::remember('cms:testimonials:all', 86400, function () {
            return $this->testimonialRepository->getActiveTestimonials();
        });
    }

    public function paginateTestimonialsAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->testimonialRepository->paginateAdmin($filters, $perPage);
    }

    public function getTestimonialById(string $id): Testimonial
    {
        /** @var Testimonial|null $testimonial */
        $testimonial = $this->testimonialRepository->findById($id);
        if (!$testimonial) {
            throw new EntityNotFoundException('Testimonial', $id);
        }

        return $testimonial;
    }

    public function createTestimonial(CreateTestimonialDTO $dto): Testimonial
    {
        $data = [
            'customer_name' => strip_tags($dto->customerName),
            'company' => $dto->company !== null ? strip_tags($dto->company) : null,
            'content' => strip_tags($dto->content),
            'rating' => $dto->rating,
            'avatar_url' => $dto->avatarUrl,
            'is_active' => $dto->isActive,
            'sort_order' => $dto->sortOrder,
        ];

        /** @var Testimonial $testimonial */
        $testimonial = $this->testimonialRepository->create($data);
        $this->clearTestimonialCache();

        return $testimonial;
    }

    public function updateTestimonial(string $id, UpdateTestimonialDTO $dto): Testimonial
    {
        $testimonial = $this->getTestimonialById($id);

        $data = [];
        if ($dto->customerName !== null) {
            $data['customer_name'] = strip_tags($dto->customerName);
        }
        if ($dto->company !== null) {
            $data['company'] = strip_tags($dto->company);
        }
        if ($dto->content !== null) {
            $data['content'] = strip_tags($dto->content);
        }
        if ($dto->rating !== null) {
            $data['rating'] = $dto->rating;
        }
        if ($dto->avatarUrl !== null) {
            $data['avatar_url'] = $dto->avatarUrl;
        }
        if ($dto->isActive !== null) {
            $data['is_active'] = $dto->isActive;
        }
        if ($dto->sortOrder !== null) {
            $data['sort_order'] = $dto->sortOrder;
        }

        /** @var Testimonial $updated */
        $updated = $this->testimonialRepository->update($testimonial->id, $data);
        $this->clearTestimonialCache();

        return $updated;
    }

    public function deleteTestimonial(string $id): bool
    {
        $testimonial = $this->getTestimonialById($id);
        $deleted = $this->testimonialRepository->delete($testimonial->id);
        if ($deleted) {
            $this->clearTestimonialCache();
        }

        return $deleted;
    }

    public function clearTestimonialCache(): void
    {
        Cache::forget('cms:testimonials:all');
        Cache::forget('cms:homepage');
    }
}
