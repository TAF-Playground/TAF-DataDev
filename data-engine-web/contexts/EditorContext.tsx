'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EditorState } from '@/types';
import { DEFAULT_SQL, DEFAULT_FILE_PATH } from '@/constants';
import { getProjectDetails, ProjectDetails } from '@/lib/api/files';

type ViewMode = 'editor' | 'projects' | 'directory';

interface EditorContextType extends EditorState {
  setSelectedFile: (file: string) => void;
  setCodeContent: (content: string) => void;
  toggleLeftSidebar: () => void;
  toggleBottomPanel: () => void;
  toggleRightSidebar: () => void;
  projectDetails: ProjectDetails | null;
  setProjectDetails: (details: ProjectDetails | null) => void;
  refreshProjectDetails: () => Promise<void>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode, directoryId?: string) => void;
  viewDirectoryId?: string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<string>(DEFAULT_FILE_PATH);
  const [codeContent, setCodeContent] = useState<string>(DEFAULT_SQL);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showBottomPanel, setShowBottomPanel] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [viewMode, setViewModeState] = useState<ViewMode>('projects'); // 默认显示工作目录页面
  const [viewDirectoryId, setViewDirectoryId] = useState<string | undefined>(undefined);

  // 当选中文件改变时，加载项目详情和SQL
  useEffect(() => {
    const loadProjectData = async () => {
      if (!selectedFile || selectedFile === DEFAULT_FILE_PATH) {
        setProjectDetails(null);
        setCodeContent(DEFAULT_SQL);
        return;
      }

      try {
        const details = await getProjectDetails(selectedFile);
        if (details) {
          setProjectDetails(details);
          // 如果有SQL内容，加载到编辑器
          if (details.sql) {
            setCodeContent(details.sql);
          } else {
            setCodeContent(DEFAULT_SQL);
          }
        } else {
          setProjectDetails(null);
          setCodeContent(DEFAULT_SQL);
        }
      } catch (error) {
        console.error('Failed to load project details:', error);
        setProjectDetails(null);
        setCodeContent(DEFAULT_SQL);
      }
    };

    loadProjectData();
  }, [selectedFile]);

  const refreshProjectDetails = async () => {
    if (!selectedFile || selectedFile === DEFAULT_FILE_PATH) {
      setProjectDetails(null);
      return;
    }

    try {
      const details = await getProjectDetails(selectedFile);
      setProjectDetails(details);
    } catch (error) {
      console.error('Failed to refresh project details:', error);
    }
  };

  const setViewMode = (mode: ViewMode, directoryId?: string) => {
    setViewModeState(mode);
    setViewDirectoryId(directoryId);
    // 当切换到编辑器模式时，如果有选中的文件，保持选中状态
    if (mode === 'editor' && selectedFile && selectedFile !== DEFAULT_FILE_PATH) {
      // 保持当前选中状态
    }
  };

  return (
    <EditorContext.Provider
      value={{
        selectedFile,
        codeContent,
        showLeftSidebar,
        showBottomPanel,
        showRightSidebar,
        projectDetails,
        setProjectDetails,
        setSelectedFile,
        setCodeContent,
        toggleLeftSidebar: () => setShowLeftSidebar((prev) => !prev),
        toggleBottomPanel: () => setShowBottomPanel((prev) => !prev),
        toggleRightSidebar: () => setShowRightSidebar((prev) => !prev),
        refreshProjectDetails,
        viewMode,
        setViewMode,
        viewDirectoryId,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
