'use client';

import { useState, useEffect, useRef } from 'react';
import { useMetrics } from '@/contexts/MetricsContext';
import { MetricCategory } from '@/types/metrics';

interface MetricsFilesPanelProps {
  onCategorySelect?: (category: MetricCategory) => void;
}

export function MetricsFilesPanel({
  onCategorySelect,
}: MetricsFilesPanelProps) {
  const { 
    categories, 
    loading, 
    createCategory, 
    createMetric,
    updateCategoryName,
    updateMetricName,
    createTemporaryCategory,
    createTemporaryMetric,
  } = useMetrics();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'category' | 'metric' | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [pendingEdit, setPendingEdit] = useState<{ type: 'metric'; categoryId: string; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当 categories 加载完成时，默认展开所有目录
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categories.map((cat) => cat.id)));
    }
  }, [categories, expandedCategories.size]);

  // 处理待编辑的指标（创建后等待刷新）
  useEffect(() => {
    if (pendingEdit) {
      const category = categories.find(c => c.id === pendingEdit.categoryId);
      if (category && category.metrics) {
        // 找到最新创建的指标（名称为"新指标"的最后一个）
        const newMetric = [...category.metrics]
          .reverse()
          .find(m => m.name === pendingEdit.name);
        if (newMetric) {
          setEditingId(newMetric.id);
          setEditingType('metric');
          setEditingValue(pendingEdit.name);
          setEditingCategoryId(pendingEdit.categoryId);
          setPendingEdit(null);
        }
      }
    }
  }, [categories, pendingEdit]);

  // 当进入编辑状态时，聚焦输入框
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = async () => {
    try {
      // 直接创建新目录，使用默认名称
      const newCategory = await createCategory('新目录');
      // 创建后立即进入编辑状态
      setEditingId(newCategory.id);
      setEditingType('category');
      setEditingValue('新目录');
      setEditingCategoryId(null);
      // 确保新目录展开
      setExpandedCategories(prev => new Set([...prev, newCategory.id]));
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleAddMetric = async (categoryId: string) => {
    try {
      const defaultName = '新指标';
      // 直接创建新指标，使用默认名称
      await createMetric(categoryId, {
        name: defaultName,
        description: '',
      });
      // 设置待编辑状态，等待 categories 刷新
      setPendingEdit({ type: 'metric', categoryId, name: defaultName });
      // 确保目录展开
      setExpandedCategories(prev => new Set([...prev, categoryId]));
    } catch (error) {
      console.error('Failed to create metric:', error);
    }
  };

  const handleSave = async () => {
    if (!editingId || !editingValue.trim()) {
      // 如果名称为空，删除新创建的项目
      if (editingType === 'category') {
        // TODO: 删除新创建的目录（如果还没有保存）
      } else if (editingType === 'metric' && editingCategoryId) {
        // TODO: 删除新创建的指标（如果还没有保存）
      }
      setEditingId(null);
      setEditingType(null);
      setEditingValue('');
      setEditingCategoryId(null);
      return;
    }

    try {
      if (editingType === 'category') {
        // 更新目录名称
        await updateCategoryName(editingId, editingValue.trim());
      } else if (editingType === 'metric' && editingCategoryId) {
        // 更新指标名称
        await updateMetricName(editingCategoryId, editingId, editingValue.trim());
      }
      
      setEditingId(null);
      setEditingType(null);
      setEditingValue('');
      setEditingCategoryId(null);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingType(null);
    setEditingValue('');
    setEditingCategoryId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleStartEdit = (id: string, type: 'category' | 'metric', currentName: string, categoryId?: string) => {
    setEditingId(id);
    setEditingType(type);
    setEditingValue(currentName);
    if (categoryId) {
      setEditingCategoryId(categoryId);
    }
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
              指标目录
            </span>
          </div>
          
          {/* 添加按钮 - 添加目录 */}
          <button
            onClick={handleAddCategory}
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
        </div>
        
        {/* 目录树区域 */}
        <div className="pb-2">
          {loading ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">加载中...</div>
          ) : (
            <>
              {/* 显示所有目录 */}
              {categories.map((category) => (
                <div key={category.id}>
                  {/* 目录项 */}
                  <div
                    className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-700 text-sm"
                    onClick={(e) => {
                      if (editingId !== category.id) {
                        toggleCategory(category.id);
                        onCategorySelect?.(category);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-gray-400 text-xs">
                        {expandedCategories.has(category.id) ? '▼' : '▶'}
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
                      {editingId === category.id && editingType === 'category' ? (
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
                          className="text-gray-300"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(category.id, 'category', category.name);
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        ({category.metrics?.length || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* 添加指标按钮 */}
                      <button
                        className="text-gray-400 hover:text-gray-300 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMetric(category.id);
                        }}
                        title="添加指标"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-300 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 目录操作菜单
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 指标列表 */}
                  {expandedCategories.has(category.id) && category.metrics && (
                    <div className="ml-4">
                      {category.metrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="px-2 py-1.5 cursor-pointer hover:bg-gray-700 text-sm text-gray-300 flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: 打开指标详情
                          }}
                        >
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          
                          {/* 指标名称 - 可编辑 */}
                          {editingId === metric.id && editingType === 'metric' ? (
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
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(metric.id, 'metric', metric.name, category.id);
                              }}
                            >
                              {metric.name}
                            </span>
                          )}
                        </div>
                      ))}
                      
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
