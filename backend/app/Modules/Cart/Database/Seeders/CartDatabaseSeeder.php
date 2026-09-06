<?php

declare(strict_types=1);

namespace App\Modules\Cart\Database\Seeders;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Cart\Models\Wishlist;
use App\Modules\Cart\Models\WishlistItem;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Seeder;

class CartDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('email', 'customer@neurocommerce.test')->first();
        $products = Product::where('status', 'active')->take(3)->get();

        if ($customer && $products->isNotEmpty()) {
            // Seed customer cart
            $cart = Cart::updateOrCreate(
                ['user_id' => $customer->id],
                ['currency_code' => 'NGN']
            );

            foreach ($products as $product) {
                CartItem::updateOrCreate(
                    [
                        'cart_id' => $cart->id,
                        'product_id' => $product->id,
                        'variant_id' => null,
                    ],
                    [
                        'quantity' => 1,
                        'unit_price' => $product->base_price,
                    ]
                );
            }

            // Seed customer wishlist
            $wishlist = Wishlist::firstOrCreate(
                ['user_id' => $customer->id],
                ['name' => 'My Wishlist', 'is_public' => false]
            );

            if ($product = $products->first()) {
                WishlistItem::firstOrCreate([
                    'wishlist_id' => $wishlist->id,
                    'product_id' => $product->id,
                    'variant_id' => null,
                ]);
            }
        }
    }
}
