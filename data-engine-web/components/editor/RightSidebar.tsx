'use client';

import { useState } from 'react';
import { useEditor } from '@/hooks/useEditor';

export function RightSidebar() {
  const { selectedFile } = useEditor();
  const [activeTab, setActiveTab] = useState<'outline' | 'documentation'>('outline');
  const [requester, setRequester] = useState('');
  const [requirement, setRequirement] = useState('');

  const handleSearchCase = () => {
    // TODO: 实现案例搜索功能
    console.log('搜索案例');
  };

  const handleAIPrompt = () => {
    // TODO: 实现 AI 提示功能
    console.log('AI 提示:', { requester, requirement });
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

            {/* 按钮组 - 一行显示 */}
            <div className="flex items-center gap-2">
              {/* 案例搜索按钮 */}
              <button
                onClick={handleSearchCase}
                className="flex-1 px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                案例搜索
              </button>

              {/* AI提示按钮 */}
              <button
                onClick={handleAIPrompt}
                className="flex-1 px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI 提示
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
