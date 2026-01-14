'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryResult } from '@/contexts/QueryResultContext';
import { useTableStructure } from '@/contexts/TableStructureContext';

export function BottomPanel() {
  const { queryResult } = useQueryResult();
  const { tableStructure } = useTableStructure();
  const [activeTab, setActiveTab] = useState<'query-results' | 'table-structure' | 'case-search' | 'metric-search' | 'ai-solution-generation' | 'ai-metric-extraction' | 'temp-table-creation'>('query-results');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['xlsx', 'xls', 'json', 'csv'];
      
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setUploadedFile(file);
      } else {
        alert('不支持的文件类型。请上传 Excel (.xlsx, .xls)、JSON (.json) 或 CSV (.csv) 文件。');
        // 清空文件选择
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 当有查询结果时，自动切换到 Query results tab
  useEffect(() => {
    if (queryResult) {
      setActiveTab('query-results');
    }
  }, [queryResult]);

  // 当有表结构时，自动切换到表结构 tab
  useEffect(() => {
    if (tableStructure) {
      setActiveTab('table-structure');
    }
  }, [tableStructure]);

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
          运行结果
        </button>
        <button
          onClick={() => setActiveTab('table-structure')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'table-structure'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          表结构
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
          onClick={() => setActiveTab('metric-search')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'metric-search'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          指标搜索
        </button>
        <button
          onClick={() => setActiveTab('ai-solution-generation')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'ai-solution-generation'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          AI方案生成
        </button>
        <button
          onClick={() => setActiveTab('ai-metric-extraction')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'ai-metric-extraction'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          AI指标提取
        </button>
        <button
          onClick={() => setActiveTab('temp-table-creation')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'temp-table-creation'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          临时表创建
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'query-results' && (
          <div className="flex-1 overflow-auto p-4">
            {!queryResult ? (
              <div className="text-sm text-gray-400">
                <p>SQL 运行结果将显示在这里...</p>
                <p className="text-xs mt-2">请在 SQL 编辑器中编写 SQL 语句（SELECT、SHOW、CREATE、INSERT、UPDATE、DELETE 等）并点击运行按钮</p>
              </div>
            ) : queryResult.success ? (
              <div className="space-y-4">
                {/* 执行信息 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-green-400">
                      ✓ {queryResult.message || '执行成功'}
                    </span>
                    {queryResult.rowCount !== undefined && (
                      <span className="text-gray-400">
                        {queryResult.rowCount > 0 ? `返回 ${queryResult.rowCount} 行` : '无数据返回'}
                      </span>
                    )}
                    {queryResult.executionTime !== undefined && (
                      <span className="text-gray-400">
                        执行时间: {queryResult.executionTime.toFixed(3)} 秒
                      </span>
                    )}
                  </div>
                </div>

                {/* 结果表格 - 适用于 SELECT、SHOW TABLES 等返回数据的语句 */}
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
                  // 对于 DDL 语句（CREATE TABLE、ALTER TABLE 等）和 DML 语句（INSERT、UPDATE、DELETE），只显示消息
                  queryResult.message && (
                    <div className="text-sm text-gray-300 bg-gray-700 rounded p-3">
                      {queryResult.message}
                    </div>
                  )
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

        {activeTab === 'table-structure' && (
          <div className="flex-1 overflow-auto p-4">
            {!tableStructure ? (
              <div className="text-sm text-gray-400">
                <p>表结构将显示在这里...</p>
                <p className="text-xs mt-2">请在右侧数据库面板中选择数据库和表，然后点击"查看表结构"按钮</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 表信息 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300 font-medium">
                      {tableStructure.database}
                      {tableStructure.schema && `.${tableStructure.schema}`}
                      {`.${tableStructure.table}`}
                    </span>
                    <span className="text-gray-400">
                      {tableStructure.columns.length} 个字段
                    </span>
                  </div>
                </div>

                {/* 表结构表格 */}
                {tableStructure.columns.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-600 bg-gray-700">
                          <th className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700">
                            字段名
                          </th>
                          <th className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700">
                            类型
                          </th>
                          <th className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700">
                            可空
                          </th>
                          <th className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700">
                            默认值
                          </th>
                          <th className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700">
                            键
                          </th>
                          <th className="text-left py-2 px-3 text-gray-300 font-medium sticky top-0 bg-gray-700">
                            备注
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableStructure.columns.map((column, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-700 hover:bg-gray-750"
                          >
                            <td className="py-2 px-3 text-gray-300 font-medium">
                              {column.field}
                            </td>
                            <td className="py-2 px-3 text-gray-400">
                              {column.type}
                            </td>
                            <td className="py-2 px-3 text-gray-400">
                              {column.nullable ? (
                                <span className="text-yellow-400">是</span>
                              ) : (
                                <span className="text-red-400">否</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-gray-400">
                              {column.default !== null && column.default !== undefined ? (
                                <span className="text-gray-300">{String(column.default)}</span>
                              ) : (
                                <span className="text-gray-500 italic">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-gray-400">
                              {column.key ? (
                                <span className="px-2 py-0.5 bg-blue-600 text-blue-100 rounded text-xs">
                                  {column.key}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-gray-400">
                              {column.comment ? (
                                <span className="text-gray-300">{column.comment}</span>
                              ) : (
                                <span className="text-gray-500 italic">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
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

        {activeTab === 'metric-search' && (
          <div className="flex-1 p-4 text-sm text-gray-400">
            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索指标..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-gray-400">
              {/* TODO: 指标搜索结果列表 */}
              <p>指标搜索结果将显示在这里...</p>
            </div>
          </div>
        )}

        {activeTab === 'ai-solution-generation' && (
          <div className="flex-1 p-4 text-sm text-gray-400">
            <div className="mb-4">
              <textarea
                placeholder="输入您的需求，AI 将为您生成解决方案..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
            <div className="text-gray-400">
              {/* TODO: AI 方案生成结果 */}
              <p>AI 方案生成结果将显示在这里...</p>
            </div>
          </div>
        )}

        {activeTab === 'ai-metric-extraction' && (
          <div className="flex-1 p-4 text-sm text-gray-400">
            <div className="mb-4">
              <textarea
                placeholder="输入您的需求或SQL语句，AI 将为您提取指标..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
            <div className="text-gray-400">
              {/* TODO: AI 指标提取结果 */}
              <p>AI 指标提取结果将显示在这里...</p>
            </div>
          </div>
        )}

        {activeTab === 'temp-table-creation' && (
          <div className="flex-1 p-4 text-sm text-gray-400">
            <div className="space-y-4">
              {/* 文件上传区域 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  上传文件
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-gray-600 rounded hover:border-blue-500 hover:bg-gray-750 transition-colors flex items-center justify-center gap-2 text-gray-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>点击上传文件（支持 Excel、JSON、CSV）</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  支持的文件格式：.xlsx, .xls, .json, .csv
                </p>
              </div>

              {/* 已上传文件信息 */}
              {uploadedFile && (
                <div className="p-4 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400"
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
                      <span className="text-gray-300 font-medium">{uploadedFile.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>文件大小: {formatFileSize(uploadedFile.size)}</div>
                    <div>文件类型: {uploadedFile.type || uploadedFile.name.split('.').pop()?.toUpperCase()}</div>
                  </div>
                </div>
              )}

              {/* 表名输入 */}
              {uploadedFile && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    临时表名
                  </label>
                  <input
                    type="text"
                    placeholder="请输入临时表名..."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* 创建按钮 */}
              {uploadedFile && (
                <button
                  className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
                  创建临时表
                </button>
              )}

              {/* 提示信息 */}
              {!uploadedFile && (
                <div className="text-xs text-gray-500 mt-4">
                  <p>• 上传 Excel、JSON 或 CSV 文件后，系统将自动解析文件内容</p>
                  <p className="mt-1">• 您可以为临时表指定一个名称</p>
                  <p className="mt-1">• 创建后，临时表将可以在 SQL 查询中使用</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
