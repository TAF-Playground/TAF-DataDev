'use client';

import { useState, useEffect } from 'react';
import { useQueryResult } from '@/contexts/QueryResultContext';
import { SchemaData, SchemaField } from '@/types';

export function BottomPanel() {
  const { queryResult } = useQueryResult();
  const [activeTab, setActiveTab] = useState<'query-results' | 'schemas' | 'case-search' | 'ai-prompt'>('schemas');

  // 当有查询结果时，自动切换到 Query results tab
  useEffect(() => {
    if (queryResult) {
      setActiveTab('query-results');
    }
  }, [queryResult]);
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    new Set(['datafrom_demo'])
  );
  const [visibleSchemas, setVisibleSchemas] = useState<Set<string>>(
    new Set(['dataform_demo.dataset_1'])
  );

  const toggleSchema = (schema: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schema)) {
      newExpanded.delete(schema);
    } else {
      newExpanded.add(schema);
    }
    setExpandedSchemas(newExpanded);
  };

  const schemaData: SchemaData[] = [
    {
      schema: 'datafrom_demo',
      datasets: [
        'dataset_1',
        'dataset_5_from_script_builder',
        'dataset_3_incremental_date',
        'dataset_4_incremental_snapshot',
        'reporting_gb',
      ],
    },
    {
      schema: 'datafrom_set2',
      datasets: [],
    },
  ];

  const schemaFields: SchemaField[] = [
    { field: 'date', type: 'date' },
    { field: 'device_type', type: 'character varying' },
    { field: 'country', type: 'character varying' },
    { field: 'sessions', type: 'integer' },
    { field: 'revenue', type: 'integer' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-800 border-t border-gray-600">
      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('query-results')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'query-results'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Query results
        </button>
        <button
          onClick={() => setActiveTab('schemas')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'schemas'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Schemas
        </button>
        <button
          onClick={() => setActiveTab('case-search')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'case-search'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          案例搜索
        </button>
        <button
          onClick={() => setActiveTab('ai-prompt')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'ai-prompt'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          AI 提示
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'query-results' && (
          <div className="flex-1 overflow-auto p-4">
            {!queryResult ? (
              <div className="text-sm text-gray-400">
                <p>查询结果将显示在这里...</p>
                <p className="text-xs mt-2">请在 SQL 编辑器中编写 SQL 并点击运行按钮</p>
              </div>
            ) : queryResult.success ? (
              <div className="space-y-4">
                {/* 查询信息 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-green-400">
                      ✓ {queryResult.message || '查询成功'}
                    </span>
                    {queryResult.rowCount !== undefined && (
                      <span className="text-gray-400">
                        返回 {queryResult.rowCount} 行
                      </span>
                    )}
                    {queryResult.executionTime !== undefined && (
                      <span className="text-gray-400">
                        执行时间: {queryResult.executionTime} 秒
                      </span>
                    )}
                  </div>
                </div>

                {/* 查询结果表格 */}
                {queryResult.columns && queryResult.columns.length > 0 && queryResult.rows ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-600 bg-gray-700">
                          {queryResult.columns.map((col, index) => (
                            <th
                              key={index}
                              className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={queryResult.columns.length}
                              className="py-8 text-center text-gray-400"
                            >
                              没有数据
                            </td>
                          </tr>
                        ) : (
                          queryResult.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-b border-gray-700 hover:bg-gray-750"
                            >
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="py-2 px-3 text-gray-300"
                                >
                                  {cell === null || cell === undefined ? (
                                    <span className="text-gray-500 italic">NULL</span>
                                  ) : (
                                    String(cell)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    {queryResult.message || '执行成功，但没有返回数据'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm">
                <div className="p-3 bg-red-900 bg-opacity-50 border border-red-700 text-red-200 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{queryResult.error || queryResult.message || '执行失败'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schemas' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Schema tree */}
            <div className="w-64 border-r border-gray-600 overflow-y-auto p-4 bg-gray-850">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300">Schemas</h3>
                <button className="text-gray-400 hover:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                {schemaData.map((item) => (
                  <div key={item.schema}>
                    <button
                      onClick={() => toggleSchema(item.schema)}
                      className="flex items-center gap-2 w-full text-left text-sm text-gray-300 hover:text-white py-1"
                    >
                      <svg
                        className={`w-3 h-3 transition-transform ${
                          expandedSchemas.has(item.schema) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{item.schema}</span>
                    </button>
                    {expandedSchemas.has(item.schema) && (
                      <div className="ml-4 space-y-1">
                        {item.datasets.map((dataset) => (
                          <div
                            key={dataset}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 py-0.5"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span>{dataset}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Schema details */}
            <div className="flex-1 overflow-y-auto p-4">
              {visibleSchemas.has('dataform_demo.dataset_1') && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">dataform_demo.dataset_1</span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-600 text-gray-300 rounded">
                        view
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newVisible = new Set(visibleSchemas);
                        newVisible.delete('dataform_demo.dataset_1');
                        setVisibleSchemas(newVisible);
                      }}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Field</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schemaFields.map((field, index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="py-2 px-3 text-gray-300">{field.field}</td>
                            <td className="py-2 px-3 text-gray-400">{field.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'case-search' && (
          <div className="flex-1 p-4 text-sm text-gray-400">
            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索案例..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-gray-400">
              {/* TODO: 案例搜索结果列表 */}
              <p>案例搜索结果将显示在这里...</p>
            </div>
          </div>
        )}

        {activeTab === 'ai-prompt' && (
          <div className="flex-1 p-4 text-sm text-gray-400">
            <div className="mb-4">
              <textarea
                placeholder="输入您的需求，AI 将为您提供提示..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
            <div className="text-gray-400">
              {/* TODO: AI 提示结果 */}
              <p>AI 提示结果将显示在这里...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
