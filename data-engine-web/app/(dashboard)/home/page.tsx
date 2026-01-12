'use client';

import { IconBar } from '@/components/editor/IconBar';
import { useEditor } from '@/hooks/useEditor';

export default function HomePage() {
  const { showLeftSidebar } = useEditor();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Left Sidebar - IconBar */}
      {showLeftSidebar && <IconBar />}
      
      {/* Right side - 功能区 */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-100 mb-4">Hello World</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
