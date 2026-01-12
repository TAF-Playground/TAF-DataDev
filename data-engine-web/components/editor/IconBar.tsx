'use client';

import { usePathname, useRouter } from 'next/navigation';

export function IconBar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { 
      path: '/home', 
      label: '主页面', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      )
    },
    { 
      path: '/editor', 
      label: 'SQL开发', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      )
    },
    { 
      path: '/database', 
      label: '数据库', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      )
    },
    { 
      path: '/metrics', 
      label: '指标库', 
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      )
    },
  ];

  const handleAIClick = () => {
    alert('ai功能实现中');
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 border-r border-gray-600 bg-gray-850 h-full">
      {/* 顶部平台图标 */}
      <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </button>

      {/* 留出空间 */}
      <div className="h-2"></div>

      {/* AI按钮 - 彩色圆角方形 */}
      <button
        onClick={handleAIClick}
        className="px-2 py-1.5 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg"
        title="AI功能"
      >
        AI
      </button>

      {/* 分割线 */}
      <div className="h-px w-10 bg-gray-600 my-2"></div>

      {/* 四个功能按钮 */}
      {menuItems.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`p-2 rounded transition-colors ${
              isActive
                ? 'text-blue-400 bg-gray-700'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
            }`}
            title={item.label}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {item.icon}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
