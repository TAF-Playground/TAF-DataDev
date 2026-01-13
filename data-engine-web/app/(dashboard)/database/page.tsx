'use client';

import { IconBar } from '@/components/editor/IconBar';
import { useEditor } from '@/hooks/useEditor';
import { DatabaseList } from '@/components/database/DatabaseList';

export default function DatabasePage() {
  const { showLeftSidebar } = useEditor();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Left Sidebar - IconBar */}
      {showLeftSidebar && <IconBar />}
      
      {/* Right side - 功能区 */}
      <div className="flex flex-1 overflow-hidden overflow-y-auto">
        <DatabaseList />
      </div>
    </div>
  );
}
