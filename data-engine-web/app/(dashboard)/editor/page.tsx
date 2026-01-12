'use client';

import { useEditor } from '@/hooks/useEditor';
import { TopBar } from '@/components/layout/TopBar';
import { IconBar } from '@/components/editor/IconBar';
import { FilesPanel } from '@/components/editor/FilesPanel';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { RightSidebar } from '@/components/editor/RightSidebar';
import { BottomPanel } from '@/components/editor/BottomPanel';
import { ResizablePanels } from '@/components/ui/ResizablePanel';

export default function EditorPage() {
  const { showLeftSidebar, showBottomPanel, showRightSidebar } = useEditor();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Left Sidebar - IconBar */}
      {showLeftSidebar && <IconBar />}
      
      {/* Right side - 工作区 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TopBar - 只在 SQL 开发页面显示 */}
        <TopBar />
        
        {/* 下方：SQL 开发内容 - 可拖动分割线 */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {showLeftSidebar ? (
            <ResizablePanels
              direction="horizontal"
              defaultSizes={[20, 80]}
              minSizes={[10, 30]}
              maxSizes={[50, 90]}
            >
              {/* 左边：Files */}
              <FilesPanel />
              
              {/* 右边：上下结构 */}
              <div className="flex flex-col h-full w-full">
                {showBottomPanel ? (
                  <ResizablePanels
                    direction="vertical"
                    defaultSizes={[60, 40]}
                    minSizes={[30, 20]}
                    maxSizes={[80, 70]}
                  >
                    {/* 上部分：SQL 开发内容和右边其他工作区 */}
                    <div className="flex h-full w-full">
                      {showRightSidebar ? (
                        <ResizablePanels
                          direction="horizontal"
                          defaultSizes={[75, 25]}
                          minSizes={[30, 10]}
                          maxSizes={[90, 70]}
                        >
                          <CodeEditor />
                          <RightSidebar />
                        </ResizablePanels>
                      ) : (
                        <div className="flex-1 h-full overflow-hidden">
                          <CodeEditor />
                        </div>
                      )}
                    </div>
                    
                    {/* 下部分：底部区域 */}
                    <BottomPanel />
                  </ResizablePanels>
                ) : (
                  <div className="flex flex-1 overflow-hidden">
                    {showRightSidebar ? (
                      <ResizablePanels
                        direction="horizontal"
                        defaultSizes={[75, 25]}
                        minSizes={[30, 10]}
                        maxSizes={[90, 70]}
                      >
                        <CodeEditor />
                        <RightSidebar />
                      </ResizablePanels>
                    ) : (
                      <div className="flex-1 h-full overflow-hidden">
                        <CodeEditor />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ResizablePanels>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              {showBottomPanel ? (
                <ResizablePanels
                  direction="vertical"
                  defaultSizes={[60, 40]}
                  minSizes={[30, 20]}
                  maxSizes={[80, 70]}
                >
                  {/* 上部分 */}
                  <div className="flex h-full w-full">
                    {showRightSidebar ? (
                      <ResizablePanels
                        direction="horizontal"
                        defaultSizes={[75, 25]}
                        minSizes={[30, 10]}
                        maxSizes={[90, 70]}
                      >
                        <CodeEditor />
                        <RightSidebar />
                      </ResizablePanels>
                    ) : (
                      <div className="flex-1 h-full overflow-hidden">
                        <CodeEditor />
                      </div>
                    )}
                  </div>
                  
                  {/* 下部分 */}
                  <BottomPanel />
                </ResizablePanels>
              ) : (
                <div className="flex flex-1 overflow-hidden">
                  {showRightSidebar ? (
                    <ResizablePanels
                      direction="horizontal"
                      defaultSizes={[75, 25]}
                      minSizes={[30, 10]}
                      maxSizes={[90, 70]}
                    >
                      <CodeEditor />
                      <RightSidebar />
                    </ResizablePanels>
                  ) : (
                    <div className="flex-1 h-full overflow-hidden">
                      <CodeEditor />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
