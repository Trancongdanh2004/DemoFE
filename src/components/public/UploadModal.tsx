import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderIcon,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { api } from '../../api/endpoints';
import { Folder, UploadResponse } from '../../types';
import { formatBytes } from '../../utils/formatters';

const uploadFormSchema = z.object({
  uploaderName: z
    .string()
    .trim()
    .min(2, 'Họ và tên người nộp tối thiểu 2 ký tự')
    .max(255, 'Tối đa 255 ký tự'),
  uploaderUnit: z.string().trim().max(255).optional(),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  folderName?: string;
  yearNumber?: number;
  availableFolders?: Folder[];
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId: initialFolderId,
  folderName,
  yearNumber,
  availableFolders = [],
  onUploadSuccess,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialFolderId || '');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
  });

  // Sync selectedFolderId if initialFolderId changes
  React.useEffect(() => {
    if (initialFolderId) {
      setSelectedFolderId(initialFolderId);
    } else if (availableFolders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(availableFolders[0].id);
    }
  }, [initialFolderId, availableFolders]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: File[] = [];
    const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!validExtensions.includes(ext)) {
        setErrorMessage(`Tệp "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng PDF, Word, Excel.`);
        continue;
      }

      if (file.size > maxSize) {
        setErrorMessage(`Tệp "${file.name}" có dung lượng vượt quá 10MB.`);
        continue;
      }

      // Avoid duplicates by name + size
      const isDuplicate = stagedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!isDuplicate) {
        newFiles.push(file);
      }
    }

    if (stagedFiles.length + newFiles.length > 10) {
      setErrorMessage('Mỗi lần chỉ được tải lên tối đa 10 tệp tin.');
      return;
    }

    setStagedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetModal = () => {
    setStagedFiles([]);
    setUploadResponse(null);
    setErrorMessage(null);
    setUploadProgress(0);
    reset();
    onClose();
  };

  const onSubmit = async (data: UploadFormData) => {
    const targetFolderId = selectedFolderId || initialFolderId;
    if (!targetFolderId) {
      setErrorMessage('Vui lòng chọn thư mục lưu trữ văn bản.');
      return;
    }

    if (stagedFiles.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một tệp tin để tải lên.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('uploaderName', data.uploaderName);
    if (data.uploaderUnit) {
      formData.append('uploaderUnit', data.uploaderUnit);
    }

    stagedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await api.uploadFiles(targetFolderId, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setUploadResponse(res);
      onUploadSuccess();
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình nộp văn bản.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-600 flex-shrink-0" />;
    if (ext === 'xls' || ext === 'xlsx') return <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
    return <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title="Tải lên & Lưu trữ văn bản"
      description={
        folderName
          ? `Lưu trữ vào: ${folderName} (Năm ${yearNumber || ''})`
          : 'Nộp tài liệu PDF, Word, Excel vào thư mục quy định'
      }
      maxWidth="xl"
    >
      {uploadResponse ? (
        /* Success State */
        <div className="space-y-5 py-2">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-emerald-900">
              {uploadResponse.message}
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              Thành công: {uploadResponse.successCount} tệp | Thất bại: {uploadResponse.failureCount} tệp
            </p>
          </div>

          {/* Result details list */}
          <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-slate-100">
            {uploadResponse.results.map((res, i) => (
              <div key={i} className="flex items-center justify-between pt-2 text-xs">
                <span className="font-medium text-slate-800 truncate max-w-xs">
                  {res.originalName}
                </span>
                {res.status === 'success' ? (
                  <span className="text-emerald-600 font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Thành công
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold flex items-center" title={res.message}>
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> {res.message || 'Lỗi'}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={handleResetModal}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Folder selector if not preset */}
          {!initialFolderId && availableFolders.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chọn thư mục lưu trữ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.year ? `Năm ${f.year} - ` : ''}
                      {f.name} ({f.file_count || 0} files)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Uploader Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Họ và tên người nộp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn An"
                {...register('uploaderName')}
                className={`w-full text-sm border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.uploaderName
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              />
              {errors.uploaderName && (
                <p className="text-xs text-rose-500 mt-1">{errors.uploaderName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Đơn vị / Phòng ban <span className="text-slate-400 font-normal">(Tùy chọn)</span>
              </label>
              <input
                type="text"
                placeholder="VD: Phòng Hành chính"
                {...register('uploaderUnit')}
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chọn tệp tin tải lên <span className="text-rose-500">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Kéo thả tệp tin vào đây hoặc{' '}
                <span className="text-indigo-600 hover:underline">Chọn từ thiết bị</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hỗ trợ định dạng PDF, Word (.doc, .docx), Excel (.xls, .xlsx) — Tối đa 10 tệp (10MB/tệp)
              </p>
            </div>
          </div>

          {/* Staged Files List */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Đã chọn ({stagedFiles.length}/10 tệp):</span>
                <span>
                  Tổng:{' '}
                  {formatBytes(
                    stagedFiles.reduce((acc, f) => acc + f.size, 0)
                  )}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {stagedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate mr-2">
                      {getFileIcon(file.name)}
                      <span className="font-medium text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-slate-500">{formatBytes(file.size)}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStagedFile(idx);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Đang tải lên Cloudinary & Lưu cơ sở dữ liệu...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetModal}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || stagedFiles.length === 0}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Xác nhận nộp văn bản ({stagedFiles.length})</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
