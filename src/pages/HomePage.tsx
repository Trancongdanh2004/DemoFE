import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Folder,
  FolderOpen,
  Calendar,
  FileUp,
  Sparkles,
  Clock,
  Eye,
  Download,
  Search,
  RotateCcw,
  Home,
  ChevronRight,
  HardDrive,
  RefreshCw,
  FolderTree,
  FileText,
  Layers,
} from 'lucide-react';
import { api } from '../api/endpoints';
import { Navbar } from '../components/common/Navbar';
import { UploadModal } from '../components/public/UploadModal';
import { FilePreviewModal } from '../components/common/FilePreviewModal';
import { FileTypeBadge } from '../components/common/FileTypeBadge';
import { DocumentTable } from '../components/public/DocumentTable';
import { Pagination } from '../components/common/Pagination';
import { WindowsFolderTree } from '../components/public/WindowsFolderTree';
import { formatDate } from '../utils/formatters';
import { Year, Folder as FolderType, DocumentFile } from '../types';

export const HomePage: React.FC = () => {
  const { folderId: routeFolderId } = useParams<{ folderId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedYearIds, setExpandedYearIds] = useState<string[]>([]);

  // Search & Filter state for files in selected folder
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);

  // Fetch years
  const { data: years = [], isLoading: isLoadingYears } = useQuery<Year[]>({
    queryKey: ['years'],
    queryFn: api.getYears,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch folders for currently selected year
  const {
    data: folders = [],
    isLoading: isLoadingFolders,
    refetch: refetchFolders,
  } = useQuery<FolderType[]>({
    queryKey: ['folders', selectedYearId],
    queryFn: () => (selectedYearId ? api.getYearFolders(selectedYearId) : Promise.resolve([])),
    enabled: !!selectedYearId,
    staleTime: 1000 * 60 * 5,
  });

  // Current year object
  const currentYear = useMemo(() => {
    return years.find((y) => y.id === selectedYearId) || years[0];
  }, [years, selectedYearId]);

  // Initial selection of year
  useEffect(() => {
    if (years.length > 0 && !selectedYearId) {
      const firstYear = years[0];
      setSelectedYearId(firstYear.id);
      setExpandedYearIds((prev) => (prev.includes(firstYear.id) ? prev : [...prev, firstYear.id]));
    }
  }, [years, selectedYearId]);

  // Query folder detail ONLY if routeFolderId is present in URL (/folder/:folderId)
  const { data: folderDetailFromRoute } = useQuery<FolderType>({
    queryKey: ['folder-detail', routeFolderId],
    queryFn: () => api.getFolderDetail(routeFolderId!),
    enabled: !!routeFolderId,
    staleTime: 1000 * 60 * 5,
  });

  // When folder detail from route loads, sync its year
  useEffect(() => {
    if (folderDetailFromRoute?.year_id) {
      setSelectedYearId(folderDetailFromRoute.year_id);
      setExpandedYearIds((prev) =>
        prev.includes(folderDetailFromRoute.year_id) ? prev : [...prev, folderDetailFromRoute.year_id]
      );
    }
  }, [folderDetailFromRoute?.year_id]);

  // Active folder ID (either from route or local state)
  const activeFolderId = routeFolderId || selectedFolderId;

  // Auto-select first folder when viewing root '/'
  useEffect(() => {
    if (!routeFolderId && !selectedFolderId && folders.length > 0) {
      setSelectedFolderId(folders[0].id);
    }
  }, [routeFolderId, selectedFolderId, folders]);

  // Selected folder object
  const selectedFolder = useMemo(() => {
    if (!activeFolderId) return null;
    if (folderDetailFromRoute && folderDetailFromRoute.id === activeFolderId) {
      return folderDetailFromRoute;
    }
    return folders.find((f) => f.id === activeFolderId) || null;
  }, [activeFolderId, folderDetailFromRoute, folders]);

  // Fetch files when a folder is selected
  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['folder-files', selectedFolder?.id, currentPage, pageSize],
    queryFn: () =>
      selectedFolder?.id
        ? api.getFolderFiles(selectedFolder.id, currentPage, pageSize)
        : Promise.resolve(null),
    enabled: !!selectedFolder?.id,
    staleTime: 1000 * 30,
  });

  // Client-side quick filter on current page files
  const filteredFiles = useMemo(() => {
    const files = filesData?.data || [];
    return files.filter((f) => {
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
  }, [filesData, searchTerm, fileTypeFilter]);

  // Fetch quick stats for public preview
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: api.getDashboardStats,
    staleTime: 1000 * 60 * 2,
  });

  const totalDocuments = stats?.totalFiles || 0;
  const todayDocuments = stats?.filesToday || 0;

  // Handlers for Tree selection
  const handleSelectYear = (year: Year) => {
    setSelectedYearId(year.id);
    setSelectedFolderId(null);
    setCurrentPage(1);
    setSearchTerm('');
    setFileTypeFilter('');
    setExpandedYearIds((prev) => (prev.includes(year.id) ? prev : [...prev, year.id]));
    if (routeFolderId) {
      navigate('/');
    }
  };

  const handleSelectFolder = (folder: FolderType, year: Year) => {
    setSelectedYearId(year.id);
    setSelectedFolderId(folder.id);
    setCurrentPage(1);
    setSearchTerm('');
    setFileTypeFilter('');
    setExpandedYearIds((prev) => (prev.includes(year.id) ? prev : [...prev, year.id]));
    if (routeFolderId !== folder.id) {
      navigate(`/folder/${folder.id}`);
    }
  };

  const handleToggleExpandYear = (yearId: string) => {
    setExpandedYearIds((prev) =>
      prev.includes(yearId) ? prev.filter((id) => id !== yearId) : [...prev, yearId]
    );
  };

  const handleExpandAll = () => {
    setExpandedYearIds(years.map((y) => y.id));
  };

  const handleRefreshAll = () => {
    refetchFolders();
    refetchFiles();
    refetchStats();
    queryClient.invalidateQueries({ queryKey: ['folders'] });
    queryClient.invalidateQueries({ queryKey: ['folder-files'] });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />

      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Sleek Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 text-white p-5 sm:p-7 shadow-lg shadow-indigo-950/20 border border-indigo-700/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Hệ thống phân cấp thư mục theo Mốc Năm & Danh Mục chuyên nghiệp</span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Kho Lưu Trữ Văn Bản & Tài Liệu Số Hóa
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Tra cứu, nộp và lưu trữ an toàn các văn bản PDF, Word, Excel theo cây thư mục Năm và Danh mục chuyên môn chuẩn hóa giống Windows Folder.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/30 transition-all duration-200"
              >
                <FileUp className="w-4 h-4" />
                <span>Nộp Văn Bản Mới</span>
              </button>

              <div className="flex items-center space-x-4 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-slate-200">
                <div>
                  <span className="font-extrabold text-white text-sm sm:text-base block">{totalDocuments}</span>
                  <span className="text-[11px] text-slate-300">Tổng văn bản</span>
                </div>
                <div className="h-7 w-[1px] bg-white/20" />
                <div>
                  <span className="font-extrabold text-white text-sm sm:text-base block">{todayDocuments}</span>
                  <span className="text-[11px] text-slate-300">Nộp hôm nay</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MAIN EXPLORER WORKSPACE: 3 PARTS LEFT (TREE) : 7 PARTS RIGHT (FILES) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* CỘT DỌC BÊN GÓC TRÁI (3 PHẦN): CÂY THƯ MỤC CÁC NĂM (WINDOWS FOLDER TREE) */}
          <aside className="lg:col-span-3 w-full">
            <WindowsFolderTree
              years={years}
              isLoadingYears={isLoadingYears}
              selectedYearId={selectedYearId}
              selectedFolderId={activeFolderId}
              onSelectYear={handleSelectYear}
              onSelectFolder={handleSelectFolder}
              expandedYearIds={expandedYearIds}
              onToggleExpandYear={handleToggleExpandYear}
              onExpandAll={handleExpandAll}
            />
          </aside>

          {/* BÊN TỆP HIỂN THỊ (7 PHẦN): NỘI DUNG TÀI LIỆU CỦA THƯ MỤC / NĂM ĐƯỢC CHỌN */}
          <section className="lg:col-span-7 w-full space-y-4">
            {/* Windows Explorer Style Address Bar / Breadcrumb */}
            <div className="flex items-center justify-between p-2.5 px-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs">
              <div className="flex items-center space-x-1.5 text-slate-500 overflow-x-auto scrollbar-none py-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderId(null);
                    if (routeFolderId) navigate('/');
                  }}
                  className="flex items-center hover:text-indigo-600 transition-colors font-medium flex-shrink-0"
                >
                  <Home className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>Kho Lưu Trữ</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderId(null);
                    if (routeFolderId) navigate('/');
                  }}
                  className={`hover:text-indigo-600 transition-colors font-medium flex-shrink-0 ${
                    !selectedFolder ? 'text-indigo-600 font-bold' : ''
                  }`}
                >
                  <span>Năm {currentYear?.year || '...'}</span>
                </button>

                {selectedFolder && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-900 font-bold flex items-center space-x-1 flex-shrink-0">
                      <Folder className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-1" />
                      <span>{selectedFolder.name}</span>
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleRefreshAll}
                title="Làm mới dữ liệu"
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 ml-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Folder / Year Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                  {selectedFolder ? (
                    <FolderOpen className="w-6 h-6 fill-current" />
                  ) : (
                    <Calendar className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Năm {currentYear?.year}
                    </span>
                    {selectedFolder && (
                      <span className="text-xs text-slate-400">
                        {filesData?.total !== undefined ? `${filesData.total} văn bản` : 'Đang tải...'}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {selectedFolder ? selectedFolder.name : `Danh Mục Thư Mục Năm ${currentYear?.year}`}
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedFolder
                      ? `Hiển thị các tệp tài liệu được lưu trữ trong danh mục ${selectedFolder.name}`
                      : `Chọn một thư mục ở cây bên trái (3 phần) hoặc chọn thẻ bên dưới để xem tệp`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-200 transition-all active:scale-95"
                >
                  <FileUp className="w-4 h-4" />
                  <span>
                    {selectedFolder
                      ? `Nộp vào "${selectedFolder.name}"`
                      : 'Nộp văn bản mới'}
                  </span>
                </button>
              </div>
            </div>

            {/* IF A FOLDER IS SELECTED: DISPLAY FILES TABLE & FILTERS */}
            {selectedFolder ? (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên tệp, người nộp..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <select
                      value={fileTypeFilter}
                      onChange={(e) => setFileTypeFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                    >
                      <option value="">Tất cả định dạng</option>
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="word">Word (.docx, .doc)</option>
                      <option value="excel">Excel (.xlsx, .xls)</option>
                    </select>

                    {(searchTerm || fileTypeFilter) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setFileTypeFilter('');
                        }}
                        title="Bỏ lọc"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Document Table (Files side - 7 parts) */}
                <DocumentTable
                  files={filteredFiles}
                  isLoading={isLoadingFiles}
                />

                {/* Pagination */}
                {filesData && filesData.totalPages > 1 && (
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={filesData.totalPages}
                      totalItems={filesData.total}
                      pageSize={pageSize}
                      onPageChange={(p) => setCurrentPage(p)}
                      onPageSizeChange={(s) => {
                        setPageSize(s);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* IF NO FOLDER IS SELECTED (YEAR OVERVIEW): SHOW FOLDER CARDS */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Các thư mục trong Năm {currentYear?.year} ({folders.length})
                  </span>
                </div>

                {isLoadingFolders ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-32 rounded-2xl bg-slate-200/80 animate-pulse" />
                    ))}
                  </div>
                ) : folders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
                    <Folder className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">Chưa có thư mục nào trong năm này</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Vui lòng liên hệ Quản trị viên để tạo các danh mục thư mục tài liệu.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => handleSelectFolder(folder, currentYear)}
                        className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                            <Folder className="w-5 h-5 fill-current" />
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Năm {currentYear?.year}
                          </span>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {folder.name}
                          </h4>
                          <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{folder.file_count || 0} tài liệu</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-indigo-600">
                          <span>Mở xem tệp</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </section>

        {/* Recent Uploads Stream */}
        {stats?.recentUploads && stats.recentUploads.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-slate-200/80">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
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
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow flex items-start justify-between space-x-3 group cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <FileTypeBadge type={file.file_type} />
                        <span className="text-[11px] text-slate-400 truncate">
                          {file.folder_name} (Năm {file.year})
                        </span>
                      </div>
                      <h5
                        className="font-semibold text-slate-800 text-xs truncate group-hover:text-indigo-600 transition-colors"
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
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={api.getDownloadUrl(file.id)}
                        download
                        title="Tải về"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Global / Pre-selected Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        availableFolders={folders}
        folderId={selectedFolder?.id}
        folderName={selectedFolder?.name}
        yearNumber={currentYear?.year}
        onUploadSuccess={() => {
          handleRefreshAll();
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
