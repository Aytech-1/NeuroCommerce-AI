"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User as UserIcon,
  Lock,
  Save,
  ShieldCheck,
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
  Sparkles,
  Calendar,
  Mail,
  Phone,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCustomerProfile, useUpdateCustomerProfile, useChangePassword } from "@/hooks/use-customer";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function CustomerProfilePage() {
  const { user, logout } = useAuthStore();
  const { data: profile, isLoading } = useCustomerProfile();
  const updateProfileMutation = useUpdateCustomerProfile();
  const changePasswordMutation = useChangePassword();

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    } else if (user) {
      profileForm.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      });
    }
  }, [profile, user, profileForm]);

  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
    });
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        passwordForm.reset();
        toast.success("Password changed successfully");
      },
    });
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // client cleanup
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
      logout();
      toast.success("Signed out successfully");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const newPasswordValue = passwordForm.watch("password") || "";
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
      case 3:
        return { score: 3, label: "Good", color: "bg-sky-500", text: "text-sky-600" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
      default:
        return { score: 0, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    }
  };

  const strength = getPasswordStrength(newPasswordValue);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-44 rounded-[20px]" />
        <Skeleton className="h-80 rounded-[20px]" />
        <Skeleton className="h-80 rounded-[20px]" />
      </div>
    );
  }

  const customerName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email
    : "Customer";

  const initials = customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "NC";

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & PAGE HEADER                                             */}
      {/* ======================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/account" className="hover:text-blue-600 transition-colors">
          My Account
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Profile &amp; Security
        </span>
      </nav>

      <div className="border-b border-slate-200/80 pb-5">
        <span className="sr-only">Profile &amp; Credentials</span>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
          ACCOUNT SETTINGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Profile &amp; Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal information, account preferences, and security settings.
        </p>
      </div>

      {/* ======================================================================= */}
      {/* 2. PROFILE IDENTITY HEADER CARD                                         */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-xl border border-blue-100 shadow-2xs">
            {initials}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {customerName}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                {profile?.role || "Customer"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">{profile?.email}</p>
            {profile?.created_at && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>Member since {formatDate(profile.created_at)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("personal-info-card");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-10 px-4 inline-flex items-center justify-center text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("security-card");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-10 px-4 inline-flex items-center justify-center text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. PERSONAL INFORMATION CARD                                            */}
      {/* ======================================================================= */}
      <div
        id="personal-info-card"
        className="rounded-[20px] bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-blue-600" />
            <span>Personal Information</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your account name and laboratory communication details.
          </p>
        </div>

        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={profileForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">First Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Jane"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">Last Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Doe"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={profileForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-800">Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="jane.doe@neuro.lab"
                      className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-600" />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-800">
                    Phone Number (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+1 (555) 019-2834"
                      className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-600" />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>
                  {updateProfileMutation.isPending ? "Saving Changes..." : "Save Profile Changes"}
                </span>
              </button>
            </div>
          </form>
        </Form>
      </div>

      {/* ======================================================================= */}
      {/* 4. SECURITY OVERVIEW & CHANGE PASSWORD CARD                              */}
      {/* ======================================================================= */}
      <div
        id="security-card"
        className="rounded-[20px] bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <span>Security &amp; Password</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ensure your account uses a strong, unique laboratory password and 256-bit token protection.
          </p>
        </div>

        {/* Security Overview Status Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">Password Status</span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Active &amp; Protected</span>
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">Session Security</span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Sanctum Encrypted</span>
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">Verification Status</span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Email Verified</span>
            </span>
          </div>
        </div>

        {/* Password Form */}
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 pt-2">
            <FormField
              control={passwordForm.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-800">
                    Current Password *
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 pr-10 focus:bg-white"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage className="text-xs text-rose-600" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">
                      New Password *
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 pr-10 focus:bg-white"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {newPasswordValue.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Strength:</span>
                          <span className={`font-bold ${strength.text || "text-slate-600"}`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all duration-300 ${
                                strength.score >= step ? strength.color : "bg-slate-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-800">
                      Confirm New Password *
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 pr-10 focus:bg-white"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FormMessage className="text-xs text-rose-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>
                  {changePasswordMutation.isPending
                    ? "Updating Password..."
                    : "Update Account Password"}
                </span>
              </button>
            </div>
          </form>
        </Form>
      </div>

      {/* ======================================================================= */}
      {/* 5. ACCOUNT SECURITY ACTIVITY / HONEST FALLBACK                          */}
      {/* ======================================================================= */}
      <div className="rounded-[20px] bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Recent Security Activity</span>
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of authentication events and security credential changes.
            </p>
          </div>
        </div>

        <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <Clock className="h-6 w-6 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">
            Security activity will appear here when available.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            All account authentication attempts and password update requests are monitored by enterprise telemetry nodes.
          </p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 6. DANGER ZONE & SESSION TERMINATION                                    */}
      {/* ======================================================================= */}
      <div className="rounded-[20px] bg-white border border-rose-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-rose-900">Danger Zone</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your active authenticated sessions and sign-out controls.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">Sign Out of Session</span>
            <p className="text-xs text-slate-500">
              Terminates your current session and clears your local authentication token.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="Sign out of your account?"
        description="You will need to sign in again to access your account dashboard, orders, and saved addresses."
        confirmText="Sign Out"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleSignOut}
      />
    </div>
  );
}
