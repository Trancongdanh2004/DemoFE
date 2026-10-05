import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, FileText, ArrowRight } from 'lucide-react';
import { Folder as FolderType } from '../../types';

interface FolderCardProps {
  folder: FolderType;
  yearNumber?: number;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, yearNumber }) => {
  return (
    <Link
      to={`/folder/${folder.id}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all duration-300">
          <Folder className="w-6 h-6 fill-current" />
        </div>
        {yearNumber && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Năm {yearNumber}
          </span>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
          {folder.name}
        </h4>
        <div className="flex items-center text-xs text-slate-500 mt-1.5 space-x-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>{folder.file_count || 0} tài liệu</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-indigo-600">
        <span>Xem văn bản</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
