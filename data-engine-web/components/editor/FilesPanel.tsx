'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { FileItem, getFiles, createDirectory, createFile, updateItemName, deleteItem } from '@/lib/api/files';

export function FilesPanel() {
  const { selectedFile, setSelectedFile } = useEditor();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'directory' | 'file' | null>(null);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [pendingEdit, setPendingEdit] = useState<{ type: 'file'; parentId: string | null; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载文件列表
  useEffect(() => {
    loadFiles();
  }, []);

  // 当进入编辑状态时，聚焦输入框
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // 处理待编辑的文件（创建后等待刷新）
  useEffect(() => {
    if (pendingEdit) {
      const findNewFile = (items: FileItem[], parentId: string | null, name: string): FileItem | null => {
        const targetItems = parentId 
          ? findItemById(items, parentId)?.children || []
          : items;
        
        const newFile = [...targetItems]
          .reverse()
          .find(item => item.name === name && item.type === pendingEdit.type);
        
        if (newFile) {
          return newFile;
        }
        
        // 递归查找子目录
        for (const item of items) {
          if (item.children) {
            const found = findNewFile(item.children, null, name);
            if (found) return found;
          }
        }
        return null;
      };

      const newItem = findNewFile(files, pendingEdit.parentId, pendingEdit.name);
      if (newItem) {
        setEditingId(newItem.id);
        setEditingType(pendingEdit.type);
        setEditingValue(pendingEdit.name);
        setEditingParentId(pendingEdit.parentId);
        // 自动选中新项目，刷新右侧编辑区
        setSelectedFile(newItem.id);
        setPendingEdit(null);
      }
    }
  }, [files, pendingEdit, setSelectedFile]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getFiles();
      setFiles(data);
      // 默认展开所有目录
      if (data.length > 0 && expandedFolders.size === 0) {
        const allFolderIds = getAllFolderIds(data);
        setExpandedFolders(new Set(allFolderIds));
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllFolderIds = (items: FileItem[]): string[] => {
    const ids: string[] = [];
    for (const item of items) {
      if (item.type === 'directory') {
        ids.push(item.id);
        if (item.children) {
          ids.push(...getAllFolderIds(item.children));
        }
      }
    }
    return ids;
  };

  const findItemById = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddDirectory = async (parentId?: string) => {
    try {
      const defaultName = '新目录';
      const newDirectory = await createDirectory(defaultName, parentId);
      await loadFiles();
      // 创建后立即进入编辑状态
      setEditingId(newDirectory.id);
      setEditingType('directory');
      setEditingValue(defaultName);
      setEditingParentId(parentId || null);
      // 确保新目录展开
      if (parentId) {
        setExpandedFolders(prev => new Set([...prev, parentId]));
      }
      setExpandedFolders(prev => new Set([...prev, newDirectory.id]));
    } catch (error) {
      console.error('Failed to create directory:', error);
    }
  };

  const handleAddFile = async (parentId?: string) => {
    try {
      const defaultName = '新项目';
      const newFile = await createFile(defaultName, parentId);
      // 设置待编辑状态，等待刷新
      setPendingEdit({ type: 'file', parentId: parentId || null, name: defaultName });
      // 确保父目录展开
      if (parentId) {
        setExpandedFolders(prev => new Set([...prev, parentId]));
      }
      await loadFiles();
      // 创建后自动选中新项目，刷新右侧编辑区
      setSelectedFile(newFile.id);
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const handleSave = async () => {
    if (!editingId || !editingValue.trim()) {
      // 如果名称为空，取消编辑
      setEditingId(null);
      setEditingType(null);
      setEditingValue('');
      setEditingParentId(null);
      return;
    }

    try {
      await updateItemName(editingId, editingValue.trim());
      await loadFiles();
      setEditingId(null);
      setEditingType(null);
      setEditingValue('');
      setEditingParentId(null);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingType(null);
    setEditingValue('');
    setEditingParentId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleStartEdit = (id: string, type: 'directory' | 'file', currentName: string, parentId?: string) => {
    setEditingId(id);
    setEditingType(type);
    setEditingValue(currentName);
    setEditingParentId(parentId || null);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('确定要删除此项吗？')) {
      return;
    }

    try {
      await deleteItem(itemId);
      // 如果删除的是当前选中的文件，清除选中状态
      if (selectedFile === itemId) {
        setSelectedFile('');
      }
      // 如果删除的是展开的目录，从展开列表中移除
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      await loadFiles();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'file') {
      setSelectedFile(item.id);
    } else {
      toggleFolder(item.id);
    }
  };

  const renderFileItem = (item: FileItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedFile === item.id;
    const isEditing = editingId === item.id;

    if (item.type === 'directory') {
      return (
        <div key={item.id}>
          <div
            className={`flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-700 text-sm ${
              isSelected ? 'bg-gray-700' : ''
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={(e) => {
              if (!isEditing) {
                handleItemClick(item);
              }
            }}
          >
            <div className="flex items-center gap-1 flex-1">
              <span className="text-gray-400 text-xs">
                {isExpanded ? '▼' : '▶'}
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              
              {/* 目录名称 - 可编辑 */}
              {isEditing && editingType === 'directory' ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-gray-700 border border-blue-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="text-gray-300 cursor-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(item.id, 'directory', item.name, item.parentId);
                  }}
                >
                  {item.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* 添加目录按钮 */}
              <button
                className="text-gray-400 hover:text-gray-300 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddDirectory(item.id);
                }}
                title="添加目录"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {/* 添加新项目按钮 */}
              <button
                className="text-gray-400 hover:text-gray-300 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFile(item.id);
                }}
                title="添加新项目"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              {/* 删除按钮 */}
              <button
                className="text-gray-400 hover:text-red-400 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                title="删除目录"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* 子项列表 */}
          {isExpanded && item.children && (
            <div>
              {item.children.map((child) => renderFileItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // 文件项
    return (
      <div
        key={item.id}
        className={`group flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-700 text-sm ${
          isSelected ? 'bg-gray-700 border-l-2 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 20}px` }}
        onClick={(e) => {
          if (!isEditing) {
            handleItemClick(item);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <svg
            className="w-3 h-3 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          
          {/* 项目名称 - 可编辑 */}
          {isEditing && editingType === 'file' ? (
            <input
              ref={inputRef}
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-gray-700 border border-blue-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={`${isSelected ? 'text-white' : 'text-gray-300'} cursor-text`}
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit(item.id, 'file', item.name, item.parentId);
                // 点击项目时选中，刷新右侧编辑区
                setSelectedFile(item.id);
              }}
            >
              {item.name}
            </span>
          )}
        </div>
        {/* 删除按钮 */}
        <button
          className="text-gray-400 hover:text-red-400 p-1"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          title="删除项目"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 border-r border-gray-600">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              工作目录
            </span>
          </div>
          
          {/* 添加按钮 - 添加目录 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAddDirectory()}
              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
              title="添加目录"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <button
              onClick={() => handleAddFile()}
              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
              title="添加新项目"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 文件树区域 */}
        <div className="pb-2">
          {loading ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">加载中...</div>
          ) : files.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">
              暂无内容，点击 + 添加目录或新项目
            </div>
          ) : (
            files.map((item) => renderFileItem(item))
          )}
        </div>
      </div>
    </div>
  );
}
