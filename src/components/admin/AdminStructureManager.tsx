import React, { useState } from 'react';
import {
  Calendar,
  Folder,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  FolderPlus,
  CalendarPlus,
  Layers,
} from 'lucide-react';
import { Year, Folder as FolderType } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../api/endpoints';

interface AdminStructureManagerProps {
  years: Year[];
  onRefresh: () => void;
}

export const AdminStructureManager: React.FC<AdminStructureManagerProps> = ({
  years,
  onRefresh,
}) => {
  const [selectedYear, setSelectedYear] = useState<Year | null>(years[0] || null);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  // Modal states
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [isEditYearOpen, setIsEditYearOpen] = useState(false);
  const [yearToEdit, setYearToEdit] = useState<Year | null>(null);
  const [yearToDelete, setYearToDelete] = useState<Year | null>(null);

  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);

  // Form values
  const [yearInput, setYearInput] = useState<number>(new Date().getFullYear());
  const [folderNameInput, setFolderNameInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load folders when selectedYear changes
  React.useEffect(() => {
    if (selectedYear) {
      loadFolders(selectedYear.id);
    } else if (years.length > 0) {
      setSelectedYear(years[0]);
    }
  }, [selectedYear, years]);

  const loadFolders = async (yearId: string) => {
    setIsLoadingFolders(true);
    try {
      const data = await api.getYearFolders(yearId);
      setFolders(data);
    } catch (err) {
      console.error('Failed to load folders:', err);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Year Actions
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await api.createYear(Number(yearInput));
      setIsAddYearOpen(false);
      onRefresh();
      setSelectedYear(created);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể tạo năm mới.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearToEdit) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.updateYear(yearToEdit.id, Number(yearInput));
      setIsEditYearOpen(false);
      setYearToEdit(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể cập nhật năm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteYear = async () => {
    if (!yearToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteYear(yearToDelete.id);
      setYearToDelete(null);
      onRefresh();
      setSelectedYear(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa năm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Folder Actions
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.createFolder(selectedYear.id, folderNameInput.trim());
      setIsAddFolderOpen(false);
      setFolderNameInput('');
      loadFolders(selectedYear.id);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể tạo thư mục.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToEdit) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.renameFolder(folderToEdit.id, folderNameInput.trim());
      setFolderToEdit(null);
      setFolderNameInput('');
      if (selectedYear) loadFolders(selectedYear.id);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể đổi tên thư mục.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteFolder(folderToDelete.id);
      setFolderToDelete(null);
      if (selectedYear) loadFolders(selectedYear.id);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa thư mục.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Years Management (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Danh Sách Năm</h3>
          </div>
          <button
            onClick={() => {
              setYearInput(new Date().getFullYear());
              setErrorMsg(null);
              setIsAddYearOpen(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm năm</span>
          </button>
        </div>

        <div className="space-y-2">
          {years.map((y) => {
            const isSelected = selectedYear?.id === y.id;
            return (
              <div
                key={y.id}
                onClick={() => setSelectedYear(y)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-sm text-indigo-900 font-bold'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {y.year.toString().slice(-2)}
                  </div>
                  <div>
                    <span className="text-sm">Năm {y.year}</span>
                    <span className="text-xs text-slate-400 block font-normal">
                      {y.folder_count || 0} thư mục
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setYearToEdit(y);
                      setYearInput(y.year);
                      setErrorMsg(null);
                      setIsEditYearOpen(true);
                    }}
                    title="Chỉnh sửa năm"
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setYearToDelete(y)}
                    title="Xóa năm"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Folders in selected year (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Folder className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Thư mục trong Năm {selectedYear?.year}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình các danh mục/thư mục văn bản cho năm này
            </p>
          </div>

          <button
            onClick={() => {
              setFolderNameInput('');
              setErrorMsg(null);
              setIsAddFolderOpen(true);
            }}
            disabled={!selectedYear}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm thư mục</span>
          </button>
        </div>

        {isLoadingFolders ? (
          <div className="p-8 text-center text-slate-400 text-sm">Đang tải danh sách thư mục...</div>
        ) : folders.length === 0 ? (
          <div className="p-8 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700 text-sm">Năm {selectedYear?.year} chưa có thư mục nào</p>
            <p className="text-xs text-slate-400 mt-1">Bấm "Thêm thư mục" để tạo thư mục văn bản đầu tiên.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm bg-slate-50/50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                      {folder.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      {folder.file_count || 0} tài liệu
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setFolderToEdit(folder);
                      setFolderNameInput(folder.name);
                      setErrorMsg(null);
                    }}
                    title="Đổi tên thư mục"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFolderToDelete(folder)}
                    title="Xóa thư mục"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Year */}
      <Modal
        isOpen={isAddYearOpen}
        onClose={() => setIsAddYearOpen(false)}
        title="Thêm năm mới"
        description="Thêm một mốc năm mới vào hệ thống lưu trữ văn bản"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateYear} className="space-y-4">
          {errorMsg && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Số năm (1990 - 2100)
            </label>
            <input
              type="number"
              min={1990}
              max={2100}
              value={yearInput}
              onChange={(e) => setYearInput(Number(e.target.value))}
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddYearOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo năm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Year */}
      <Modal
        isOpen={isEditYearOpen}
        onClose={() => setIsEditYearOpen(false)}
        title="Đổi số năm"
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateYear} className="space-y-4">
          {errorMsg && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Số năm mới
            </label>
            <input
              type="number"
              min={1990}
              max={2100}
              value={yearInput}
              onChange={(e) => setYearInput(Number(e.target.value))}
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditYearOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Year */}
      <Modal
        isOpen={!!yearToDelete}
        onClose={() => setYearToDelete(null)}
        title="Xác nhận xóa năm"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-semibold">Cảnh báo xóa toàn bộ dữ liệu năm!</p>
              <p className="mt-1">
                Khi xóa <span className="font-bold underline">Năm {yearToDelete?.year}</span>, toàn bộ các thư mục và tất cả văn bản bên trong sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu và Cloudinary!
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setYearToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleDeleteYear}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Folder */}
      <Modal
        isOpen={isAddFolderOpen}
        onClose={() => setIsAddFolderOpen(false)}
        title={`Thêm thư mục mới (Năm ${selectedYear?.year})`}
        maxWidth="sm"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          {errorMsg && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tên thư mục
            </label>
            <input
              type="text"
              placeholder="VD: Văn bản E, Hợp đồng, Quyết định..."
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddFolderOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderNameInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo thư mục'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Folder */}
      <Modal
        isOpen={!!folderToEdit}
        onClose={() => setFolderToEdit(null)}
        title="Đổi tên thư mục"
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateFolder} className="space-y-4">
          {errorMsg && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tên thư mục mới
            </label>
            <input
              type="text"
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setFolderToEdit(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderNameInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Folder */}
      <Modal
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        title="Xác nhận xóa thư mục"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-semibold">Cảnh báo xóa thư mục!</p>
              <p className="mt-1">
                Thư mục <span className="font-bold underline">{folderToDelete?.name}</span> và tất cả tài liệu bên trong sẽ bị xóa vĩnh viễn khỏi hệ thống!
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setFolderToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleDeleteFolder}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
