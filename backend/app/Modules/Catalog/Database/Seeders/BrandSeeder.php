<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Seeders;

use App\Modules\Catalog\Models\Brand;
use Illuminate\Database\Seeder;

/**
 * Class BrandSeeder
 *
 * @package App\Modules\Catalog\Database\Seeders
 */
class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            [
                'name' => 'NeuroTech Labs',
                'slug' => 'neurotech-labs',
                'description' => 'Pioneering brain-computer interfaces and neuro-adaptive gear.',
                'logo_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
                'website_url' => 'https://neurotech.example.com',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'SoundMax Audio',
                'slug' => 'soundmax-audio',
                'description' => 'Audiophile high-fidelity headphones and spatial sound equipment.',
                'logo_url' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200',
                'website_url' => 'https://soundmax.example.com',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'AeroKnit Apparel',
                'slug' => 'aeroknit-apparel',
                'description' => 'Performance athletic wear and smart textiles.',
                'logo_url' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
                'website_url' => 'https://aeroknit.example.com',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Lumina Living',
                'slug' => 'lumina-living',
                'description' => 'Modern minimalist home appliances and ambient smart lighting.',
                'logo_url' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200',
                'website_url' => 'https://lumina.example.com',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($brands as $brandData) {
            Brand::firstOrCreate(['slug' => $brandData['slug']], $brandData);
        }
    }
}
