'use client';

import { useState } from 'react';
import { Metric, MetricCategory } from '@/types/metrics';

interface MetricsListProps {
  categories?: MetricCategory[];
  onMetricClick?: (metric: Metric) => void;
  onAddCategory?: () => void;
  onAddMetric?: () => void;
}

const mockCategories: MetricCategory[] = [
  {
    id: '1',
    name: '用户指标',
    metrics: [
      {
        id: '1',
        name: '日活跃用户数',
        description: '统计每日活跃用户数量',
        category: '用户指标',
        status: 'active',
        updatedAt: '2024-01-15',
      },
    ],
  },
  {
    id: '2',
    name: '业务指标',
    metrics: [
      {
        id: '2',
        name: '订单转化率',
        description: '计算订单转化率',
        category: '业务指标',
        status: 'active',
        updatedAt: '2024-01-14',
      },
      {
        id: '3',
        name: 'GMV',
        description: '总交易额',
        category: '业务指标',
        status: 'draft',
        updatedAt: '2024-01-13',
      },
    ],
  },
];

export function MetricsList({
  categories = mockCategories,
  onMetricClick,
  onAddCategory,
  onAddMetric,
}: MetricsListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((cat) => cat.id))
  );
  const [showAddMenu, setShowAddMenu] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* 居中布局的目录树 */}
      <div className="flex justify-center items-start min-h-full py-8">
        <div className="w-full max-w-4xl px-4">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-lg">
                {/* 目录标题 */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedCategories.has(category.id) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                    <span className="text-sm font-medium text-gray-200">{category.name}</span>
                    <span className="text-xs text-gray-500">({category.metrics?.length || 0})</span>
                  </div>
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

                {/* 指标列表 */}
                {expandedCategories.has(category.id) && (
                  <div className="border-t border-gray-700">
                    {(category.metrics || []).map((metric) => (
                      <div
                        key={metric.id}
                        onClick={() => onMetricClick?.(metric)}
                        className="px-4 py-3 hover:bg-gray-750 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-white">{metric.name}</h3>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  metric.status === 'active'
                                    ? 'bg-green-900 text-green-300'
                                    : 'bg-gray-700 text-gray-400'
                                }`}
                              >
                                {metric.status === 'active' ? '已发布' : '草稿'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{metric.description}</p>
                            <span className="text-xs text-gray-500">
                              更新于 {metric.updatedAt}
                            </span>
                          </div>
                          <button
                            className="text-gray-400 hover:text-gray-300 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 指标操作菜单
                            }}
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
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 浮动添加按钮 */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          {/* 添加菜单 */}
          {showAddMenu && (
            <div className="absolute bottom-16 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[160px]">
              <button
                onClick={() => {
                  onAddCategory?.();
                  setShowAddMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                添加目录
              </button>
              <div className="h-px bg-gray-700"></div>
              <button
                onClick={() => {
                  onAddMetric?.();
                  setShowAddMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                添加指标
              </button>
            </div>
          )}

          {/* 主添加按钮 */}
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          >
            <svg
              className={`w-6 h-6 transition-transform ${showAddMenu ? 'rotate-45' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
}
