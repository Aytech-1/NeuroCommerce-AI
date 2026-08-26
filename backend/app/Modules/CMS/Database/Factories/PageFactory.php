<?php

declare(strict_types=1);

namespace App\Modules\CMS\Database\Factories;

use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => '<p>' . fake()->paragraphs(3, true) . '</p>',
            'excerpt' => fake()->paragraph(),
            'template' => 'default',
            'status' => PageStatus::PUBLISHED,
            'author_id' => null,
            'featured_image' => fake()->imageUrl(800, 600),
            'meta_title' => $title,
            'meta_description' => fake()->sentence(10),
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PageStatus::DRAFT,
            'published_at' => null,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PageStatus::PUBLISHED,
            'published_at' => now(),
        ]);
    }
}
