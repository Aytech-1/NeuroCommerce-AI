"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  Headphones,
  CheckCircle,
  Activity,
  Cpu,
  Radio,
  HeartPulse,
  Watch,
  FlaskConical,
  Glasses,
  Award,
} from "lucide-react";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/70 via-[#F8FAFC] to-white pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100">
      {/* Subtle Background Neural Lattice & Radial Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
        {/* Delicate SVG Neural Constellation */}
        <svg
          className="absolute right-0 top-0 h-full w-1/2 opacity-30 text-blue-300"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 600 600"
          fill="none"
        >
          <circle cx="150" cy="120" r="3" fill="currentColor" />
          <circle cx="280" cy="90" r="4" fill="currentColor" />
          <circle cx="420" cy="160" r="3" fill="currentColor" />
          <circle cx="500" cy="280" r="4" fill="currentColor" />
          <circle cx="340" cy="240" r="3" fill="currentColor" />
          <circle cx="220" cy="300" r="4" fill="currentColor" />
          <circle cx="130" cy="400" r="3" fill="currentColor" />
          <circle cx="380" cy="420" r="4" fill="currentColor" />
          <circle cx="480" cy="480" r="3" fill="currentColor" />
          <line x1="150" y1="120" x2="280" y2="90" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="280" y1="90" x2="420" y2="160" stroke="currentColor" strokeWidth="0.75" />
          <line x1="420" y1="160" x2="340" y2="240" stroke="currentColor" strokeWidth="0.75" />
          <line x1="340" y1="240" x2="500" y2="280" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="340" y1="240" x2="220" y2="300" stroke="currentColor" strokeWidth="0.75" />
          <line x1="220" y1="300" x2="130" y2="400" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="220" y1="300" x2="380" y2="420" stroke="currentColor" strokeWidth="0.75" />
          <line x1="380" y1="420" x2="480" y2="480" stroke="currentColor" strokeWidth="0.75" />
        </svg>
      </div>

      <Container className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ========================================================================= */}
          {/* HERO LEFT — HEADLINE, COPY, CTA & TRUST ROW                               */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 text-left">
            {/* AI-Powered Technology Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 font-bold text-xs tracking-wider mb-6 shadow-xs">
              <Cpu className="h-3.5 w-3.5 text-blue-600" />
              <span>AI-POWERED TECHNOLOGY</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12]">
              Precision Technology for the Next Generation of{" "}
              <span className="text-blue-600 relative inline-block">
                Discovery.
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full opacity-60" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Discover advanced neural hardware, smart devices, and research technology powered by intelligent recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:translate-y-[-1px]"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 font-bold text-base shadow-xs transition-all"
              >
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>AI Recommendations</span>
              </Link>
            </div>

            {/* Hero Trust Row */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Trust Item 1 */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Secure Payments</h4>
                  <p className="text-[11px] text-slate-500 font-medium">100% protected</p>
                </div>
              </div>

              {/* Trust Item 2 */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Verified Products</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Quality assured</p>
                </div>
              </div>

              {/* Trust Item 3 */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Fast Delivery</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Worldwide shipping</p>
                </div>
              </div>

              {/* Trust Item 4 */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Expert Support</h4>
                  <p className="text-[11px] text-slate-500 font-medium">24/7 available</p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* HERO RIGHT — 3D HARDWARE VISUALIZATION & FLOATING CARDS                   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center min-h-[440px] sm:min-h-[500px]">
            {/* Glowing 3D Pedestal Platform */}
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
              {/* Circular Base Ambient Light */}
              <div className="absolute inset-x-8 bottom-6 h-32 bg-blue-500/15 rounded-[100%] blur-2xl transform rotate-[-6deg]" />

              {/* Futuristic Podium Ring */}
              <div className="absolute bottom-10 w-80 h-32 rounded-[100%] border-2 border-cyan-400/40 bg-gradient-to-b from-blue-50/40 to-slate-100/80 shadow-2xl shadow-blue-500/20 transform rotate-[-4deg]" />
              <div className="absolute bottom-14 w-72 h-24 rounded-[100%] border border-blue-300/60 bg-white/60 backdrop-blur-xs transform rotate-[-4deg]" />

              {/* ===================================================================== */}
              {/* Precision Vector Composite Hardware Illustration                     */}
              {/* ===================================================================== */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {/* 1. NeuroTech Precision White EEG Headset (Back Center) */}
                <div className="absolute top-10 sm:top-8 w-56 sm:w-64 h-56 sm:h-64 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                  <div className="relative w-full h-full">
                    {/* Headband Arc */}
                    <div className="absolute inset-x-4 top-2 h-44 rounded-t-full border-[14px] border-slate-800 bg-transparent shadow-xl" />
                    <div className="absolute inset-x-6 top-4 h-40 rounded-t-full border-[10px] border-slate-100 bg-transparent" />
                    
                    {/* Headband Logo Badge */}
                    <div className="absolute top-4 inset-x-0 mx-auto w-24 py-1 text-center bg-slate-900 text-white rounded-md text-[9px] font-bold tracking-wider uppercase shadow-xs">
                      NeuroTech
                    </div>

                    {/* Left Ear Cushion */}
                    <div className="absolute bottom-12 left-2 w-14 h-24 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 shadow-xl flex items-center justify-center transform -rotate-12">
                      <div className="w-8 h-16 rounded-2xl bg-slate-900 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border border-cyan-400 bg-cyan-950 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                        </div>
                      </div>
                    </div>

                    {/* Right Ear Cushion */}
                    <div className="absolute bottom-12 right-2 w-14 h-24 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 shadow-xl flex items-center justify-center transform rotate-12">
                      <div className="w-8 h-16 rounded-2xl bg-slate-900 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border border-cyan-400 bg-cyan-950 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. NeuroCore Telemetry Base (Foreground Center) */}
                <div className="absolute bottom-10 left-10 sm:left-14 z-20 w-48 sm:w-56 h-28 sm:h-32 rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/90 shadow-2xl p-4 flex flex-col justify-between transform -rotate-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                      <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase">
                        NeuroCore
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                      ONLINE
                    </span>
                  </div>

                  {/* Device Status Waveform / LEDs */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-3/4 rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>CH 1-64</span>
                      <span className="text-blue-600 font-bold">1000 Hz</span>
                    </div>
                  </div>

                  {/* Bottom LED Indicator bar & Power Ring */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-xs" />
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    </div>
                    <div className="h-5 w-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                  </div>
                </div>

                {/* 3. Precision Biometric Smartwatch (Right Foreground) */}
                <div className="absolute bottom-8 right-2 sm:right-6 z-20 w-32 sm:w-36 h-40 sm:h-44 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl p-3 flex flex-col justify-between transform rotate-6">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span className="font-bold text-white">EEG</span>
                    <span className="text-cyan-400 font-bold">LIVE</span>
                  </div>

                  {/* Brain Waveform Display */}
                  <div className="my-auto text-center space-y-1">
                    <svg className="w-full h-8 text-cyan-400" viewBox="0 0 100 30" fill="none">
                      <path
                        d="M0 15 Q 15 5, 25 15 T 45 15 T 60 5 T 75 25 T 90 10 T 100 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                    <div className="text-xs font-black text-white">
                      80<span className="text-[10px] text-cyan-400 font-normal ml-0.5">μV</span>
                    </div>
                  </div>

                  <div className="text-[8px] font-semibold text-slate-400 text-center uppercase tracking-wider">
                    Synaptic Sync
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* 3 FLOATING FEATURE CARDS (As shown in reference mockup)               */}
              {/* ===================================================================== */}
              {/* Card 1: AI-Powered (Left) */}
              <div className="absolute top-28 -left-4 sm:-left-8 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-3 sm:p-3.5 max-w-[200px] flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">AI-Powered</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug mt-0.5">
                    Smart recommendations tailored to your needs
                  </p>
                </div>
              </div>

              {/* Card 2: Low Latency (Top Right) */}
              <div className="absolute top-8 -right-4 sm:-right-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-3 sm:p-3.5 max-w-[200px] flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Low Latency</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug mt-0.5">
                    Sub-5ms telemetry for real-time insights
                  </p>
                </div>
              </div>

              {/* Card 3: Clinical Grade (Bottom Right) */}
              <div className="absolute bottom-2 -right-4 sm:-right-8 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-3 sm:p-3.5 max-w-[200px] flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Clinical Grade</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug mt-0.5">
                    Medical-grade accuracy you can trust
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM HERO CATEGORY STRIP                                                */}
        {/* ========================================================================= */}
        <div className="mt-14 pt-2">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {/* Cat 1: Neural Hardware */}
            <Link
              href="/category/neural-headsets"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Radio className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                  Neural Hardware
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium">120+ Products</span>
              </div>
            </Link>

            {/* Cat 2: Medical Products */}
            <Link
              href="/categories"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                  Medical Products
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium">85+ Products</span>
              </div>
            </Link>

            {/* Cat 3: Wearables */}
            <Link
              href="/categories"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Watch className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                  Wearables
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium">65+ Products</span>
              </div>
            </Link>

            {/* Cat 4: Laboratory Equipment */}
            <Link
              href="/categories"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                  Laboratory Equipment
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium">95+ Products</span>
              </div>
            </Link>

            {/* Cat 5: Accessories */}
            <Link
              href="/categories"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Glasses className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                  Accessories
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium">200+ Products</span>
              </div>
            </Link>

            {/* Cat 6: New Arrivals */}
            <Link
              href="/products"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                  New Arrivals
                </h5>
                <span className="text-[10px] text-slate-400 block font-medium">50+ Products</span>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
