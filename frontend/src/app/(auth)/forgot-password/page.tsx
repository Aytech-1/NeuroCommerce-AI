"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Send,
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthBrandPanel, AuthFeatureBullet } from "@/components/auth/auth-brand-panel";
import { authService } from "@/services/auth-service";
import { ApiError } from "@/types/api";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const forgotBullets: AuthFeatureBullet[] = [
  {
    icon: <Mail className="h-4 w-4" />,
    title: "Secure Reset Link",
    description: "We'll send a time-limited link to your registered email address.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Your Account, Your Control",
    description: "Reset your password and regain access to your account securely.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: "Quick & Easy",
    description: "The link expires in 60 minutes for your security.",
  },
];

const sentBullets: AuthFeatureBullet[] = [
  {
    icon: <Mail className="h-4 w-4" />,
    title: "Check Your Email",
    description: "We've sent a password reset link to your registered email address.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: "Link Expires Soon",
    description: "The reset link will expire in 60 minutes for your security.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Secure & Protected",
    description: "If you didn't request this, you can safely ignore this email.",
  },
];

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    try {
      await authService.forgotPassword(values.email);
      setSubmittedEmail(values.email);
    } catch (err: unknown) {
      const error = err as ApiError;
      setErrorMessage(error.message || "Failed to send reset link. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    try {
      await authService.forgotPassword(submittedEmail);
      toast.success("Password reset link resent successfully!");
    } catch {
      toast.error("Failed to resend reset link. Please try again.");
    }
  };

  if (submittedEmail) {
    return (
      <AuthLayout
        brandPanel={
          <AuthBrandPanel
            title="Reset Link Sent Successfully!"
            description="We've sent a secure password reset link to your email address."
            bullets={sentBullets}
            illustrationType="sent"
          />
        }
        mobileBackHref="/login"
        mobileBackLabel="Sign In"
      >
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Top Link */}
          <div className="flex justify-end text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to login</span>
            </Link>
          </div>

          {/* Header with Green Envelope Icon */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Check Your Email
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-bold text-blue-600 block truncate">{submittedEmail}</span>
              </p>
            </div>
          </div>

          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Email Sent Successfully!</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">
              You&apos;ll receive a secure link to reset your password. Please check your inbox and follow the instructions.
            </p>
          </div>

          {/* Info Box with Resend */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">Didn&apos;t receive the email?</span>
                <p className="text-slate-500">Check your spam or junk folder.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResend}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
            >
              Resend Link
            </button>
          </div>

          {/* Back to Login Button */}
          <Link
            href="/login"
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            <span>Back to Login</span>
          </Link>

          {/* Security Note */}
          <div className="pt-1 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>For your security, this link will expire in 60 minutes.</span>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      brandPanel={
        <AuthBrandPanel
          title="Forgot Password?"
          description="No worries! Enter your email address and we'll send you a secure link to reset your password."
          bullets={forgotBullets}
          illustrationType="forgot"
        />
      }
      mobileBackHref="/login"
      mobileBackLabel="Sign In"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Top Link */}
        <div className="flex justify-end text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to login</span>
          </Link>
        </div>

        {/* Header with Circle Icon */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Mail className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              Enter your email address and we&apos;ll send you a secure link to reset your password.
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
          <div className="space-y-1.5">
            <label htmlFor="forgot_email" className="text-xs font-bold text-slate-800">Email Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="forgot_email"
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

          {/* What Happens Next Info Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>What happens next?</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-5.5">
              We&apos;ll email you a secure password reset link. If you don&apos;t see it, check your spam or junk folder.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />
            <span>{form.formState.isSubmitting ? "Sending link..." : "Send Reset Link"}</span>
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

          {/* Try Another Email Button */}
          <Link
            href="/login"
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Back to Sign In</span>
          </Link>
        </form>

        {/* Security Note */}
        <div className="pt-1 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-slate-400" />
            <span>For your protection, this link will expire in 60 minutes.</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
