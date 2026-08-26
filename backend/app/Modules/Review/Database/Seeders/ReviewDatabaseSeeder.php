<?php

declare(strict_types=1);

namespace App\Modules\Review\Database\Seeders;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Models\Review;
use Illuminate\Database\Seeder;

/**
 * Class ReviewDatabaseSeeder
 *
 * @package App\Modules\Review\Database\Seeders
 */
class ReviewDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::take(5)->get();
        $customers = User::where('user_type', 'customer')->take(5)->get();

        if ($products->isEmpty() || $customers->isEmpty()) {
            return;
        }

        foreach ($products as $index => $product) {
            $customer = $customers->get($index % $customers->count());
            if ($customer) {
                Review::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'user_id' => $customer->id,
                    ],
                    [
                        'rating' => 5,
                        'title' => 'Exceptional Quality and Fast Delivery',
                        'body' => 'I was thoroughly impressed with the product performance and build quality. Highly recommended!',
                        'is_verified_purchase' => true,
                        'is_approved' => true,
                        'is_featured' => true,
                        'helpful_count' => 12,
                    ]
                );
            }
        }
    }
}
