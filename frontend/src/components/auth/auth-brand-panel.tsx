"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Lock, Headphones, Layers, Gift, Clock, Mail, CheckCircle2, ShieldAlert, Cpu, Activity, Laptop } from "lucide-react";

export interface AuthFeatureBullet {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AuthBrandPanelProps {
  title: string;
  description: string;
  bullets: AuthFeatureBullet[];
  illustrationType?: "login" | "register" | "forgot" | "sent" | "expired";
}

export function AuthBrandPanel({
  title,
  description,
  bullets,
  illustrationType = "login",
}: AuthBrandPanelProps) {
  return (
    <div className="flex flex-col justify-between p-8 sm:p-12 bg-white/60 border-r border-slate-200/80 relative overflow-hidden">
      {/* Background Subtle Gradient & Mesh Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-slate-50/60 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white font-extrabold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              Neuro<span className="text-blue-600">Commerce</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
              PRECISION. INNOVATION. TRUST.
            </span>
          </div>
        </Link>

        {/* Heading & Intro */}
        <div className="mt-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Bullets */}
        <div className="mt-8 space-y-5">
          {bullets.map((b, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                {b.icon}
              </div>
              <div className="space-y-0.5 pt-0.5">
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {b.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Neural Tech Visual Motif */}
      <div className="relative z-10 my-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 via-slate-50 to-blue-500/10 border border-blue-100/80 shadow-2xs flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200/80 text-blue-600">
            <Cpu className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                Neural Precision Architecture
              </span>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              High-bandwidth BCI telemetry and synchronized clinical hardware security.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom SSL Reassurance Badge */}
      <div className="relative z-10 pt-2">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/90 text-slate-600">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Lock className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-slate-900 block leading-tight">
              256-bit SSL Encryption
            </span>
            <span className="text-[11px] text-slate-500 block leading-tight">
              Your information is always safe with us.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
