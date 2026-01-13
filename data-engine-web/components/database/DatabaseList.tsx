'use client';

import { useState, useEffect } from 'react';
import { getDatabaseConnections, deleteDatabaseConnection, type DatabaseConnection } from '@/lib/api/database';
import { AddDatabaseModal } from './AddDatabaseModal';

export function DatabaseList() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await getDatabaseConnections();
      setConnections(data);
    } catch (error) {
      console.error('Failed to load database connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个数据库连接吗？')) {
      return;
    }

    try {
      await deleteDatabaseConnection(id);
      await loadConnections();
    } catch (error) {
      console.error('Failed to delete connection:', error);
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleEdit = (connection: DatabaseConnection) => {
    setEditingConnection(connection);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingConnection(null);
    loadConnections();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-100">数据库连接</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + 添加数据库
        </button>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>还没有数据库连接</p>
          <p className="text-sm mt-2">点击"添加数据库"按钮创建第一个连接</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-100">{connection.name}</h3>
                <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                  {connection.dbType.toUpperCase()}
                </span>
              </div>

              {connection.description && (
                <p className="text-sm text-gray-400 mb-3">{connection.description}</p>
              )}

              <div className="space-y-1 text-sm text-gray-400">
                {connection.host && (
                  <div>
                    <span className="text-gray-500">主机:</span> {connection.host}
                    {connection.port && `:${connection.port}`}
                  </div>
                )}
                {connection.database && (
                  <div>
                    <span className="text-gray-500">数据库:</span> {connection.database}
                  </div>
                )}
                {connection.username && (
                  <div>
                    <span className="text-gray-500">用户:</span> {connection.username}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(connection)}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(connection.id)}
                  className="flex-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddDatabaseModal
          connection={editingConnection}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

