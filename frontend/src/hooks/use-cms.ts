import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsService, CmsQueryParams } from "@/services/cms-service";

export const CMS_QUERY_KEYS = {
  pages: (params: CmsQueryParams) => ["admin", "cms", "pages", params] as const,
  page: (id: string) => ["admin", "cms", "pages", id] as const,
  blogPosts: (params: CmsQueryParams) => ["admin", "cms", "blog", params] as const,
  blogPost: (id: string) => ["admin", "cms", "blog", id] as const,
  banners: (params: CmsQueryParams) => ["admin", "cms", "banners", params] as const,
  faqs: ["admin", "cms", "faqs"] as const,
  testimonials: ["admin", "cms", "testimonials"] as const,
};

export function useCmsPages(params: CmsQueryParams = {}) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.pages(params),
    queryFn: () => cmsService.getPages(params),
    staleTime: 30 * 1000,
  });
}

export function useCmsPage(id: string) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.page(id),
    queryFn: () => cmsService.getPage(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useTogglePublishPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.togglePublishPage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEYS.page(id) });
    },
  });
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cmsService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });
}

export function useBlogPosts(params: CmsQueryParams = {}) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.blogPosts(params),
    queryFn: () => cmsService.getBlogPosts(params),
    staleTime: 30 * 1000,
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.blogPost(id),
    queryFn: () => cmsService.getBlogPost(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useBanners(params: CmsQueryParams = {}) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.banners(params),
    queryFn: () => cmsService.getBanners(params),
    staleTime: 30 * 1000,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.faqs,
    queryFn: () => cmsService.getFaqs(),
    staleTime: 60 * 1000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.testimonials,
    queryFn: () => cmsService.getTestimonials(),
    staleTime: 60 * 1000,
  });
}
