"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Hourglass,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Mail,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthBrandPanel, AuthFeatureBullet } from "@/components/auth/auth-brand-panel";
import { apiClient } from "@/lib/api/client";
import { ApiError, ApiResponse } from "@/types/api";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const resetBullets: AuthFeatureBullet[] = [
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Secure Account",
    description: "Choose a strong password to protect your laboratory orders and data.",
  },
  {
    icon: <KeyRound className="h-4 w-4" />,
    title: "Instant Update",
    description: "Your new password will take effect immediately across all sessions.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: "Quick Sign-In",
    description: "Access your saved products and order history immediately after resetting.",
  },
];

const expiredBullets: AuthFeatureBullet[] = [
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Security First",
    description: "We use time-limited links to keep your account secure.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: "Links Expire",
    description: "Reset links expire after 60 minutes for your protection.",
  },
  {
    icon: <Mail className="h-4 w-4" />,
    title: "Easy to Fix",
    description: "Request a new reset link in just a few seconds.",
  },
];

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(!token);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const passwordValue = form.watch("password") || "";

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

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setErrorMessage(null);
    try {
      await apiClient.post<ApiResponse<null>>("/auth/reset-password", {
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 400 || error.message?.toLowerCase().includes("expired") || error.message?.toLowerCase().includes("invalid token")) {
        setIsExpired(true);
      } else {
        setErrorMessage(error.message || "Failed to reset password. Please try again.");
      }
    }
  };

  // State 1: Reset Link Expired View
  if (isExpired) {
    return (
      <AuthLayout
        brandPanel={
          <AuthBrandPanel
            title="Reset Link Expired"
            description="For your security, password reset links expire after a short time. Don't worry, it happens!"
            bullets={expiredBullets}
            illustrationType="expired"
          />
        }
        mobileBackHref="/login"
        mobileBackLabel="Sign In"
      >
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="flex justify-end text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to login</span>
            </Link>
          </div>

          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
              <Hourglass className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                This Link Has Expired
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                The password reset link you used is no longer valid or has expired for security reasons.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
            <span className="font-bold block flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              What you can do
            </span>
            <p className="text-amber-800 leading-relaxed">
              No worries! You can request a new password reset link and we&apos;ll send it to your email address.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/forgot-password"
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
            >
              <Mail className="h-4 w-4" />
              <span>Send New Reset Link</span>
            </Link>

            <Link
              href="/login"
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          <div className="pt-1 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>If you didn&apos;t request a password reset, you can safely ignore this message.</span>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // State 2: Reset Success View
  if (isSuccess) {
    return (
      <AuthLayout
        brandPanel={
          <AuthBrandPanel
            title="Password Updated!"
            description="Your account password has been updated securely."
            bullets={resetBullets}
            illustrationType="sent"
          />
        }
        mobileBackHref="/login"
        mobileBackLabel="Sign In"
      >
        <div className="w-full max-w-md mx-auto space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Password Reset Successfully
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              You can now sign in to your NeuroCommerce account using your new password.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            <span>Sign In to Account</span>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // State 3: Set New Password Form View
  return (
    <AuthLayout
      brandPanel={
        <AuthBrandPanel
          title="Set New Password"
          description="Create a strong, unique password to secure your NeuroCommerce researcher account."
          bullets={resetBullets}
          illustrationType="login"
        />
      }
      mobileBackHref="/login"
      mobileBackLabel="Sign In"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex justify-end text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to login</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Please enter your new password below.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 shadow-2xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new_password" className="text-xs font-bold text-slate-800">New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="new_password"
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

          <div className="space-y-1.5">
            <label htmlFor="confirm_new_password" className="text-xs font-bold text-slate-800">Confirm New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="confirm_new_password"
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

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <KeyRound className="h-4 w-4" />
            <span>{form.formState.isSubmitting ? "Resetting password..." : "Reset Password"}</span>
          </button>
        </form>

        <div className="pt-1 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Secure account protected by 256-bit encryption</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
