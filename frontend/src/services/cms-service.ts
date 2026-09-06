import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface CmsPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  template: string;
  status: "draft" | "published" | "archived";
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  status: "draft" | "published" | "archived";
  category?: string | null;
  author?: {
    id: string;
    name: string;
  } | null;
  featured_image?: string | null;
  published_at?: string | null;
  created_at: string;
}

export interface BannerItem {
  id: string;
  title: string;
  image_url: string;
  link_url?: string | null;
  position: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface TestimonialItem {
  id: string;
  author_name: string;
  company?: string | null;
  content: string;
  rating?: number;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CmsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category?: string;
  position?: string;
  is_active?: boolean | string;
}

export const cmsService = {
  async getPages(params: CmsQueryParams = {}): Promise<{ data: CmsPageItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<CmsPageItem[]>>("/admin/pages", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getPage(id: string): Promise<CmsPageItem> {
    const response = await apiClient.get<ApiResponse<CmsPageItem>>(`/admin/pages/${id}`);
    return response.data.data;
  },

  async createPage(data: Record<string, unknown>): Promise<CmsPageItem> {
    const response = await apiClient.post<ApiResponse<CmsPageItem>>("/admin/pages", data);
    return response.data.data;
  },

  async updatePage(id: string, data: Record<string, unknown>): Promise<CmsPageItem> {
    const response = await apiClient.put<ApiResponse<CmsPageItem>>(`/admin/pages/${id}`, data);
    return response.data.data;
  },

  async deletePage(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/pages/${id}`);
  },

  async togglePublishPage(id: string): Promise<CmsPageItem> {
    const response = await apiClient.patch<ApiResponse<CmsPageItem>>(`/admin/pages/${id}/publish`);
    return response.data.data;
  },

  async getBlogPosts(params: CmsQueryParams = {}): Promise<{ data: BlogPostItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<BlogPostItem[]>>("/admin/blog", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getBlogPost(id: string): Promise<BlogPostItem> {
    const response = await apiClient.get<ApiResponse<BlogPostItem>>(`/admin/blog/${id}`);
    return response.data.data;
  },

  async createBlogPost(data: Record<string, unknown>): Promise<BlogPostItem> {
    const response = await apiClient.post<ApiResponse<BlogPostItem>>("/admin/blog", data);
    return response.data.data;
  },

  async deleteBlogPost(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/blog/${id}`);
  },

  async getBanners(params: CmsQueryParams = {}): Promise<{ data: BannerItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<BannerItem[]>>("/admin/banners", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async createBanner(data: Record<string, unknown>): Promise<BannerItem> {
    const response = await apiClient.post<ApiResponse<BannerItem>>("/admin/banners", data);
    return response.data.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/banners/${id}`);
  },

  async getFaqs(): Promise<FaqItem[]> {
    const response = await apiClient.get<ApiResponse<FaqItem[]>>("/admin/faqs");
    return response.data.data;
  },

  async createFaq(data: Record<string, unknown>): Promise<FaqItem> {
    const response = await apiClient.post<ApiResponse<FaqItem>>("/admin/faqs", data);
    return response.data.data;
  },

  async deleteFaq(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/faqs/${id}`);
  },

  async getTestimonials(): Promise<TestimonialItem[]> {
    const response = await apiClient.get<ApiResponse<TestimonialItem[]>>("/admin/testimonials");
    return response.data.data;
  },

  async createTestimonial(data: Record<string, unknown>): Promise<TestimonialItem> {
    const response = await apiClient.post<ApiResponse<TestimonialItem>>("/admin/testimonials", data);
    return response.data.data;
  },

  async getPublicPage(slug: string): Promise<CmsPageItem> {
    const response = await apiClient.get<ApiResponse<CmsPageItem>>(`/pages/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  async deleteTestimonial(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/testimonials/${id}`);
  },
};
