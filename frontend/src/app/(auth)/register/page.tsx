"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Layers,
  Gift,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthBrandPanel, AuthFeatureBullet } from "@/components/auth/auth-brand-panel";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/types/api";

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Password confirmation is required"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms of service",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const registerBullets: AuthFeatureBullet[] = [
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade encryption and security.",
  },
  {
    icon: <Layers className="h-4 w-4" />,
    title: "Seamless Experience",
    description: "Manage orders, wishlist, addresses, and preferences in one place.",
  },
  {
    icon: <Gift className="h-4 w-4" />,
    title: "Exclusive Benefits",
    description: "Get early access to new products, special offers, and more.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      terms: true,
    },
  });

  const passwordValue = form.watch("password") || "";

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Too weak", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Too weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      const payload: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
      } = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };

      if (values.phone && values.phone.trim()) {
        payload.phone = values.phone.trim();
      }

      const { user, token } = await authService.register(payload);
      setAuth(token, user);
      toast.success("Account created successfully!");
      router.push("/account");
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.message || "Failed to create account. Please check the entered information.";
      setErrorMessage(msg);

      if (error.errors) {
        Object.entries(error.errors).forEach(([key, messages]) => {
          if (["first_name", "last_name", "email", "password", "password_confirmation"].includes(key)) {
            form.setError(key as keyof RegisterFormValues, { message: messages[0] });
          }
        });
      }
    }
  };

  return (
    <AuthLayout
      brandPanel={
        <AuthBrandPanel
          title="Create Your Account"
          description="Join NeuroCommerce to access premium technology, exclusive offers, and seamless research solutions."
          bullets={registerBullets}
          illustrationType="register"
        />
      }
      mobileBackHref="/login"
      mobileBackLabel="Sign In"
    >
      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* Top Link */}
        <div className="flex justify-end text-xs text-slate-500">
          <span>Already have an account?</span>{" "}
          <Link href="/login" className="ml-1 font-bold text-blue-600 hover:text-blue-700">
            Sign In
          </Link>
        </div>

        {/* Header with Circle Icon */}
        <div className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fill in your details to get started
            </p>
          </div>
        </div>

        {/* Server Error Message */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 shadow-2xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="first_name" className="text-xs font-bold text-slate-800">First Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  {...form.register("first_name")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
              {form.formState.errors.first_name && (
                <p className="text-xs font-semibold text-rose-600">
                  {form.formState.errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="last_name" className="text-xs font-bold text-slate-800">Last Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  {...form.register("last_name")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
              {form.formState.errors.last_name && (
                <p className="text-xs font-semibold text-rose-600">
                  {form.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="register_email" className="text-xs font-bold text-slate-800">Email Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="register_email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...form.register("email")}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs font-semibold text-rose-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-bold text-slate-800">Phone Number (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 019-2834"
                {...form.register("phone")}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="register_password" className="text-xs font-bold text-slate-800">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="register_password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...form.register("password")}
                className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {passwordValue && (
              <div className="space-y-1 pt-1">
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`rounded-full h-full transition-colors ${
                        level <= strength.score ? strength.color : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500 block">
                  Password strength: {strength.label}
                </span>
              </div>
            )}

            {form.formState.errors.password && (
              <p className="text-xs font-semibold text-rose-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="password_confirmation" className="text-xs font-bold text-slate-800">Confirm Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...form.register("password_confirmation")}
                className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password_confirmation && (
              <p className="text-xs font-semibold text-rose-600">
                {form.formState.errors.password_confirmation.message}
              </p>
            )}
          </div>

          {/* Terms Acceptance Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              {...form.register("terms")}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
              I agree to the{" "}
              <Link href="/terms" className="font-bold text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-bold text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          {form.formState.errors.terms && (
            <p className="text-xs font-semibold text-rose-600">
              {form.formState.errors.terms.message}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>{form.formState.isSubmitting ? "Creating account..." : "Create Account"}</span>
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400">OR</span>
            </div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => toast.info("Google registration is available on enterprise domain.")}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Security Reassurance */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-slate-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-600 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
