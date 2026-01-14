'use client';

import { useEditor } from '@/hooks/useEditor';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useQueryResult } from '@/contexts/QueryResultContext';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { format } from 'sql-formatter';
import { saveProjectSQL, getFileItem } from '@/lib/api/files';
import { executeSQL } from '@/lib/api/database';
import { DEFAULT_FILE_PATH } from '@/constants';

export function CodeEditor() {
  const { codeContent, selectedFile, setCodeContent } = useEditor();
  const { selectedDatabase } = useDatabase();
  const { setQueryResult } = useQueryResult();
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  
  // 使用本地状态来管理编辑器内容，避免每次输入都触发 Context 更新
  const [localContent, setLocalContent] = useState<string>(codeContent);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousSelectedFileRef = useRef<string>(selectedFile);

  // 当切换文件时，同步 Context 中的内容到本地状态
  useEffect(() => {
    // 只在文件切换时同步，避免用户输入时被覆盖
    if (previousSelectedFileRef.current !== selectedFile) {
      setLocalContent(codeContent);
      previousSelectedFileRef.current = selectedFile;
      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    }
  }, [selectedFile, codeContent]);

  useEffect(() => {
    const loadProjectName = async () => {
      if (!selectedFile || selectedFile === DEFAULT_FILE_PATH) {
        setProjectName('');
        return;
      }

      try {
        const item = await getFileItem(selectedFile);
        if (item) {
          setProjectName(item.name);
        } else {
          setProjectName('');
        }
      } catch (error) {
        console.error('Failed to load project name:', error);
        setProjectName('');
      }
    };

    loadProjectName();
  }, [selectedFile]);

  // 防抖更新 Context，避免频繁更新导致性能问题
  const debouncedUpdateContext = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setCodeContent(value);
    }, 300); // 300ms 防抖延迟
  }, [setCodeContent]);

  const handleEditorChange = useCallback((value: string) => {
    // 立即更新本地状态，保证输入流畅
    setLocalContent(value);
    // 防抖更新 Context
    debouncedUpdateContext(value);
  }, [debouncedUpdateContext]);

  const handleRun = useCallback(async () => {
    if (!selectedDatabase) {
      alert('请先在右侧面板选择数据库');
      return;
    }

    // 使用本地内容，确保是最新的
    const contentToRun = localContent.trim();
    if (!contentToRun) {
      alert('SQL 查询不能为空');
      return;
    }

    try {
      setIsRunning(true);
      // 先同步到 Context，确保保存时能获取最新内容
      setCodeContent(localContent);
      const result = await executeSQL(selectedDatabase.id, localContent);
      setQueryResult(result);
    } catch (error) {
      console.error('Failed to execute SQL:', error);
      setQueryResult({
        success: false,
        error: error instanceof Error ? error.message : '执行失败',
        message: error instanceof Error ? error.message : '执行失败'
      });
    } finally {
      setIsRunning(false);
    }
  }, [selectedDatabase, localContent, setCodeContent, setQueryResult]);

  const handleFormat = useCallback(() => {
    try {
      const contentToFormat = localContent.trim();
      if (!contentToFormat) {
        return;
      }
      // 格式化 SQL
      const formatted = format(localContent, {
        language: 'sql',
        tabWidth: 2,
        useTabs: false,
        keywordCase: 'upper',
        indentStyle: 'standard',
        linesBetweenQueries: 2,
      });
      setLocalContent(formatted);
      setCodeContent(formatted);
    } catch (error) {
      console.error('SQL 格式化失败:', error);
      // 如果格式化失败，保持原样
    }
  }, [localContent, setCodeContent]);

  const handleSave = useCallback(async () => {
    if (!selectedFile || selectedFile === DEFAULT_FILE_PATH) {
      alert('请先选择一个项目');
      return;
    }

    try {
      setIsSaving(true);
      // 先同步到 Context，确保保存最新内容
      setCodeContent(localContent);
      await saveProjectSQL(selectedFile, localContent);
      alert('SQL保存成功');
    } catch (error) {
      console.error('Failed to save SQL:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSaving(false);
    }
  }, [selectedFile, localContent, setCodeContent]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 优化 CodeMirror 配置，使用 useMemo 避免重复创建
  const extensions = useMemo(() => [sql()], []);

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* File path bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-850">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>项目</span>
          <span>/</span>
          <span>{projectName || '未选择项目'}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 美化按钮 */}
          <button
            onClick={handleFormat}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded flex items-center gap-2"
            title="美化 SQL"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            美化
          </button>
          {/* 运行按钮 */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {isRunning ? '运行中...' : '运行'}
          </button>
          {/* Save 按钮 */}
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedFile || selectedFile === DEFAULT_FILE_PATH}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* Code editor with CodeMirror */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={localContent}
          height="100%"
          theme={oneDark}
          extensions={extensions}
          onChange={handleEditorChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
          }}
          style={{
            fontSize: '14px',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}
