import React from 'react';
import { FileText, Calendar, HardDrive, FolderKanban } from 'lucide-react';
import { DashboardStats } from '../../types';
import { formatBytes } from '../../utils/formatters';

interface AdminStatsCardsProps {
  stats: DashboardStats | null;
  folderCount?: number;
  isLoading?: boolean;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  folderCount = 0,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Tổng số văn bản',
      value: stats?.totalFiles || 0,
      subtext: 'Tài liệu trong hệ thống',
      icon: FileText,
      gradient: 'from-blue-600 to-indigo-600',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Tải lên hôm nay',
      value: stats?.filesToday || 0,
      subtext: 'Văn bản nộp trong ngày',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Dung lượng lưu trữ',
      value: formatBytes(stats?.totalSizeBytes || 0),
      subtext: 'Lưu trữ trên Cloudinary',
      icon: HardDrive,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Thư mục tài liệu',
      value: folderCount,
      subtext: 'Phân loại theo các năm',
      icon: FolderKanban,
      gradient: 'from-purple-600 to-indigo-600',
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg} group-hover:scale-105 transition-transform`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
