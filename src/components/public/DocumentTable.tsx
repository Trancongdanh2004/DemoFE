import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  User,
  Calendar,
  Building,
  FileQuestion,
  Eye,
  Clock,
} from 'lucide-react';
import { DocumentFile } from '../../types';
import { FileTypeBadge } from '../common/FileTypeBadge';
import { FilePreviewModal } from '../common/FilePreviewModal';
import { formatBytes, formatDate, formatDateTimeParts } from '../../utils/formatters';
import { api } from '../../api/endpoints';

interface DocumentTableProps {
  files: DocumentFile[];
  isLoading?: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ files, isLoading }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);

  const handleCopy = (file: DocumentFile) => {
    const url = api.getViewUrl(file.id);
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Chưa có văn bản nào</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Thư mục này hiện tại chưa có tệp tin. Bạn có thể nhấn nút "Tải lên tài liệu" để nộp văn bản mới.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">#</th>
                <th className="py-3.5 px-4 min-w-[220px] whitespace-nowrap">Tên văn bản / Tệp</th>
                <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Dung lượng</th>
                <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Người nộp & Đơn vị</th>
                <th className="py-3.5 px-4 min-w-[190px] whitespace-nowrap">Thời gian nộp</th>
                <th className="py-3.5 px-4 min-w-[210px] text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {files.map((file, idx) => {
                const { date, time } = formatDateTimeParts(file.uploaded_at);
                return (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                  >
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors max-w-md truncate text-left block"
                        title={file.original_name}
                      >
                        {file.original_name}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <FileTypeBadge type={file.file_type} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono tabular-nums font-medium text-slate-600">
                      {formatBytes(file.size_bytes)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 flex items-center">
                          <User className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                          {file.uploader_name}
                        </span>
                        {file.uploader_unit && (
                          <span className="text-xs text-slate-500 flex items-center mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 mr-1.5 flex-shrink-0" />
                            {file.uploader_unit}
                          </span>
                        )}
                      </div>
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
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5 flex-nowrap shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          title="Xem trực tiếp văn bản"
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-all shadow-xs shrink-0 whitespace-nowrap flex-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span className="whitespace-nowrap leading-none">Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(file)}
                          title="Sao chép liên kết xem trực tiếp"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors shrink-0"
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
                          title="Tải văn bản về máy"
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-xs shrink-0 whitespace-nowrap flex-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span className="whitespace-nowrap leading-none">Tải về</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="divide-y divide-slate-100 md:hidden">
          {files.map((file) => {
            const { date, time } = formatDateTimeParts(file.uploaded_at);
            return (
              <div key={file.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    onClick={() => setPreviewFile(file)}
                    className="font-semibold text-slate-800 text-sm break-words flex-1 cursor-pointer hover:text-indigo-600"
                  >
                    {file.original_name}
                  </span>
                  <FileTypeBadge type={file.file_type} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Dung lượng:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-700">
                      {formatBytes(file.size_bytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Thời gian nộp:</span>
                    <div className="inline-flex items-center space-x-1.5">
                      <span className="font-mono tabular-nums text-slate-700 font-medium">{date}</span>
                      <span className="inline-flex items-center font-mono tabular-nums text-slate-600 bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px] font-semibold">
                        <Clock className="w-2.5 h-2.5 text-slate-400 mr-0.5 shrink-0" />
                        {time}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Người nộp:</span>
                    <span className="font-medium text-slate-800">
                      {file.uploader_name}{' '}
                      {file.uploader_unit ? `(${file.uploader_unit})` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1 flex-wrap gap-y-2">
                  <button
                    type="button"
                    onClick={() => setPreviewFile(file)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-600 hover:text-white transition-all shadow-xs shrink-0 whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span>Xem trực tiếp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(file)}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 shrink-0 whitespace-nowrap"
                  >
                    {copiedId === file.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 shrink-0" />
                        <span>Chép</span>
                      </>
                    )}
                  </button>
                  <a
                    href={api.getDownloadUrl(file.id)}
                    download
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs shrink-0 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span>Tải về</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
};
