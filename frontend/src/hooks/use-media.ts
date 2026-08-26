import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService, MediaQueryParams } from "@/services/media-service";

export const MEDIA_QUERY_KEYS = {
  media: (params: MediaQueryParams) => ["admin", "media", params] as const,
  mediaFile: (id: string) => ["admin", "media", id] as const,
};

export function useMedia(params: MediaQueryParams = {}) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.media(params),
    queryFn: () => mediaService.getMedia(params),
    staleTime: 30 * 1000,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => mediaService.uploadMedia(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });
}
