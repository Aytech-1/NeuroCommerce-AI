"use client";

import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ChevronRight, Package, Tag, DollarSign, Eye } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
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
import { catalogService } from "@/services/catalog-service";
import { useProduct, useCategories, useBrands } from "@/hooks/use-catalog";
import { ApiError } from "@/types/api";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(300),
  sku: z.string().min(1, "SKU is required").max(100),
  slug: z.string().max(255).optional().or(z.literal("")),
  short_description: z.string().max(500).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  category_id: z.string().optional().or(z.literal("")),
  brand_id: z.string().optional().or(z.literal("")),
  base_price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  compare_at_price: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  is_featured: z.boolean().default(false),
  meta_title: z.string().max(200).optional().or(z.literal("")),
  meta_description: z.string().max(500).optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: product, isLoading: isProductLoading } = useProduct(id);
  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      slug: "",
      short_description: "",
      description: "",
      category_id: "",
      brand_id: "",
      base_price: 0,
      compare_at_price: 0,
      status: "active",
      is_featured: false,
      meta_title: "",
      meta_description: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        slug: product.slug || "",
        short_description: product.short_description || "",
        description: product.description || "",
        category_id: product.category?.id || "",
        brand_id: product.brand?.id || "",
        base_price: product.base_price,
        compare_at_price: product.compare_at_price ?? 0,
        status: product.status || "active",
        is_featured: product.is_featured || false,
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });
    }
  }, [product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    setErrorMessage(null);
    try {
      const payload: Record<string, unknown> = {
        ...values,
        category_id: values.category_id || null,
        brand_id: values.brand_id || null,
      };

      await catalogService.updateProduct(id, payload);
      toast.success("Product updated successfully!");
      router.push(`/admin/products/${id}`);
    } catch (err: unknown) {
      const error = err as ApiError;
      setErrorMessage(error.message || "Failed to update product.");

      if (error.errors) {
        Object.entries(error.errors).forEach(([field, msgs]) => {
          if (field in form.getValues()) {
            form.setError(field as keyof ProductFormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

  if (isProductLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-[20px]" />
      </div>
    );
  }

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
          <Link href="/admin/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Edit Product
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              CATALOG MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Edit: {product?.name || "Product"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Update product details, pricing, and classification.
            </p>
          </div>

          <Link href={`/admin/products/${id}`}>
            <Button variant="outline" size="sm" className="h-10 px-4 gap-2 text-xs font-bold shadow-2xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Cancel &amp; View</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. EDIT PRODUCT FORM                                                    */}
      {/* ======================================================================= */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {errorMessage && (
            <div
              role="alert"
              className="p-4 text-xs font-bold rounded-2xl bg-rose-50 border border-rose-200 text-rose-700"
            >
              {errorMessage}
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">General Information</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Essential product identity and descriptive details.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Product Name *</FormLabel>
                    <FormControl>
                      <Input className="h-11 rounded-xl bg-slate-50 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">SKU *</FormLabel>
                    <FormControl>
                      <Input className="h-11 rounded-xl bg-slate-50 text-xs font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">Short Summary</FormLabel>
                  <FormControl>
                    <Textarea className="rounded-xl bg-slate-50 text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700">Full Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} className="rounded-xl bg-slate-50 text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 2: Classification & Pricing */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <h2 className="text-base font-extrabold text-slate-900">Classification</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Category hierarchy and manufacturer brand.</p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Category</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                          {...field}
                        >
                          <option value="">Select Category</option>
                          {categoriesQuery.data?.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Brand / Manufacturer</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                          {...field}
                        >
                          <option value="">Select Brand</option>
                          {brandsQuery.data?.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <h2 className="text-base font-extrabold text-slate-900">Pricing</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Base currency pricing and compare-at value.</p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Base Price ($) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" className="h-11 rounded-xl bg-slate-50 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compare_at_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Compare-At Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" className="h-11 rounded-xl bg-slate-50 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Visibility */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Status &amp; Publishing</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Control catalog publication and homepage feature status.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Status</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                        {...field}
                      >
                        <option value="active">Active (Visible in Catalog)</option>
                        <option value="draft">Draft (Hidden from Storefront)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs font-bold text-slate-900">Featured Product</FormLabel>
                      <FormDescription className="text-[11px] text-slate-500">
                        Display prominently on storefront home carousel.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href={`/admin/products/${id}`}>
              <Button type="button" variant="outline" className="h-11 px-5 text-xs font-bold rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={form.formState.isSubmitting} className="h-11 px-6 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs">
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
