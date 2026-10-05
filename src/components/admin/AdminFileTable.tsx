import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  FileQuestion,
  Eye,
  Calendar,
  Clock,
} from 'lucide-react';
import { DocumentFile, Year, Folder as FolderType } from '../../types';
import { FileTypeBadge } from '../common/FileTypeBadge';
import { Pagination } from '../common/Pagination';
import { Modal } from '../common/Modal';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { formatBytes, formatDate, formatDateTimeParts } from '../../utils/formatters';
import { api } from '../../api/endpoints';

interface AdminFileTableProps {
  files: DocumentFile[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  years: Year[];
  folders: FolderType[];
  isLoading?: boolean;
  filters: {
    search: string;
    yearId: string;
    folderId: string;
    fileType: string;
    from: string;
    to: string;
    sortBy: string;
    sortDir: string;
  };
  onFilterChange: (newFilters: any) => void;
  onRefresh: () => void;
}

export const AdminFileTable: React.FC<AdminFileTableProps> = ({
  files,
  total,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  years,
  folders,
  isLoading,
  filters,
  onFilterChange,
  onRefresh,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fileToDelete, setFileToDelete] = useState<DocumentFile | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(files.map((f) => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopy = (file: DocumentFile) => {
    const url = api.getViewUrl(file.id);
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSingle = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAdminFile(fileToDelete.id);
      setFileToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== fileToDelete.id));
      onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Không thể xóa tệp tin. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await api.bulkDeleteFiles(selectedIds);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      onRefresh();
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Không thể xóa danh sách tệp tin. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    onFilterChange({
      search: '',
      yearId: '',
      folderId: '',
      fileType: '',
      from: '',
      to: '',
      sortBy: 'uploaded_at',
      sortDir: 'desc',
    });
  };

  const isAllSelected = files.length > 0 && selectedIds.length === files.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < files.length;

  return (
    <div className="space-y-4">
      {/* Search & Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên file, người nộp..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Filter Year */}
          <div>
            <select
              value={filters.yearId}
              onChange={(e) => onFilterChange({ ...filters, yearId: e.target.value, folderId: '' })}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Tất cả các năm</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  Năm {y.year}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Folder */}
          <div>
            <select
              value={filters.folderId}
              onChange={(e) => onFilterChange({ ...filters, folderId: e.target.value })}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Tất cả thư mục</option>
              {folders
                .filter((f) => !filters.yearId || f.year_id === filters.yearId)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter File Type */}
          <div>
            <select
              value={filters.fileType}
              onChange={(e) => onFilterChange({ ...filters, fileType: e.target.value })}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Tất cả định dạng</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="word">Word (.docx, .doc)</option>
              <option value="excel">Excel (.xlsx, .xls)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters: Date range & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Khoảng ngày nộp:</span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onFilterChange({ ...filters, from: e.target.value })}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onFilterChange({ ...filters, to: e.target.value })}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl animate-fade-in text-sm">
          <span className="font-semibold text-indigo-900">
            Đã chọn <span className="underline">{selectedIds.length}</span> / {files.length} tệp tin trên trang này
          </span>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa {selectedIds.length} tệp đã chọn</span>
          </button>
        </div>
      )}

      {/* Main Files Table */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Đang tải danh sách tệp tin...</div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Không tìm thấy tài liệu phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Tên tệp</th>
                  <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Định dạng</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Thư mục & Năm</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Người nộp</th>
                  <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Dung lượng</th>
                  <th className="py-3.5 px-4 min-w-[190px] whitespace-nowrap">Thời gian nộp</th>
                  <th className="py-3.5 px-4 min-w-[160px] text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {files.map((file) => {
                  const isChecked = selectedIds.includes(file.id);
                  const { date, time } = formatDateTimeParts(file.uploaded_at);
                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(file.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-left line-clamp-1 block"
                          title={file.original_name}
                        >
                          {file.original_name}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <FileTypeBadge type={file.file_type} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-slate-800">{file.folder_name}</span>
                          <span className="text-slate-400">Năm {file.year}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-slate-800">{file.uploader_name}</span>
                          {file.uploader_unit && (
                            <span className="text-slate-400">{file.uploader_unit}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono tabular-nums font-medium text-slate-600">
                        {formatBytes(file.size_bytes)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center space-x-2 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono tabular-nums text-slate-700 font-medium tracking-tight">
                            {date}
                          </span>
                          <span className="inline-flex items-center font-mono tabular-nums text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            <Clock className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                            {time}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1 flex-nowrap shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            title="Xem trực tiếp tệp"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors shrink-0"
                          >
                            <Eye className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(file)}
                            title="Sao chép liên kết"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors shrink-0"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Copy className="w-4 h-4 shrink-0" />
                            )}
                          </button>
                          <a
                            href={api.getDownloadUrl(file.id)}
                            download
                            title="Tải tệp"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors shrink-0"
                          >
                            <Download className="w-4 h-4 shrink-0" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            title="Xóa tệp"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      {/* Single Delete Confirmation Modal */}
      <Modal
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        title="Xác nhận xóa tệp tin"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-semibold">Hành động này không thể hoàn tác!</p>
              <p className="mt-1">
                Tệp tin <span className="font-bold underline">{fileToDelete?.original_name}</span> sẽ bị xóa vĩnh viễn khỏi hệ thống và máy chủ Cloudinary.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setFileToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleDeleteSingle}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        title="Xác nhận xóa hàng loạt"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-semibold">Cảnh báo xóa nhiều tệp!</p>
              <p className="mt-1">
                Bạn đang chuẩn bị xóa vĩnh viễn <span className="font-bold">{selectedIds.length}</span> tệp tin khỏi hệ thống. Hành động này không thể khôi phục.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Đang xóa...' : `Xóa ${selectedIds.length} tệp tin`}
            </button>
          </div>
        </div>
      </Modal>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
