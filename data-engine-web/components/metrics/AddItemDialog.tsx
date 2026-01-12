'use client';

import { useState, useEffect } from 'react';
import { MetricCategory } from '@/types/metrics';

type ItemType = 'category' | 'metric' | null;

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCategory: (name: string) => Promise<void>;
  onConfirmMetric: (categoryId: string, metric: { name: string; description: string }) => Promise<void>;
  categories: MetricCategory[];
}

export function AddItemDialog({
  isOpen,
  onClose,
  onConfirmCategory,
  onConfirmMetric,
  categories,
}: AddItemDialogProps) {
  const [itemType, setItemType] = useState<ItemType>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 当对话框打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setItemType(null);
      setName('');
      setDescription('');
      setSelectedCategoryId('');
      setError('');
    }
  }, [isOpen]);

  // 当选择指标类型时，默认选择第一个目录
  useEffect(() => {
    if (itemType === 'metric' && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [itemType, categories, selectedCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemType) {
      setError('请选择要添加的类型');
      return;
    }

    if (!name.trim()) {
      setError(`${itemType === 'category' ? '目录' : '指标'}名称不能为空`);
      return;
    }

    if (itemType === 'metric') {
      if (!selectedCategoryId) {
        setError('请选择目录');
        return;
      }
      if (!description.trim()) {
        setError('指标描述不能为空');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      if (itemType === 'category') {
        await onConfirmCategory(name.trim());
      } else {
        await onConfirmMetric(selectedCategoryId, {
          name: name.trim(),
          description: description.trim(),
        });
      }
      setName('');
      setDescription('');
      setSelectedCategoryId('');
      setItemType(null);
      onClose();
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setItemType(null);
      setName('');
      setDescription('');
      setSelectedCategoryId('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 - 带淡入动画 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Drawer - 从右侧滑出 */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-gray-800 border-l border-gray-700 shadow-2xl z-[101] transform transition-transform duration-300 ease-out translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">添加</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 内容区域 - 可滚动 */}
        <div className="h-[calc(100%-73px)] overflow-y-auto scrollbar-custom">
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* 类型选择 */}
            {!itemType && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  选择类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setItemType('category')}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span>目录</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemType('metric')}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>指标</span>
                  </button>
                </div>
              </div>
            )}

            {/* 输入表单 */}
            {itemType && (
              <>
                {/* 返回按钮 */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setItemType(null);
                      setName('');
                      setDescription('');
                      setSelectedCategoryId('');
                      setError('');
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回选择类型
                  </button>
                </div>

                {/* 指标：目录选择 */}
                {itemType === 'metric' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      选择目录
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        setError('');
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                      required
                    >
                      {categories.length === 0 ? (
                        <option value="">暂无目录，请先创建目录</option>
                      ) : (
                        <>
                          <option value="">请选择目录</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* 名称输入 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {itemType === 'category' ? '目录名称' : '指标名称'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                    placeholder={`请输入${itemType === 'category' ? '目录' : '指标'}名称`}
                    autoFocus
                    required
                  />
                </div>

                {/* 指标：描述输入 */}
                {itemType === 'metric' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      指标描述
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setError('');
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="请输入指标描述"
                      rows={3}
                      required
                    />
                  </div>
                )}

                {error && (
                  <div className="mb-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </>
            )}
            
            {/* 底部操作按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                disabled={loading}
              >
                取消
              </button>
              {itemType && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50 transition-colors"
                  disabled={loading}
                >
                  {loading ? '创建中...' : '确定'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
