<?php

declare(strict_types=1);

namespace App\Modules\CMS\Database\Factories;

use App\Modules\CMS\Models\BlogPost;
use App\Shared\Enums\PageStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(5);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => '<p>' . fake()->paragraphs(5, true) . '</p>',
            'excerpt' => fake()->paragraph(),
            'author_id' => null,
            'category' => fake()->randomElement(['Technology', 'Ecommerce', 'Fashion', 'Health']),
            'tags' => ['ai', 'trends', 'shopping'],
            'featured_image' => fake()->imageUrl(800, 600),
            'status' => PageStatus::PUBLISHED,
            'is_featured' => false,
            'view_count' => fake()->numberBetween(0, 500),
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

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }
}
