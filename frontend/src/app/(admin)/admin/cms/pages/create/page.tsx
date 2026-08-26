"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ChevronRight, FileText, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cmsService } from "@/services/cms-service";
import { ApiError } from "@/types/api";

const pageSchema = z.object({
  title: z.string().min(1, "Page title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  content: z.string().min(1, "Page content is required"),
  excerpt: z.string().optional().or(z.literal("")),
  template: z.string().default("default"),
  featured_image: z.string().optional().or(z.literal("")),
  meta_title: z.string().max(255).optional().or(z.literal("")),
  meta_description: z.string().optional().or(z.literal("")),
});

type PageFormValues = z.infer<typeof pageSchema>;

export default function CreateCmsPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      template: "default",
      featured_image: "",
      meta_title: "",
      meta_description: "",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("title", val);
    if (!form.getValues("slug")) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", generated);
    }
  };

  const onSubmit = async (values: PageFormValues) => {
    setErrorMessage(null);
    try {
      const page = await cmsService.createPage(values);
      toast.success(`Page "${page.title}" created successfully!`);
      router.push(`/admin/cms/pages/${page.id}`);
    } catch (err: unknown) {
      const error = err as ApiError;
      setErrorMessage(error.message || "Failed to create CMS page.");

      if (error.errors) {
        Object.entries(error.errors).forEach(([field, msgs]) => {
          if (field in form.getValues()) {
            form.setError(field as keyof PageFormValues, { message: msgs[0] });
          }
        });
      }
    }
  };

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
          <Link href="/admin/cms/pages" className="hover:text-blue-600 transition-colors">
            CMS Pages
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Create Page
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              CONTENT OPERATIONS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create CMS Page
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Author a new policy, legal page, or custom promotional storefront page.
            </p>
          </div>

          <Link href="/admin/cms/pages">
            <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Pages</span>
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

          {/* Primary Page Details */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Page Content</h2>
              <p className="text-xs text-slate-500 mt-0.5">Main title, URL slug, and article body.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Page Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Terms & Conditions"
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                          {...field}
                          onChange={handleTitleChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">URL Slug *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="terms-and-conditions"
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px] text-slate-400">Storefront route path.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Short Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Brief summary displayed in directory listings..."
                        className="rounded-xl bg-slate-50 border-slate-200 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Body Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={10}
                        placeholder="Enter full markdown or structured text content..."
                        className="font-mono text-xs rounded-xl bg-slate-50 border-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Search Engine Optimization (SEO) */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">SEO &amp; Metadata</h2>
              <p className="text-xs text-slate-500 mt-0.5">Search engine indexing and OpenGraph headers.</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Terms of Service | NeuroCommerce AI"
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
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-700">Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Official terms of purchase and neurological device guarantees..."
                        className="rounded-xl bg-slate-50 border-slate-200 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="/admin/cms/pages">
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
              <span>Save Page</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
