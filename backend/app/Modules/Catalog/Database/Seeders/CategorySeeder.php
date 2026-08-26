<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Seeders;

use App\Modules\Catalog\Models\Category;
use Illuminate\Database\Seeder;

/**
 * Class CategorySeeder
 *
 * @package App\Modules\Catalog\Database\Seeders
 */
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Gadgets, devices, and personal computing.',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                'sort_order' => 1,
                'is_active' => true,
                'children' => [
                    [
                        'name' => 'Smartphones & Tablets',
                        'slug' => 'smartphones-tablets',
                        'description' => 'Mobile phones, tablets, and accessories.',
                        'sort_order' => 1,
                        'is_active' => true,
                    ],
                    [
                        'name' => 'Audio & Headphones',
                        'slug' => 'audio-headphones',
                        'description' => 'Wireless earbuds, noise-canceling headphones, and speakers.',
                        'sort_order' => 2,
                        'is_active' => true,
                    ],
                    [
                        'name' => 'Laptops & Computers',
                        'slug' => 'laptops-computers',
                        'description' => 'Workstations, ultrabooks, and computer peripherals.',
                        'sort_order' => 3,
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'name' => 'Apparel & Fashion',
                'slug' => 'apparel-fashion',
                'description' => 'Clothing, shoes, and luxury apparel.',
                'image_url' => 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
                'sort_order' => 2,
                'is_active' => true,
                'children' => [
                    [
                        'name' => 'Men\'s Clothing',
                        'slug' => 'mens-clothing',
                        'sort_order' => 1,
                        'is_active' => true,
                    ],
                    [
                        'name' => 'Women\'s Clothing',
                        'slug' => 'womens-clothing',
                        'sort_order' => 2,
                        'is_active' => true,
                    ],
                    [
                        'name' => 'Footwear',
                        'slug' => 'footwear',
                        'sort_order' => 3,
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'name' => 'Home & Living',
                'slug' => 'home-living',
                'description' => 'Furniture, decor, and smart home appliances.',
                'image_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $catData) {
            $children = $catData['children'] ?? [];
            unset($catData['children']);

            $category = Category::firstOrCreate(['slug' => $catData['slug']], $catData);

            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                $childData['depth'] = 1;
                Category::firstOrCreate(['slug' => $childData['slug']], $childData);
            }
        }
    }
}
