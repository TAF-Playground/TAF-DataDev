'use client';

import { useState, useEffect } from 'react';
import { createDatabaseConnection, updateDatabaseConnection, testDatabaseConnection, type DatabaseConnection } from '@/lib/api/database';

interface AddDatabaseModalProps {
  connection?: DatabaseConnection | null;
  onClose: () => void;
}

const DB_TYPES = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sqlserver', label: 'SQL Server' },
];

export function AddDatabaseModal({ connection, onClose }: AddDatabaseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    dbType: 'mysql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    connectionString: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (connection) {
      // SQLite 特殊处理：文件路径可能在 database 或 connectionString 字段
      const isSqlite = connection.dbType === 'sqlite';
      const filePath = connection.database || connection.connectionString || '';
      
      setFormData({
        name: connection.name || '',
        dbType: connection.dbType || 'mysql',
        host: connection.host || '',
        port: connection.port?.toString() || '',
        database: isSqlite ? filePath : (connection.database || ''),
        username: connection.username || '',
        password: '', // 不显示密码
        connectionString: isSqlite ? filePath : (connection.connectionString || ''),
        description: connection.description || '',
      });
    }
  }, [connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData: any = {
        name: formData.name.trim(),
        dbType: formData.dbType,
      };

      // SQLite 特殊处理：只需要文件路径
      if (formData.dbType === 'sqlite') {
        const filePath = formData.database || formData.connectionString;
        if (!filePath || !filePath.trim()) {
          setError('SQLite 数据库文件路径不能为空');
          setLoading(false);
          return;
        }
        submitData.database = filePath.trim();
        submitData.connectionString = filePath.trim();
      } else {
        // 其他数据库类型
        if (formData.host) submitData.host = formData.host.trim();
        if (formData.port) submitData.port = parseInt(formData.port, 10);
        if (formData.database) submitData.database = formData.database.trim();
        if (formData.username) submitData.username = formData.username.trim();
        if (formData.password) submitData.password = formData.password;
        if (formData.connectionString) submitData.connectionString = formData.connectionString.trim();
      }
      
      if (formData.description) submitData.description = formData.description.trim();

      if (connection) {
        await updateDatabaseConnection(connection.id, submitData);
      } else {
        await createDatabaseConnection(submitData);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除之前的测试结果
    if (testResult) {
      setTestResult(null);
    }
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    setError('');
    setTesting(true);

    try {
      const testData: any = {
        dbType: formData.dbType,
      };

      // SQLite 特殊处理
      if (formData.dbType === 'sqlite') {
        const filePath = formData.database || formData.connectionString;
        if (!filePath || !filePath.trim()) {
          setError('SQLite 数据库文件路径不能为空');
          setTesting(false);
          return;
        }
        testData.database = filePath.trim();
        testData.connectionString = filePath.trim();
      } else {
        // 其他数据库类型
        if (formData.host) testData.host = formData.host.trim();
        if (formData.port) testData.port = parseInt(formData.port, 10);
        if (formData.database) testData.database = formData.database.trim();
        if (formData.username) testData.username = formData.username.trim();
        if (formData.password) testData.password = formData.password;
        if (formData.connectionString) testData.connectionString = formData.connectionString.trim();
      }

      const result = await testDatabaseConnection(testData);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : '测试失败'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-100">
              {connection ? '编辑数据库连接' : '添加数据库连接'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 text-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                连接名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                数据库类型 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.dbType}
                onChange={(e) => handleChange('dbType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                required
              >
                {DB_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SQLite 只需要文件路径 */}
            {formData.dbType === 'sqlite' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  数据库文件路径 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.database || formData.connectionString}
                  onChange={(e) => {
                    handleChange('database', e.target.value);
                    handleChange('connectionString', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="/path/to/database.db 或 ./data.db"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  SQLite 是文件型数据库，只需要提供数据库文件的路径
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">主机地址</label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => handleChange('host', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">端口</label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={(e) => handleChange('port', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                      placeholder="3306"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">数据库名</label>
                  <input
                    type="text"
                    value={formData.database}
                    onChange={(e) => handleChange('database', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">用户名</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {connection ? '新密码（留空不修改）' : '密码'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 非 SQLite 数据库显示连接字符串选项 */}
            {formData.dbType !== 'sqlite' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">连接字符串（可选）</label>
                <input
                  type="text"
                  value={formData.connectionString}
                  onChange={(e) => handleChange('connectionString', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="mysql://user:pass@host:port/db"
                />
                <p className="mt-1 text-xs text-gray-500">
                  如果填写了连接字符串，将优先使用连接字符串，忽略上面的单独配置
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="数据库连接描述..."
              />
            </div>

            {/* 测试连接结果 */}
            {testResult && (
              <div className={`p-3 rounded ${
                testResult.success 
                  ? 'bg-green-900 bg-opacity-50 border border-green-700 text-green-200' 
                  : 'bg-red-900 bg-opacity-50 border border-red-700 text-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors disabled:opacity-50"
                disabled={loading || testing}
              >
                {testing ? '测试中...' : '测试连接'}
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                  disabled={loading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? '保存中...' : connection ? '更新' : '创建'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

