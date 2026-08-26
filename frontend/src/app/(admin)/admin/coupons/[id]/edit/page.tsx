"use client";

import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ChevronRight, Tag, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { couponService } from "@/services/coupon-service";
import { useCoupon } from "@/hooks/use-coupons";
import { ApiError } from "@/types/api";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50),
  name: z.string().min(1, "Campaign name is required").max(255),
  description: z.string().optional().or(z.literal("")),
  type: z.enum(["percentage", "fixed_amount", "free_shipping", "buy_x_get_y"]).default("percentage"),
  value: z.coerce.number().min(0, "Discount value must be positive"),
  min_order_amount: z.coerce.number().optional().or(z.literal("")),
  max_discount_amount: z.coerce.number().optional().or(z.literal("")),
  usage_limit: z.coerce.number().optional().or(z.literal("")),
  usage_limit_per_user: z.coerce.number().optional().or(z.literal("")),
  starts_at: z.string().optional().or(z.literal("")),
  expires_at: z.string().optional().or(z.literal("")),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: coupon, isLoading } = useCoupon(id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 10,
      min_order_amount: "",
      max_discount_amount: "",
      usage_limit: "",
      usage_limit_per_user: 1,
      starts_at: "",
      expires_at: "",
    },
  });

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || "",
        type: coupon.type,
        value: coupon.value,
        min_order_amount: coupon.min_order_amount ?? "",
        max_discount_amount: coupon.max_discount_amount ?? "",
        usage_limit: coupon.usage_limit ?? "",
        usage_limit_per_user: coupon.usage_limit_per_user ?? 1,
        starts_at: coupon.starts_at ? coupon.starts_at.substring(0, 16) : "",
        expires_at: coupon.expires_at ? coupon.expires_at.substring(0, 16) : "",
      });
    }
  }, [coupon, form]);

  const onSubmit = async (values: CouponFormValues) => {
    setErrorMessage(null);
    try {
      const payload: Record<string, unknown> = {
        ...values,
        code: values.code.toUpperCase(),
        min_order_amount: values.min_order_amount !== "" ? Number(values.min_order_amount) : undefined,
        max_discount_amount: values.max_discount_amount !== "" ? Number(values.max_discount_amount) : undefined,
        usage_limit: values.usage_limit !== "" ? Number(values.usage_limit) : undefined,
        usage_limit_per_user: values.usage_limit_per_user !== "" ? Number(values.usage_limit_per_user) : undefined,
      };

      await couponService.updateCoupon(id, payload);
      toast.success("Coupon updated successfully!");
      router.push(`/admin/coupons/${id}`);
    } catch (err: unknown) {
      const error = err as ApiError;
      setErrorMessage(error.message || "Failed to update coupon.");

      if (error.errors) {
        Object.entries(error.errors).forEach(([field, msgs]) => {
          if (field in form.getValues()) {
            form.setError(field as keyof CouponFormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Link href="/admin/coupons" className="hover:text-blue-600 transition-colors">
            Coupons
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold font-mono" aria-current="page">
            Edit {coupon?.code}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              PROMOTION CONFIGURATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              Edit Coupon: {coupon?.code || ""}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Modify campaign parameters, discount rates, and quota rules.
            </p>
          </div>

          <Link href={`/admin/coupons/${id}`}>
            <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Cancel &amp; Back</span>
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="p-4 text-xs font-medium rounded-xl bg-rose-50 border border-rose-200 text-rose-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Coupon Code &amp; Identity</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Coupon Code *</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 font-mono uppercase font-bold text-xs"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Campaign Name *</FormLabel>
                      <FormControl>
                        <Input className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} className="rounded-xl bg-slate-50 border-slate-200 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Discount Economics</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Discount Type *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                          {...field}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed_amount">Fixed Monetary Amount ($)</option>
                          <option value="free_shipping">Free Shipping</option>
                          <option value="buy_x_get_y">Buy X Get Y</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Discount Value *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                          {...field}
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
                  name="min_order_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Minimum Order Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Maximum Discount Cap ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href={`/admin/coupons/${id}`}>
              <Button type="button" variant="outline" className="h-11 px-5 text-xs font-bold rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="h-11 px-6 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
