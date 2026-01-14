'use client';

import { useState, useEffect } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useTableStructure } from '@/contexts/TableStructureContext';
import { updateProjectDetails } from '@/lib/api/files';
import { getDatabaseConnections, type DatabaseConnection, getDatabases, getTables, getTableStructure } from '@/lib/api/database';

export function RightSidebar() {
  const { selectedFile, projectDetails, refreshProjectDetails } = useEditor();
  const { selectedDatabase, setSelectedDatabase } = useDatabase();
  const { setTableStructure } = useTableStructure();
  const [activeTab, setActiveTab] = useState<'outline' | 'database'>('outline');
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [requester, setRequester] = useState('');
  const [requirement, setRequirement] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // 数据库选择相关状态
  const [selectedDatabaseName, setSelectedDatabaseName] = useState<string>('');
  const [databaseList, setDatabaseList] = useState<string[]>([]);
  const [loadingDatabasesList, setLoadingDatabasesList] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableList, setTableList] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingTableStructure, setLoadingTableStructure] = useState(false);

  // 加载数据库连接列表
  useEffect(() => {
    const loadDatabases = async () => {
      try {
        setLoadingDatabases(true);
        const data = await getDatabaseConnections();
        setDatabases(data);
      } catch (error) {
        console.error('Failed to load databases:', error);
      } finally {
        setLoadingDatabases(false);
      }
    };
    loadDatabases();
  }, []);

  // 当选择数据库连接时，加载数据库列表
  useEffect(() => {
    const loadDatabaseList = async () => {
      if (!selectedDatabase) {
        setDatabaseList([]);
        setSelectedDatabaseName('');
        setTableList([]);
        setSelectedTable('');
        return;
      }

      try {
        setLoadingDatabasesList(true);
        const dbs = await getDatabases(selectedDatabase.id);
        setDatabaseList(dbs);
        // 如果有默认数据库，自动选择
        if (selectedDatabase.database && dbs.includes(selectedDatabase.database)) {
          setSelectedDatabaseName(selectedDatabase.database);
        } else if (dbs.length > 0) {
          setSelectedDatabaseName(dbs[0]);
        } else {
          setSelectedDatabaseName('');
        }
      } catch (error) {
        console.error('Failed to load database list:', error);
        setDatabaseList([]);
        setSelectedDatabaseName('');
      } finally {
        setLoadingDatabasesList(false);
      }
    };

    loadDatabaseList();
  }, [selectedDatabase]);

  // 当选择数据库时，加载表列表
  useEffect(() => {
    const loadTableList = async () => {
      if (!selectedDatabase || !selectedDatabaseName) {
        setTableList([]);
        setSelectedTable('');
        return;
      }

      try {
        setLoadingTables(true);
        const tables = await getTables(selectedDatabase.id, selectedDatabaseName);
        setTableList(tables);
        setSelectedTable('');
      } catch (error) {
        console.error('Failed to load table list:', error);
        setTableList([]);
        setSelectedTable('');
      } finally {
        setLoadingTables(false);
      }
    };

    loadTableList();
  }, [selectedDatabase, selectedDatabaseName]);

  // 查看表结构
  const handleViewTableStructure = async () => {
    if (!selectedDatabase || !selectedDatabaseName || !selectedTable) {
      alert('请先选择引擎、库和表');
      return;
    }

    try {
      setLoadingTableStructure(true);
      const structure = await getTableStructure(
        selectedDatabase.id,
        selectedTable,
        selectedDatabaseName
      );
      setTableStructure(structure);
    } catch (error) {
      console.error('Failed to load table structure:', error);
      alert('获取表结构失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoadingTableStructure(false);
    }
  };

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
          需求录入
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'database'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          执行引擎
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

        {activeTab === 'database' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                选择引擎
              </label>
              {loadingDatabases ? (
                <div className="text-sm text-gray-400">加载中...</div>
              ) : databases.length === 0 ? (
                <div className="text-sm text-gray-400">
                  <p>还没有数据库连接</p>
                  <p className="text-xs mt-1">请前往数据库页面添加连接</p>
                </div>
              ) : (
                <select
                  value={selectedDatabase?.id || ''}
                  onChange={(e) => {
                    const db = databases.find(d => d.id === e.target.value);
                    setSelectedDatabase(db || null);
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- 请选择引擎 --</option>
                  {databases.map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.name} ({db.dbType.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedDatabase && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="text-sm text-gray-300 mb-2">
                    <div className="font-medium">{selectedDatabase.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {selectedDatabase.dbType.toUpperCase()}
                      {selectedDatabase.host && ` • ${selectedDatabase.host}`}
                      {selectedDatabase.database && ` • ${selectedDatabase.database}`}
                    </div>
                  </div>
                  {selectedDatabase.description && (
                    <div className="text-xs text-gray-400 mt-2">
                      {selectedDatabase.description}
                    </div>
                  )}
                </div>

                {/* 查看库 */}
                {selectedDatabase.dbType !== 'sqlite' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      查看库
                    </label>
                    {loadingDatabasesList ? (
                      <div className="text-sm text-gray-400">加载中...</div>
                    ) : (
                      <select
                        value={selectedDatabaseName}
                        onChange={(e) => setSelectedDatabaseName(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- 请查看库 --</option>
                        {databaseList.map((db) => (
                          <option key={db} value={db}>
                            {db}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* 查看表 */}
                {(selectedDatabase.dbType === 'sqlite' || selectedDatabaseName) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      查看表
                    </label>
                    {loadingTables ? (
                      <div className="text-sm text-gray-400">加载中...</div>
                    ) : (
                      <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- 请查看表 --</option>
                        {tableList.map((table) => (
                          <option key={table} value={table}>
                            {table}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* 查看表结构按钮 */}
                {selectedTable && (
                  <button
                    onClick={handleViewTableStructure}
                    disabled={loadingTableStructure}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {loadingTableStructure ? '加载中...' : '查看表结构'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
