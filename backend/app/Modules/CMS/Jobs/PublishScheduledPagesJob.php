<?php

declare(strict_types=1);

namespace App\Modules\CMS\Jobs;

use App\Modules\CMS\Models\BlogPost;
use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

/**
 * Class PublishScheduledPagesJob
 *
 * @package App\Modules\CMS\Jobs
 */
class PublishScheduledPagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $now = now();

        $pages = Page::where('status', PageStatus::DRAFT->value)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', $now)
            ->get();

        foreach ($pages as $page) {
            $page->update(['status' => PageStatus::PUBLISHED]);
        }

        $posts = BlogPost::where('status', PageStatus::DRAFT->value)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', $now)
            ->get();

        foreach ($posts as $post) {
            $post->update(['status' => PageStatus::PUBLISHED]);
        }

        if ($pages->isNotEmpty() || $posts->isNotEmpty()) {
            Cache::forget('cms:pages:published');
            Cache::forget('cms:homepage');
        }
    }
}
