import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface MediaFileItem {
  id: string;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text?: string | null;
  collection: string;
  created_at: string;
}

export interface MediaQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  collection?: string;
  mime_type?: string;
}

export const mediaService = {
  async getMedia(params: MediaQueryParams = {}): Promise<{ data: MediaFileItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<MediaFileItem[]>>("/admin/media", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getMediaFile(id: string): Promise<MediaFileItem> {
    const response = await apiClient.get<ApiResponse<MediaFileItem>>(`/admin/media/${id}`);
    return response.data.data;
  },

  async uploadMedia(formData: FormData): Promise<MediaFileItem> {
    const response = await apiClient.post<ApiResponse<MediaFileItem>>("/admin/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/media/${id}`);
  },
};
