import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Search,
  X,
  ChevronsUpDown,
  FolderTree,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Year, Folder as FolderType } from '../../types';

interface WindowsFolderTreeProps {
  years: Year[];
  isLoadingYears?: boolean;
  selectedYearId: string;
  selectedFolderId?: string | null;
  onSelectYear: (year: Year) => void;
  onSelectFolder: (folder: FolderType, year: Year) => void;
  expandedYearIds: string[];
  onToggleExpandYear: (yearId: string) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
}

// Thành phần hiển thị một mục Năm trong Cây thư mục
const TreeYearItem: React.FC<{
  year: Year;
  isExpanded: boolean;
  isSelectedYear: boolean;
  selectedFolderId?: string | null;
  searchFilter: string;
  onToggleExpand: () => void;
  onSelectYear: (year: Year) => void;
  onSelectFolder: (folder: FolderType, year: Year) => void;
}> = ({
  year,
  isExpanded,
  isSelectedYear,
  selectedFolderId,
  searchFilter,
  onToggleExpand,
  onSelectYear,
  onSelectFolder,
}) => {
  // Tải danh sách các thư mục thuộc năm này
  const { data: folders = [], isLoading: isLoadingFolders } = useQuery<FolderType[]>({
    queryKey: ['folders', year.id],
    queryFn: () => api.getYearFolders(year.id),
    staleTime: 1000 * 60 * 5, // Lưu bộ nhớ cache trong 5 phút
  });

  // Lọc danh sách thư mục nếu đang tìm kiếm trên cây thư mục
  const filteredFolders = useMemo(() => {
    if (!searchFilter.trim()) return folders;
    const q = searchFilter.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchFilter]);

  // Nếu từ khóa tìm kiếm khớp với thư mục trong năm này thì tự động mở rộng nhánh năm đó
  const shouldForceExpand = searchFilter.trim() !== '' && filteredFolders.length > 0;
  const effectiveExpanded = isExpanded || shouldForceExpand;

  return (
    <div className="select-none">
      {/* Tiêu đề nút Năm */}
      <div
        className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
          isSelectedYear && !selectedFolderId
            ? 'bg-indigo-50/90 text-indigo-950 font-bold border border-indigo-200/80 shadow-sm'
            : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
        }`}
        onClick={() => {
          onSelectYear(year);
          if (!effectiveExpanded) {
            onToggleExpand();
          }
        }}
      >
        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
          {/* Nút mũi tên đóng/mở nhánh */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 rounded-md hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
            title={effectiveExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {effectiveExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-600 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
            )}
          </button>

          {/* Biểu tượng thư mục kiểu Windows cho Năm */}
          <div className="flex-shrink-0 text-amber-500">
            {effectiveExpanded ? (
              <FolderOpen className="w-4 h-4 fill-amber-400 text-amber-500" />
            ) : (
              <Folder className="w-4 h-4 fill-amber-400 text-amber-500" />
            )}
          </div>

          {/* Nhãn hiển thị Năm */}
          <span className="truncate text-xs sm:text-sm font-semibold tracking-tight">
            Năm {year.year}
          </span>
        </div>

        {/* Huy hiệu số lượng thư mục */}
        <span
          className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
            isSelectedYear && !selectedFolderId
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
          }`}
        >
          {folders.length || year.folder_count || 0} thư mục
        </span>
      </div>

      {/* Danh sách thư mục con (xổ dọc tương tự Windows Explorer tree) */}
      {effectiveExpanded && (
        <div className="relative ml-4 pl-3.5 my-1 border-l-2 border-slate-200 space-y-0.5">
          {isLoadingFolders ? (
            <div className="py-2 px-3 space-y-2">
              <div className="h-6 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-6 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="py-2 px-3 text-xs text-slate-400 italic">
              {searchFilter ? 'Không tìm thấy thư mục' : 'Chưa có thư mục'}
            </div>
          ) : (
            filteredFolders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <div
                  key={folder.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFolder(folder, year);
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={folder.name}
                >
                  {/* Đường nối nhánh cây thư mục */}
                  <div
                    className={`absolute -left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-[1.5px] ${
                      isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  />

                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {/* Biểu tượng thư mục con màu vàng kiểu Windows */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <FolderOpen className="w-4 h-4 fill-amber-300 text-amber-200" />
                      ) : (
                        <Folder className="w-4 h-4 fill-amber-400 text-amber-500 group-hover:scale-105 transition-transform" />
                      )}
                    </div>

                    {/* Tên thư mục */}
                    <span className="truncate text-xs sm:text-[13px]">
                      {folder.name}
                    </span>
                  </div>

                  {/* Huy hiệu số lượng tệp */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-1.5 flex-shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {folder.file_count || 0} tệp
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const WindowsFolderTree: React.FC<WindowsFolderTreeProps> = ({
  years,
  isLoadingYears = false,
  selectedYearId,
  selectedFolderId,
  onSelectYear,
  onSelectFolder,
  expandedYearIds,
  onToggleExpandYear,
  onExpandAll,
  onCollapseAll,
}) => {
  const [treeSearch, setTreeSearch] = useState('');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Tiêu đề Cây thư mục */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-sm">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              Cây Thư Mục Lưu Trữ
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Phân cấp Năm & Thư mục
            </p>
          </div>
        </div>

        {/* Các nút tác vụ trên cây thư mục */}
        <div className="flex items-center space-x-1">
          {onExpandAll && (
            <button
              type="button"
              onClick={onExpandAll}
              title="Mở rộng tất cả năm"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-xs"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Ô tìm kiếm nhanh thư mục */}
      <div className="p-2.5 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Lọc thư mục..."
            value={treeSearch}
            onChange={(e) => setTreeSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-700 placeholder-slate-400 transition-colors"
          />
          {treeSearch && (
            <button
              type="button"
              onClick={() => setTreeSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Mục gốc hệ thống / Kho lưu trữ */}
      <div className="p-2.5 border-b border-slate-100/80 bg-slate-50/30">
        <div className="flex items-center space-x-2 px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
          <span>Kho Tài Liệu Điện Tử</span>
        </div>
      </div>

      {/* Danh sách nội dung cây thư mục */}
      <div className="p-2.5 flex-1 overflow-y-auto space-y-1 max-h-[600px] min-h-[300px]">
        {isLoadingYears ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : years.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có mốc năm nào trong hệ thống
          </div>
        ) : (
          years.map((year) => (
            <TreeYearItem
              key={year.id}
              year={year}
              isExpanded={expandedYearIds.includes(year.id)}
              isSelectedYear={selectedYearId === year.id}
              selectedFolderId={selectedFolderId}
              searchFilter={treeSearch}
              onToggleExpand={() => onToggleExpandYear(year.id)}
              onSelectYear={onSelectYear}
              onSelectFolder={onSelectFolder}
            />
          ))
        )}
      </div>

      {/* Thông tin chân bảng cây thư mục */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
        Nhấn vào Năm để xổ danh sách thư mục
      </div>
    </div>
  );
};
