<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Seeders;

use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Enums\ProductVisibility;
use App\Modules\Catalog\Enums\WeightUnit;
use App\Modules\Catalog\Models\AttributeValue;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductAttribute;
use App\Modules\Catalog\Models\ProductImage;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Catalog\Models\Tag;
use Illuminate\Database\Seeder;

/**
 * Class ProductSeeder
 *
 * @package App\Modules\Catalog\Database\Seeders
 */
class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $electronics = Category::where('slug', 'audio-headphones')->first() ?? Category::first();
        $smartphones = Category::where('slug', 'smartphones-tablets')->first() ?? Category::first();
        $apparel = Category::where('slug', 'mens-clothing')->first() ?? Category::first();

        $soundmax = Brand::where('slug', 'soundmax-audio')->first() ?? Brand::first();
        $neurotech = Brand::where('slug', 'neurotech-labs')->first() ?? Brand::first();
        $aeroknit = Brand::where('slug', 'aeroknit-apparel')->first() ?? Brand::first();

        // 1. SoundMax Pulse Wireless Headphones
        $p1 = Product::firstOrCreate(
            ['sku' => 'WBH-001'],
            [
                'name' => 'Wireless Bluetooth Headphones',
                'slug' => 'wireless-bluetooth-headphones',
                'short_description' => 'Active noise-canceling high-fidelity wireless over-ear headphones.',
                'description' => '<p>Engineered with 40mm beryllium drivers, 30-hour battery life, and spatial audio.</p>',
                'category_id' => $electronics?->id,
                'brand_id' => $soundmax?->id,
                'base_price' => 79.9900,
                'compare_at_price' => 99.9900,
                'cost_price' => 35.0000,
                'currency_code' => 'USD',
                'tax_class' => 'standard',
                'weight' => 0.2800,
                'weight_unit' => WeightUnit::KG,
                'is_featured' => true,
                'is_active' => true,
                'status' => ProductStatus::ACTIVE,
                'visibility' => ProductVisibility::VISIBLE,
                'avg_rating' => 4.85,
                'review_count' => 124,
                'total_sold' => 450,
                'published_at' => now(),
            ]
        );

        ProductImage::firstOrCreate(
            ['product_id' => $p1->id, 'url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
            ['alt_text' => 'Front view of wireless headphones', 'sort_order' => 1, 'is_primary' => true]
        );

        // Variants for P1 (Color: Midnight Black, Silver Grey)
        $black = AttributeValue::where('slug', 'midnight-black')->first();
        $silver = AttributeValue::where('slug', 'silver-grey')->first();

        if ($black) {
            $v1 = ProductVariant::firstOrCreate(
                ['sku' => 'WBH-001-BLK'],
                [
                    'product_id' => $p1->id,
                    'name' => 'Midnight Black',
                    'price' => 79.9900,
                    'is_active' => true,
                    'sort_order' => 1,
                ]
            );
            $v1->attributeValues()->syncWithoutDetaching([
                $black->id => ['attribute_id' => $black->attribute_id],
            ]);
        }

        if ($silver) {
            $v2 = ProductVariant::firstOrCreate(
                ['sku' => 'WBH-001-SLV'],
                [
                    'product_id' => $p1->id,
                    'name' => 'Silver Grey',
                    'price' => 84.9900,
                    'is_active' => true,
                    'sort_order' => 2,
                ]
            );
            $v2->attributeValues()->syncWithoutDetaching([
                $silver->id => ['attribute_id' => $silver->attribute_id],
            ]);
        }

        // Tags
        $tagBestseller = Tag::firstOrCreate(['slug' => 'bestseller'], ['name' => 'Bestseller']);
        $tagWireless = Tag::firstOrCreate(['slug' => 'wireless'], ['name' => 'Wireless']);
        $p1->tags()->syncWithoutDetaching([$tagBestseller->id, $tagWireless->id]);

        // 2. NeuroPhone Pro X
        $p2 = Product::firstOrCreate(
            ['sku' => 'NPH-001'],
            [
                'name' => 'NeuroPhone Pro X Flagship Smartphone',
                'slug' => 'neurophone-pro-x',
                'short_description' => 'AI-native neuromorphic processor, OLED 120Hz display, titanium chassis.',
                'description' => '<p>The ultimate smartphone engineered for AI neural inference on-device.</p>',
                'category_id' => $smartphones?->id,
                'brand_id' => $neurotech?->id,
                'base_price' => 999.0000,
                'compare_at_price' => 1099.0000,
                'cost_price' => 550.0000,
                'currency_code' => 'USD',
                'is_featured' => true,
                'is_active' => true,
                'status' => ProductStatus::ACTIVE,
                'visibility' => ProductVisibility::VISIBLE,
                'avg_rating' => 4.92,
                'review_count' => 89,
                'total_sold' => 210,
                'published_at' => now(),
            ]
        );

        ProductImage::firstOrCreate(
            ['product_id' => $p2->id, 'url' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
            ['alt_text' => 'NeuroPhone Pro Titanium', 'sort_order' => 1, 'is_primary' => true]
        );

        // 3. AeroKnit Seamless Athletic Tee
        $p3 = Product::firstOrCreate(
            ['sku' => 'AKT-001'],
            [
                'name' => 'AeroKnit Seamless Athletic Tee',
                'slug' => 'aeroknit-seamless-athletic-tee',
                'short_description' => 'Moisture-wicking thermodynamic training shirt.',
                'description' => '<p>Ultra-breathable seamless knit construction.</p>',
                'category_id' => $apparel?->id,
                'brand_id' => $aeroknit?->id,
                'base_price' => 45.0000,
                'compare_at_price' => null,
                'cost_price' => 12.0000,
                'currency_code' => 'USD',
                'is_featured' => false,
                'is_active' => true,
                'status' => ProductStatus::ACTIVE,
                'visibility' => ProductVisibility::VISIBLE,
                'avg_rating' => 4.60,
                'review_count' => 42,
                'total_sold' => 180,
                'published_at' => now(),
            ]
        );

        ProductImage::firstOrCreate(
            ['product_id' => $p3->id, 'url' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
            ['alt_text' => 'AeroKnit Athletic Tee Front', 'sort_order' => 1, 'is_primary' => true]
        );
    }
}
