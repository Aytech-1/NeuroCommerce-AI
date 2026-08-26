"use client";

import { ShieldCheck, BadgeCheck, Truck, Headphones } from "lucide-react";
import { Container } from "@/components/ui/container";

interface TrustFeature {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}

const TRUST_FEATURES: TrustFeature[] = [
  {
    id: "secure-payments",
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Your payment information is protected with secure, industry-standard payment processing.",
  },
  {
    id: "verified-products",
    icon: BadgeCheck,
    title: "Verified Products",
    description:
      "Shop confidently with carefully selected products from trusted manufacturers and brands.",
  },
  {
    id: "fast-delivery",
    icon: Truck,
    title: "Fast & Reliable Delivery",
    description:
      "Get your technology delivered safely with dependable shipping and real-time order tracking.",
  },
  {
    id: "expert-support",
    icon: Headphones,
    title: "Expert Support",
    description:
      "Our support team is available to help before, during, and after your purchase.",
  },
];

export function TrustSection() {
  return (
    <section
      aria-labelledby="why-neurocommerce-heading"
      className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/80"
    >
      <Container>
        {/* ======================================================================= */}
        {/* SECTION HEADER                                                          */}
        {/* ======================================================================= */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
            WHY NEUROCOMMERCE
          </span>
          <h2
            id="why-neurocommerce-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
          >
            Technology You Can Trust
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            From verified products to secure checkout and expert support, every part of your NeuroCommerce
            experience is designed around quality, reliability, and confidence.
          </p>
        </div>

        {/* ======================================================================= */}
        {/* 4 PRIMARY TRUST CARDS: 4 cols desktop, 2 cols tablet, 1 col mobile      */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
                className="group flex flex-col justify-between rounded-[20px] border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div>
                  {/* Icon container: 48px x 48px, #EFF6FF, 14px radius */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-blue-600 mb-6 shrink-0 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2.5">
                    {feature.title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
