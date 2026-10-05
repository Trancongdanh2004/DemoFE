import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Eye,
  User,
  Building,
  Calendar,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { DocumentFile } from '../../types';
import { FileTypeBadge } from './FileTypeBadge';
import { formatBytes, formatDate } from '../../utils/formatters';
import { api } from '../../api/endpoints';

interface FilePreviewModalProps {
  file: DocumentFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewerMode, setViewerMode] = useState<'embedded' | 'google' | 'info'>('embedded');

  if (!isOpen || !file) return null;

  const viewUrl = api.getViewUrl(file.id);
  const downloadUrl = api.getDownloadUrl(file.id);
  const isPdf = file.file_type === 'pdf';
  const isOffice = file.file_type === 'word' || file.file_type === 'excel';
  const hasRealCloudinaryUrl =
    file.cloudinary_url &&
    !file.cloudinary_url.includes('/demo/raw/upload/v1/') &&
    file.cloudinary_url.startsWith('https://');

  const officeViewerUrl = hasRealCloudinaryUrl
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.cloudinary_url)}`
    : '';

  const googleViewerUrl = hasRealCloudinaryUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(file.cloudinary_url)}&embedded=true`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(viewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center space-x-3 min-w-0 mr-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-indigo-600 shadow-sm">
              {isPdf ? (
                <FileText className="w-5 h-5 text-rose-600" />
              ) : file.file_type === 'excel' ? (
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              ) : (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3
                  className="text-base font-bold text-slate-900 truncate"
                  title={file.original_name}
                >
                  {file.original_name}
                </h3>
                <FileTypeBadge type={file.file_type} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1 text-slate-400" />
                  {file.uploader_name}
                  {file.uploader_unit ? ` (${file.uploader_unit})` : ''}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                  {formatDate(file.uploaded_at)}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <HardDrive className="w-3 h-3 mr-1 text-slate-400" />
                  {formatBytes(file.size_bytes)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              title="Sao chép liên kết xem"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors hidden sm:flex items-center space-x-1 text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Chép link</span>
                </>
              )}
            </button>

            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở trong tab mới"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center space-x-1 text-xs font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Mở tab mới</span>
            </a>

            <a
              href={downloadUrl}
              download
              title="Tải văn bản về máy"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Tải về</span>
            </a>

            <button
              onClick={onClose}
              title="Đóng xem trước"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Toolbar for Office files */}
        {isOffice && hasRealCloudinaryUrl && (
          <div className="px-5 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Chế độ xem trực tuyến:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewerMode('embedded')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${viewerMode === 'embedded'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-white/50'
                  }`}
              >
                Office Live
              </button>
              <button
                onClick={() => setViewerMode('google')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${viewerMode === 'google'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-white/50'
                  }`}
              >
                Google Docs
              </button>
            </div>
          </div>
        )}

        {/* Preview Content Body */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden relative flex flex-col justify-center items-center">
          {isPdf ? (
            /* PDF Direct Preview iframe */
            <iframe
              src={viewUrl}
              title={file.original_name}
              className="w-full h-full rounded-2xl bg-white shadow-inner border border-slate-200"
            />
          ) : isOffice && hasRealCloudinaryUrl ? (
            /* Office / Google Viewer iframe for public documents */
            <iframe
              src={viewerMode === 'google' ? googleViewerUrl : officeViewerUrl}
              title={file.original_name}
              className="w-full h-full rounded-2xl bg-white shadow-inner border border-slate-200"
            />
          ) : (
            /* Info & Text View Card for Office documents or demo seed files */
            <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-md border border-slate-200/80 text-center space-y-6 animate-fade-in my-auto">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
                {file.file_type === 'excel' ? (
                  <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                ) : (
                  <FileText className="w-10 h-10 text-blue-600" />
                )}
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
                  Tài liệu định dạng {file.file_type.toUpperCase()}
                </span>
                <h4 className="text-xl font-bold text-slate-800 break-words">
                  {file.original_name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Đã được lưu trữ an toàn trong kho dữ liệu văn bản
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl text-left text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Người nộp:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {file.uploader_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Đơn vị:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {file.uploader_unit || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Dung lượng:</span>
                  <span className="font-semibold text-slate-800">
                    {formatBytes(file.size_bytes)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Ngày nộp:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(file.uploaded_at)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={downloadUrl}
                  download
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải văn bản về máy</span>
                </a>

                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Xem nội dung file</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
