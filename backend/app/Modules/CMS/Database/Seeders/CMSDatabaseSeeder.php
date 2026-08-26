<?php

declare(strict_types=1);

namespace App\Modules\CMS\Database\Seeders;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Banner;
use App\Modules\CMS\Models\BlogPost;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Models\Page;
use App\Modules\CMS\Models\Testimonial;
use App\Shared\Enums\PageStatus;
use Illuminate\Database\Seeder;

/**
 * Class CMSDatabaseSeeder
 *
 * @package App\Modules\CMS\Database\Seeders
 */
class CMSDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@neurocommerce.test')->first();
        $adminId = $admin?->id;

        // Seed Core Static Pages
        $pages = [
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'content' => '<h2>About NeuroCommerce AI</h2><p>NeuroCommerce AI is the world-class enterprise AI-driven e-commerce platform.</p>',
                'excerpt' => 'Learn more about NeuroCommerce AI mission and team.',
                'template' => 'about',
                'status' => PageStatus::PUBLISHED,
                'author_id' => $adminId,
                'meta_title' => 'About Us - NeuroCommerce AI',
                'meta_description' => 'Discover how NeuroCommerce AI delivers next-generation commerce.',
                'published_at' => now(),
            ],
            [
                'title' => 'Terms of Service',
                'slug' => 'terms-of-service',
                'content' => '<h2>Terms & Conditions</h2><p>Welcome to NeuroCommerce AI. By accessing this platform, you agree to our terms.</p>',
                'excerpt' => 'Platform terms and conditions of usage.',
                'template' => 'legal',
                'status' => PageStatus::PUBLISHED,
                'author_id' => $adminId,
                'meta_title' => 'Terms of Service - NeuroCommerce AI',
                'meta_description' => 'Read the terms of service governing usage of NeuroCommerce AI.',
                'published_at' => now(),
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => '<h2>Privacy Policy</h2><p>Your privacy is important to us. Learn how we handle your data.</p>',
                'excerpt' => 'Privacy policy detailing GDPR compliance and data protection.',
                'template' => 'legal',
                'status' => PageStatus::PUBLISHED,
                'author_id' => $adminId,
                'meta_title' => 'Privacy Policy - NeuroCommerce AI',
                'meta_description' => 'GDPR compliant privacy policy for NeuroCommerce AI customers.',
                'published_at' => now(),
            ],
        ];

        foreach ($pages as $pageData) {
            Page::firstOrCreate(
                ['slug' => $pageData['slug']],
                $pageData
            );
        }

        // Seed Hero & Promo Banners
        Banner::firstOrCreate(
            ['title' => 'Experience the Future of Shopping with AI'],
            [
                'subtitle' => 'Hyper-personalized product recommendations powered by neural networks.',
                'image_url' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
                'link_url' => '/products',
                'button_text' => 'Shop Collections',
                'position' => 'hero',
                'sort_order' => 1,
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addYear(),
            ]
        );

        Banner::firstOrCreate(
            ['title' => 'Summer Electronics Mega Sale'],
            [
                'subtitle' => 'Get up to 40% discount on flagship noise-cancelling headphones.',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                'link_url' => '/categories/electronics',
                'button_text' => 'Explore Deals',
                'position' => 'promo',
                'sort_order' => 1,
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(6),
            ]
        );

        // Seed FAQs
        $faqs = [
            [
                'question' => 'How does AI recommendation work on NeuroCommerce?',
                'answer' => 'Our PyTorch recommendation engine analyzes your real-time browsing behavior, shopping cart patterns, and purchase history to provide contextual suggestions.',
                'category' => 'AI Features',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'question' => 'What is the standard shipping delivery timeframe?',
                'answer' => 'Domestic standard shipping typically takes 2-4 business days, while express courier options provide next-day delivery.',
                'category' => 'Shipping',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'question' => 'How can I return an item?',
                'answer' => 'You can request a return within 30 days of receiving your order through your customer dashboard.',
                'category' => 'Returns',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($faqs as $faqData) {
            Faq::firstOrCreate(
                ['question' => $faqData['question']],
                $faqData
            );
        }

        // Seed Testimonials
        $testimonials = [
            [
                'customer_name' => 'Sarah Jenkins',
                'company' => 'TechPulse Media',
                'content' => 'The AI recommendations were uncannily accurate! Found the exact audio gear I was looking for in seconds.',
                'rating' => 5,
                'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'customer_name' => 'Marcus Vance',
                'company' => 'Apex Design Studio',
                'content' => 'Ultra-fast checkout and seamless order tracking. The shopping experience is truly next-gen.',
                'rating' => 5,
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($testimonials as $testimonialData) {
            Testimonial::firstOrCreate(
                ['customer_name' => $testimonialData['customer_name']],
                $testimonialData
            );
        }

        // Seed Sample Blog Post
        BlogPost::firstOrCreate(
            ['slug' => 'the-evolution-of-ai-driven-ecommerce'],
            [
                'title' => 'The Evolution of AI-Driven E-Commerce',
                'content' => '<p>Artificial intelligence is redefining modern retail through real-time telemetry and deep learning recommendation systems.</p>',
                'excerpt' => 'How machine learning microservices enhance conversion rates and customer satisfaction.',
                'author_id' => $adminId,
                'category' => 'Technology',
                'tags' => ['ai', 'retail', 'machine-learning'],
                'featured_image' => 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
                'status' => PageStatus::PUBLISHED,
                'is_featured' => true,
                'view_count' => 142,
                'meta_title' => 'The Evolution of AI-Driven E-Commerce - NeuroCommerce AI',
                'meta_description' => 'Explore the cutting edge of AI personalization in online retail.',
                'published_at' => now(),
            ]
        );
    }
}
