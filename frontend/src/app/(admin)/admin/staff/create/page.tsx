"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ChevronRight, Shield, UserCheck, Key } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { userService } from "@/services/user-service";
import { useRoles } from "@/hooks/use-users";
import { ApiError } from "@/types/api";

const staffSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().max(20).optional().or(z.literal("")),
  user_type: z.enum(["staff", "admin", "super_admin"]).default("staff"),
  employee_id: z.string().min(1, "Employee ID is required").max(50),
  department: z.string().max(100).optional().or(z.literal("")),
  position: z.string().max(100).optional().or(z.literal("")),
  roles: z.array(z.string()).default([]),
});

type StaffFormValues = z.infer<typeof staffSchema>;

export default function CreateStaffPage() {
  const router = useRouter();
  const rolesQuery = useRoles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      user_type: "staff",
      employee_id: "",
      department: "",
      position: "",
      roles: [],
    },
  });

  const onSubmit = async (values: StaffFormValues) => {
    setErrorMessage(null);
    try {
      const payload: Record<string, unknown> = {
        ...values,
        is_active: true,
      };

      const staff = await userService.createUser(payload);
      toast.success(`Staff member "${staff.full_name}" created successfully!`);
      router.push(`/admin/staff/${staff.id}`);
    } catch (err: unknown) {
      const error = err as ApiError;
      setErrorMessage(error.message || "Failed to onboard staff member.");

      if (error.errors) {
        Object.entries(error.errors).forEach(([field, msgs]) => {
          if (field in form.getValues()) {
            form.setError(field as keyof StaffFormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Link href="/admin/staff" className="hover:text-blue-600 transition-colors">
            Staff
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Add Staff Member
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              STAFF OPERATIONS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Onboard Staff Member
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create an administrative account with operational roles and enterprise credentials.
            </p>
          </div>

          <Link href="/admin/staff">
            <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Staff</span>
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {errorMessage && (
            <div
              role="alert"
              className="p-4 text-xs font-semibold rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 shadow-2xs"
            >
              {errorMessage}
            </div>
          )}

          {/* Identity & Credentials Card */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Identity &amp; Credentials</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Personal details and secure initial password.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">First Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane"
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Last Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Work Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jane.doe@neurocommerce.ai"
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 555 019 2834"
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Initial Password *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        {...field}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                      />
                    </FormControl>
                    <FormDescription className="text-[11px] text-slate-400">
                      Must be at least 8 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Department & Operational Assignment */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Organization &amp; Roles</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Department assignment and security roles.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Employee ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="EMP-2026-08"
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Department</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Fulfillment, Security, Ops..."
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Position / Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Catalog Specialist"
                          {...field}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="user_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Access Level</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                          {...field}
                        >
                          <option value="staff">Staff (Restricted Operational)</option>
                          <option value="admin">Administrator</option>
                          <option value="super_admin">Super Administrator</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/admin/staff">
              <Button type="button" variant="outline" className="h-11 px-5 text-xs font-bold rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="h-11 px-6 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Onboard Staff</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
