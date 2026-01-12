'use client';

import { useState, useEffect } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { updateProjectDetails } from '@/lib/api/files';

export function RightSidebar() {
  const { selectedFile, projectDetails, refreshProjectDetails } = useEditor();
  const [activeTab, setActiveTab] = useState<'outline' | 'documentation'>('outline');
  const [requester, setRequester] = useState('');
  const [requirement, setRequirement] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 当项目详情或选中文件改变时，更新表单
  useEffect(() => {
    if (projectDetails) {
      setRequester(projectDetails.requester || '');
      setRequirement(projectDetails.requirementDescription || '');
    } else {
      setRequester('');
      setRequirement('');
    }
  }, [projectDetails, selectedFile]);

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('请先选择一个项目');
      return;
    }

    try {
      setIsSaving(true);
      await updateProjectDetails(selectedFile, {
        requester: requester.trim(),
        requirementDescription: requirement.trim(),
      });
      await refreshProjectDetails();
      alert('保存成功');
    } catch (error) {
      console.error('Failed to save project details:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-800 border-l border-gray-600">
      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('outline')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'outline'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Outline
        </button>
        <button
          onClick={() => setActiveTab('documentation')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'documentation'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Documentation
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'outline' && (
          <div className="space-y-4">
            {/* 需求名称显示（只读，项目名称） */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                需求名称
              </label>
              <input
                type="text"
                value={projectDetails?.requirementName || '未设置'}
                readOnly
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                placeholder="需求名称（项目名称）"
              />
            </div>

            {/* 需求方输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                需求方
              </label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                placeholder="请输入需求方"
              />
            </div>

            {/* 需求描述输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                需求描述
              </label>
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="请输入需求描述"
                rows={6}
              />
            </div>

            {/* 提交按钮 */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSaving || !selectedFile}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {isSaving ? '保存中...' : '提交'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="text-sm text-gray-400">
            <p>Documentation content goes here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
