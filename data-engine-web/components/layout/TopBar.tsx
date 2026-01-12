'use client';

import { useEditor } from '@/hooks/useEditor';
import { usePathname, useRouter } from 'next/navigation';

export function TopBar() {
  const {
    showLeftSidebar,
    showBottomPanel,
    showRightSidebar,
    toggleLeftSidebar,
    toggleBottomPanel,
    toggleRightSidebar,
  } = useEditor();
  
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-12 items-center justify-between border-b border-gray-600 bg-gray-800 px-4">
      <div className="flex items-center gap-4">
        {/* Navigation buttons */}
        <button
          onClick={() => router.push('/editor')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            pathname === '/editor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          SQL 开发
        </button>
        <button
          onClick={() => router.push('/metrics')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            pathname === '/metrics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          指标库
        </button>
        
        {/* Project name and environment dropdowns */}
        <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-600">
          <option>Project name</option>
        </select>
        <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-600">
          <option>Development</option>
        </select>
        
        {/* Commit button */}
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium">
          Commit (2 files)
        </button>
      </div>
      
      {/* Spacer */}
      <div className="flex-1"></div>
      
      {/* Toggle buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLeftSidebar}
          className={`p-1.5 rounded text-sm ${
            showLeftSidebar
              ? 'bg-gray-700 text-gray-200'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
          }`}
          title="Toggle Left Sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
        <button
          onClick={toggleBottomPanel}
          className={`p-1.5 rounded text-sm ${
            showBottomPanel
              ? 'bg-gray-700 text-gray-200'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
          }`}
          title="Toggle Bottom Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={toggleRightSidebar}
          className={`p-1.5 rounded text-sm ${
            showRightSidebar
              ? 'bg-gray-700 text-gray-200'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
          }`}
          title="Toggle Right Sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
