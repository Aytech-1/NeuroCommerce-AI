<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Seeders;

use App\Modules\Catalog\Enums\AttributeType;
use App\Modules\Catalog\Models\AttributeValue;
use App\Modules\Catalog\Models\ProductAttribute;
use Illuminate\Database\Seeder;

/**
 * Class AttributeSeeder
 *
 * @package App\Modules\Catalog\Database\Seeders
 */
class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            [
                'name' => 'Color',
                'slug' => 'color',
                'type' => AttributeType::COLOR,
                'is_filterable' => true,
                'is_variant' => true,
                'sort_order' => 1,
                'values' => [
                    ['value' => 'Midnight Black', 'slug' => 'midnight-black', 'color_hex' => '#111827', 'sort_order' => 1],
                    ['value' => 'Silver Grey', 'slug' => 'silver-grey', 'color_hex' => '#9CA3AF', 'sort_order' => 2],
                    ['value' => 'Electric Blue', 'slug' => 'electric-blue', 'color_hex' => '#2563EB', 'sort_order' => 3],
                    ['value' => 'Crimson Red', 'slug' => 'crimson-red', 'color_hex' => '#DC2626', 'sort_order' => 4],
                ],
            ],
            [
                'name' => 'Size',
                'slug' => 'size',
                'type' => AttributeType::SELECT,
                'is_filterable' => true,
                'is_variant' => true,
                'sort_order' => 2,
                'values' => [
                    ['value' => 'Small', 'slug' => 's', 'sort_order' => 1],
                    ['value' => 'Medium', 'slug' => 'm', 'sort_order' => 2],
                    ['value' => 'Large', 'slug' => 'l', 'sort_order' => 3],
                    ['value' => 'XL', 'slug' => 'xl', 'sort_order' => 4],
                ],
            ],
            [
                'name' => 'Storage Capacity',
                'slug' => 'storage-capacity',
                'type' => AttributeType::SELECT,
                'is_filterable' => true,
                'is_variant' => true,
                'sort_order' => 3,
                'values' => [
                    ['value' => '128 GB', 'slug' => '128gb', 'sort_order' => 1],
                    ['value' => '256 GB', 'slug' => '256gb', 'sort_order' => 2],
                    ['value' => '512 GB', 'slug' => '512gb', 'sort_order' => 3],
                ],
            ],
        ];

        foreach ($attributes as $attrData) {
            $values = $attrData['values'] ?? [];
            unset($attrData['values']);

            $attribute = ProductAttribute::firstOrCreate(['slug' => $attrData['slug']], $attrData);

            foreach ($values as $valData) {
                $valData['attribute_id'] = $attribute->id;
                AttributeValue::firstOrCreate(
                    ['attribute_id' => $attribute->id, 'slug' => $valData['slug']],
                    $valData
                );
            }
        }
    }
}
