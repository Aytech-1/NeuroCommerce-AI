"use client";

import { HeroSection } from "@/components/store/hero-section";
import { FeaturedCategories } from "@/components/store/featured-categories";
import { FeaturedProducts } from "@/components/store/featured-products";
import { TrustSection } from "@/components/store/trust-section";
import { AiRecommendations } from "@/components/store/ai-recommendations";
import { DealsSection } from "@/components/store/deals-section";
import { TrustedBrands } from "@/components/store/trusted-brands";
import { TechnologyInsights } from "@/components/store/technology-insights";
import { ExpertCTA } from "@/components/store/expert-cta";

export default function StorefrontHomePage() {
  return (
    <div className="space-y-0 bg-white">
      {/* 1. Redesigned Premium Technology Light-Mode Hero (STEP 25.1) */}
      <HeroSection />

      {/* 2. Featured Categories / Shop by Category Section (STEP 25.2) */}
      <FeaturedCategories />

      {/* 3. Featured Products / Explore Featured Technology (STEP 25.3) */}
      <FeaturedProducts />

      {/* 4. Trust & Why NeuroCommerce (STEP 25.4) */}
      <TrustSection />

      {/* 5. AI-Powered Recommendations / Personalized Picks (STEP 25.5) */}
      <AiRecommendations />

      {/* 6. Deals & Special Offers (STEP 25.6) */}
      <DealsSection />

      {/* 7. Trusted Brands & Manufacturers (STEP 25.7) */}
      <TrustedBrands />

      {/* 8. Technology Insights & Knowledge (STEP 25.8) */}
      <TechnologyInsights />

      {/* 9. Expert Consultation & Newsletter CTA (STEP 25.9) */}
      <ExpertCTA />
    </div>
  );
}
