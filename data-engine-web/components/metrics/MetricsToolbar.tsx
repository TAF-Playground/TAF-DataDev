'use client';

interface MetricsToolbarProps {
  onNewMetric?: () => void;
  onSearch?: (query: string) => void;
}

export function MetricsToolbar({ onNewMetric, onSearch }: MetricsToolbarProps) {
  return (
    <div className="flex h-12 items-center justify-between px-4 border-b border-gray-600 bg-gray-800">
      <div className="flex items-center gap-4 flex-1">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索指标..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 pl-9 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {/* 筛选按钮 */}
        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          筛选
        </button>
      </div>
      
      {/* 新增指标按钮 */}
      <button
        onClick={onNewMetric}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        新增指标
      </button>
    </div>
  );
}
