import React from 'react';
import { FileText, FileSpreadsheet, File } from 'lucide-react';
import { FileType } from '../../types';
import { getFileTypeConfig, cn } from '../../utils/formatters';

interface FileTypeBadgeProps {
  type: FileType;
  showIcon?: boolean;
  className?: string;
}

export const FileTypeBadge: React.FC<FileTypeBadgeProps> = ({
  type,
  showIcon = true,
  className,
}) => {
  const config = getFileTypeConfig(type);

  const renderIcon = () => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 mr-1 text-rose-600" />;
      case 'word':
        return <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
      default:
        return <File className="w-3.5 h-3.5 mr-1 text-slate-500" />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border',
        config.bgColor,
        className
      )}
    >
      {showIcon && renderIcon()}
      {config.label}
    </span>
  );
};
