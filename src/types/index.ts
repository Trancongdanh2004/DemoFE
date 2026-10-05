export type FileType = 'pdf' | 'word' | 'excel';

export interface Year {
  id: string;
  year: number;
  created_at: string;
  folder_count: number;
}

export interface Folder {
  id: string;
  name: string;
  year_id: string;
  created_at: string;
  file_count: number;
  year?: number;
}

export interface DocumentFile {
  id: string;
  folder_id: string;
  original_name: string;
  file_type: FileType;
  mime_type: string;
  size_bytes: number;
  cloudinary_url: string;
  cloudinary_public_id: string;
  uploader_name: string;
  uploader_unit: string | null;
  uploaded_at: string;
  folder_name?: string;
  year?: number;
  year_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalFiles: number;
  filesToday: number;
  totalSizeBytes: number;
  recentUploads: {
    id: string;
    original_name: string;
    file_type: FileType;
    size_bytes: number;
    uploader_name: string;
    uploaded_at: string;
    folder_name: string;
    year: number;
  }[];
}

export interface UploadResultItem {
  originalName: string;
  status: 'success' | 'error';
  message?: string;
  file?: DocumentFile;
}

export interface UploadResponse {
  message: string;
  successCount: number;
  failureCount: number;
  results: UploadResultItem[];
}

export interface AdminUser {
  username: string;
}
