import { apiClient } from './client';
import {
  Year,
  Folder,
  DocumentFile,
  PaginatedResponse,
  DashboardStats,
  UploadResponse,
} from '../types';

export const api = {
  // Public
  getYears: async (): Promise<Year[]> => {
    const res = await apiClient.get<Year[]>('/years');
    return res.data;
  },

  getYearFolders: async (yearId: string): Promise<Folder[]> => {
    const res = await apiClient.get<Folder[]>(`/years/${yearId}/folders`);
    return res.data;
  },

  getFolderDetail: async (folderId: string): Promise<Folder> => {
    const res = await apiClient.get<Folder>(`/folders/${folderId}`);
    return res.data;
  },

  getFolderFiles: async (
    folderId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<DocumentFile>> => {
    const res = await apiClient.get<PaginatedResponse<DocumentFile>>(`/folders/${folderId}/files`, {
      params: { page, pageSize },
    });
    return res.data;
  },

  uploadFiles: async (
    folderId: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<UploadResponse> => {
    const res = await apiClient.post<UploadResponse>(`/folders/${folderId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  },

  getDownloadUrl: (fileId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    return `${baseUrl}/files/${fileId}/download`;
  },

  getViewUrl: (fileId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    return `${baseUrl}/files/${fileId}/view`;
  },

  // Admin Auth
  adminLogin: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post<{ token: string; admin: { username: string } }>(
      '/admin/login',
      credentials
    );
    return res.data;
  },

  // Admin Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/admin/stats');
    return res.data;
  },

  // Admin Files
  getAdminFiles: async (params: {
    page?: number;
    pageSize?: number;
    yearId?: string;
    folderId?: string;
    fileType?: string;
    from?: string;
    to?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PaginatedResponse<DocumentFile>> => {
    const res = await apiClient.get<PaginatedResponse<DocumentFile>>('/admin/files', {
      params,
    });
    return res.data;
  },

  deleteAdminFile: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/files/${id}`);
    return res.data;
  },

  bulkDeleteFiles: async (ids: string[]): Promise<{ message: string; deletedCount: number }> => {
    const res = await apiClient.post<{ message: string; deletedCount: number }>(
      '/admin/files/bulk-delete',
      { ids }
    );
    return res.data;
  },

  // Admin Structure
  createYear: async (year: number): Promise<Year> => {
    const res = await apiClient.post<Year>('/admin/years', { year });
    return res.data;
  },

  updateYear: async (id: string, year: number): Promise<Year> => {
    const res = await apiClient.patch<Year>(`/admin/years/${id}`, { year });
    return res.data;
  },

  deleteYear: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/years/${id}`);
    return res.data;
  },

  createFolder: async (yearId: string, name: string): Promise<Folder> => {
    const res = await apiClient.post<Folder>(`/admin/years/${yearId}/folders`, { name });
    return res.data;
  },

  renameFolder: async (id: string, name: string): Promise<Folder> => {
    const res = await apiClient.patch<Folder>(`/admin/folders/${id}`, { name });
    return res.data;
  },

  deleteFolder: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/folders/${id}`);
    return res.data;
  },
};
