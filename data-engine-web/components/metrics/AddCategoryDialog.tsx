'use client';

import { useState } from 'react';

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}

export function AddCategoryDialog({ isOpen, onClose, onConfirm }: AddCategoryDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('目录名称不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm(name.trim());
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
        onClick={onClose}
      />
      
      {/* 对话框 */}
      <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
        <div
          className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">添加目录</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                目录名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                placeholder="请输入目录名称"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '创建中...' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
