import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Folder,
  ChevronRight,
  Home,
  FileUp,
  Search,
  Filter,
  FileText,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { api } from '../api/endpoints';
import { Navbar } from '../components/common/Navbar';
import { DocumentTable } from '../components/public/DocumentTable';
import { Pagination } from '../components/common/Pagination';
import { UploadModal } from '../components/public/UploadModal';
import { Folder as FolderType } from '../types';

export const FolderDetailPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Tải thông tin chi tiết của thư mục
  const { data: folder, isLoading: isLoadingFolder } = useQuery<FolderType>({
    queryKey: ['folder-detail', folderId],
    queryFn: () => api.getFolderDetail(folderId || ''),
    enabled: !!folderId,
  });

  // Tải danh sách các tệp tin trong thư mục
  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['folder-files', folderId, page, pageSize],
    queryFn: () => api.getFolderFiles(folderId || '', page, pageSize),
    enabled: !!folderId,
  });

  // Bộ lọc nhanh phía máy khách trên trang hiện tại (theo từ khóa hoặc định dạng tệp)
  const allFiles = filesData?.data || [];
  const filteredFiles = allFiles.filter((f) => {
    if (fileTypeFilter && f.file_type !== fileTypeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = f.original_name.toLowerCase().includes(q);
      const matchUploader = f.uploader_name.toLowerCase().includes(q);
      const matchUnit = f.uploader_unit?.toLowerCase().includes(q);
      return matchName || matchUploader || matchUnit;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Thanh điều hướng đường dẫn (Breadcrumb) */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <Link to="/" className="flex items-center hover:text-indigo-600 transition-colors">
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            <span>Năm {folder?.year || '...'}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{folder?.name || 'Đang tải...'}</span>
        </nav>

        {/* Thẻ tiêu đề thông tin thư mục */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Folder className="w-7 h-7 fill-current" />
            </div>
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1.5">
                Năm {folder?.year}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {folder?.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                <span>Tổng số: <strong className="text-slate-700">{filesData?.total || 0}</strong> tài liệu</span>
                <span>•</span>
                <span>Cập nhật liên tục</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-200 transition-all active:scale-95"
            >
              <FileUp className="w-4 h-4" />
              <span>Nộp văn bản vào thư mục</span>
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm và bộ lọc định dạng */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tệp, người nộp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả định dạng</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="word">Word (.docx, .doc)</option>
              <option value="excel">Excel (.xlsx, .xls)</option>
            </select>

            {(searchTerm || fileTypeFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFileTypeFilter('');
                }}
                title="Bỏ lọc"
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bảng hiển thị danh sách tài liệu */}
        <DocumentTable
          files={filteredFiles}
          isLoading={isLoadingFiles || isLoadingFolder}
        />

        {/* Phân trang tài liệu */}
        {filesData && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2">
            <Pagination
              currentPage={page}
              totalPages={filesData.totalPages}
              totalItems={filesData.total}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </main>

      {/* Hộp thoại modal nộp văn bản */}
      {folder && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          folderId={folder.id}
          folderName={folder.name}
          yearNumber={folder.year}
          onUploadSuccess={() => {
            refetchFiles();
          }}
        />
      )}
    </div>
  );
};
