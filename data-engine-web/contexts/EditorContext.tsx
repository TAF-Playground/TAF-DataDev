'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { EditorState } from '@/types';
import { DEFAULT_SQL, DEFAULT_FILE_PATH } from '@/constants';

interface EditorContextType extends EditorState {
  setSelectedFile: (file: string) => void;
  setCodeContent: (content: string) => void;
  toggleLeftSidebar: () => void;
  toggleBottomPanel: () => void;
  toggleRightSidebar: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<string>(DEFAULT_FILE_PATH);
  const [codeContent, setCodeContent] = useState<string>(DEFAULT_SQL);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showBottomPanel, setShowBottomPanel] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);

  return (
    <EditorContext.Provider
      value={{
        selectedFile,
        codeContent,
        showLeftSidebar,
        showBottomPanel,
        showRightSidebar,
        setSelectedFile,
        setCodeContent,
        toggleLeftSidebar: () => setShowLeftSidebar((prev) => !prev),
        toggleBottomPanel: () => setShowBottomPanel((prev) => !prev),
        toggleRightSidebar: () => setShowRightSidebar((prev) => !prev),
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
