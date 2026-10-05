import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderArchive,
  Calendar,
  FileUp,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Clock,
  Eye,
  Download,
} from 'lucide-react';
import { api } from '../api/endpoints';
import { Navbar } from '../components/common/Navbar';
import { FolderCard } from '../components/public/FolderCard';
import { UploadModal } from '../components/public/UploadModal';
import { FilePreviewModal } from '../components/common/FilePreviewModal';
import { FileTypeBadge } from '../components/common/FileTypeBadge';
import { formatDate } from '../utils/formatters';
import { Year, Folder, DocumentFile } from '../types';

export const HomePage: React.FC = () => {
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);

  // Fetch years
  const { data: years = [], isLoading: isLoadingYears } = useQuery<Year[]>({
    queryKey: ['years'],
    queryFn: api.getYears,
  });

  // Set initial selected year
  React.useEffect(() => {
    if (years.length > 0 && !selectedYearId) {
      setSelectedYearId(years[0].id);
    }
  }, [years, selectedYearId]);

  // Selected year object
  const currentYear = years.find((y) => y.id === selectedYearId) || years[0];

  // Fetch folders for selected year
  const { data: folders = [], isLoading: isLoadingFolders, refetch: refetchFolders } = useQuery<Folder[]>({
    queryKey: ['folders', selectedYearId],
    queryFn: () => (selectedYearId ? api.getYearFolders(selectedYearId) : Promise.resolve([])),
    enabled: !!selectedYearId,
  });

  // Fetch quick stats for public preview
  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: api.getDashboardStats,
  });

  const totalDocuments = stats?.totalFiles || 0;
  const todayDocuments = stats?.filesToday || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-indigo-950/20 border border-indigo-700/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Hệ thống phân loại văn bản theo 2 cấp độ chuyên nghiệp</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Kho Lưu Trữ Văn Bản & <br />
              <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Tài Liệu Số Hóa
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Thu thập, lưu trữ an toàn các văn bản PDF, Word, Excel theo từng năm và thư mục chuyên môn. Quản lý minh bạch người nộp, thời gian và kiểm soát dữ liệu tập trung.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200"
              >
                <FileUp className="w-4 h-4" />
                <span>Nộp Văn Bản Mới</span>
              </button>

              <div className="flex items-center space-x-4 pl-3 text-xs text-slate-300 border-l border-white/20">
                <div>
                  <span className="font-extrabold text-white text-base block">{totalDocuments}</span>
                  <span>Tổng văn bản</span>
                </div>
                <div>
                  <span className="font-extrabold text-white text-base block">{todayDocuments}</span>
                  <span>Nộp hôm nay</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Level 1: Year Selection Tabs */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Cấp độ 1: Chọn Năm Lưu Trữ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Các Mốc Năm Trong Hệ Thống
              </h2>
            </div>
          </div>

          {isLoadingYears ? (
            <div className="flex space-x-3 overflow-x-auto py-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 w-36 bg-slate-200/80 rounded-2xl animate-pulse flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {years.map((y) => {
                const isSelected = y.id === selectedYearId;
                return (
                  <button
                    key={y.id}
                    onClick={() => setSelectedYearId(y.id)}
                    className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl border transition-all flex-shrink-0 ${isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-indigo-600'
                        }`}
                    >
                      {y.year.toString().slice(-2)}
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-sm block">Năm {y.year}</span>
                      <span
                        className={`text-xs block ${isSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                      >
                        {y.folder_count || 0} thư mục
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Level 2: Document Folders Grid inside Selected Year */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <FolderOpen className="w-4 h-4" />
                <span>Cấp độ 2: Danh Mục Thư Mục (Năm {currentYear?.year || ''})</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                Các Thư Mục Văn Bản Hiện Có
              </h3>
            </div>
          </div>

          {isLoadingFolders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-200/80 animate-pulse" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Chưa có thư mục nào trong năm này</p>
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng liên hệ Quản trị viên để tạo các danh mục thư mục tài liệu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  yearNumber={currentYear?.year}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Uploads Stream */}
        {stats?.recentUploads && stats.recentUploads.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Văn Bản Mới Tải Lên Gần Đây
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.recentUploads.slice(0, 6).map((file) => {
                const docFile: DocumentFile = {
                  id: file.id,
                  folder_id: '',
                  original_name: file.original_name,
                  file_type: file.file_type,
                  mime_type: file.file_type === 'pdf' ? 'application/pdf' : 'application/octet-stream',
                  size_bytes: file.size_bytes,
                  cloudinary_url: '',
                  cloudinary_public_id: '',
                  uploader_name: file.uploader_name,
                  uploader_unit: null,
                  uploaded_at: file.uploaded_at,
                  folder_name: file.folder_name,
                  year: file.year,
                };
                return (
                  <div
                    key={file.id}
                    onClick={() => setPreviewFile(docFile)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between space-x-3 group cursor-pointer"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <FileTypeBadge type={file.file_type} />
                        <span className="text-[11px] text-slate-400 truncate">
                          {file.folder_name} (Năm {file.year})
                        </span>
                      </div>
                      <h5
                        className="font-semibold text-slate-800 text-xs sm:text-sm truncate group-hover:text-indigo-600 transition-colors"
                        title={file.original_name}
                      >
                        {file.original_name}
                      </h5>
                      <div className="flex items-center text-[11px] text-slate-400 space-x-2">
                        <span>{file.uploader_name}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploaded_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setPreviewFile(docFile)}
                        title="Xem trực tiếp"
                        className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={api.getDownloadUrl(file.id)}
                        download
                        title="Tải về"
                        className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        availableFolders={folders}
        onUploadSuccess={() => {
          refetchFolders();
        }}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
