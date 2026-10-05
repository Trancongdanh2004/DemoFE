import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  FolderKanban,
  ShieldCheck,
  RefreshCw,
  Layers,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/endpoints';
import { Navbar } from '../components/common/Navbar';
import { AdminStatsCards } from '../components/admin/AdminStatsCards';
import { AdminFileTable } from '../components/admin/AdminFileTable';
import { AdminStructureManager } from '../components/admin/AdminStructureManager';
import { Year, Folder } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'files' or 'structure'
  const [activeTab, setActiveTab] = useState<'files' | 'structure'>('files');

  // File Table Query State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    yearId: '',
    folderId: '',
    fileType: '',
    from: '',
    to: '',
    sortBy: 'uploaded_at',
    sortDir: 'desc',
  });

  // Protect route
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch Stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.getDashboardStats,
    enabled: isAuthenticated,
  });

  // Fetch Years
  const {
    data: years = [],
    refetch: refetchYears,
  } = useQuery<Year[]>({
    queryKey: ['admin-years'],
    queryFn: api.getYears,
    enabled: isAuthenticated,
  });

  // Fetch all Folders (flattened for filters)
  const {
    data: allFolders = [],
    refetch: refetchAllFolders,
  } = useQuery<Folder[]>({
    queryKey: ['admin-all-folders', filters.yearId],
    queryFn: async () => {
      if (filters.yearId) {
        return api.getYearFolders(filters.yearId);
      }
      // If no yearId selected, fetch for all years
      const promises = years.map((y) => api.getYearFolders(y.id));
      const res = await Promise.all(promises);
      return res.flat();
    },
    enabled: isAuthenticated && years.length > 0,
  });

  // Fetch Admin Files with filters & pagination
  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['admin-files', currentPage, pageSize, filters],
    queryFn: () =>
      api.getAdminFiles({
        page: currentPage,
        pageSize,
        yearId: filters.yearId || undefined,
        folderId: filters.folderId || undefined,
        fileType: filters.fileType || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      }),
    enabled: isAuthenticated,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchYears();
    refetchAllFolders();
    refetchFiles();
  };

  const totalFolderCount = years.reduce((acc, y) => acc + (y.folder_count || 0), 0);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Dashboard Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Hệ Thống Quản Trị</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Bảng Điều Khiển Quản Lý
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshAll}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Làm mới dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStatsCards
          stats={stats || null}
          folderCount={totalFolderCount}
          isLoading={isLoadingStats}
        />

        {/* Tab Controls */}
        <div className="border-b border-slate-200 flex space-x-8 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3.5 flex items-center space-x-2 transition-all relative ${
              activeTab === 'files'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Quản Lý & Tìm Kiếm Tệp Tin</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              {filesData?.total || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3.5 flex items-center space-x-2 transition-all relative ${
              activeTab === 'structure'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Cấu Trúc Thư Mục & Năm</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              {years.length} năm
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'files' ? (
          <AdminFileTable
            files={filesData?.data || []}
            total={filesData?.total || 0}
            totalPages={filesData?.totalPages || 1}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            years={years}
            folders={allFolders}
            isLoading={isLoadingFiles}
            filters={filters}
            onFilterChange={(newF) => {
              setFilters(newF);
              setCurrentPage(1);
            }}
            onRefresh={handleRefreshAll}
          />
        ) : (
          <AdminStructureManager
            years={years}
            onRefresh={handleRefreshAll}
          />
        )}
      </main>
    </div>
  );
};
