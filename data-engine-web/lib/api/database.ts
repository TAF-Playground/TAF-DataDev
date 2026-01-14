// 数据库连接管理 API

export interface DatabaseConnection {
  id: string;
  name: string;
  dbType: string; // mysql, postgresql, sqlite, etc.
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string; // 仅在创建/更新时使用
  connectionString?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 获取所有数据库连接
export function getDatabaseConnections(): Promise<DatabaseConnection[]> {
  return fetch(`${API_BASE_URL}/database/connections`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to fetch database connections:', error);
      return [];
    });
}

// 创建数据库连接
export function createDatabaseConnection(
  connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DatabaseConnection> {
  return fetch(`${API_BASE_URL}/database/connections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(connection),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to create database connection:', error);
      throw error;
    });
}

// 更新数据库连接
export function updateDatabaseConnection(
  connectionId: string,
  connection: Partial<Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<DatabaseConnection> {
  return fetch(`${API_BASE_URL}/database/connections/${connectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(connection),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to update database connection:', error);
      throw error;
    });
}

// 删除数据库连接
export function deleteDatabaseConnection(connectionId: string): Promise<void> {
  return fetch(`${API_BASE_URL}/database/connections/${connectionId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(() => {
      // 删除成功
    })
    .catch(error => {
      console.error('Failed to delete database connection:', error);
      throw error;
    });
}

// 测试数据库连接
export function testDatabaseConnection(
  connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message: string }> {
  return fetch(`${API_BASE_URL}/database/connections/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(connection),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to test database connection:', error);
      throw error;
    });
}

// 执行 SQL 查询
export interface ExecuteSQLResult {
  success: boolean;
  columns?: string[];
  rows?: any[][];
  rowCount?: number;
  executionTime?: number;
  message?: string;
  error?: string;
}

export function executeSQL(
  connectionId: string,
  sql: string
): Promise<ExecuteSQLResult> {
  return fetch(`${API_BASE_URL}/database/connections/${connectionId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to execute SQL:', error);
      throw error;
    });
}


// 获取数据库列表
export function getDatabases(connectionId: string): Promise<string[]> {
  return fetch(`${API_BASE_URL}/database/connections/${connectionId}/databases`)
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => data.databases || [])
    .catch(error => {
      console.error('Failed to fetch databases:', error);
      throw error;
    });
}

// 获取表列表
export function getTables(
  connectionId: string,
  database?: string,
  schema?: string
): Promise<string[]> {
  const params = new URLSearchParams();
  if (database) params.append('database', database);
  if (schema) params.append('schema', schema);
  
  return fetch(`${API_BASE_URL}/database/connections/${connectionId}/tables?${params.toString()}`)
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => data.tables || [])
    .catch(error => {
      console.error('Failed to fetch tables:', error);
      throw error;
    });
}

// 表结构列信息
export interface TableColumn {
  field: string;
  type: string;
  nullable: boolean;
  default: string | null;
  comment: string;
  key: string;
  extra: string;
}

// 表结构信息
export interface TableStructure {
  database: string;
  schema?: string;
  table: string;
  columns: TableColumn[];
}

// 获取表结构
export function getTableStructure(
  connectionId: string,
  table: string,
  database?: string,
  schema?: string
): Promise<TableStructure> {
  const params = new URLSearchParams();
  params.append('table', table);
  if (database) params.append('database', database);
  if (schema) params.append('schema', schema);
  
  return fetch(`${API_BASE_URL}/database/connections/${connectionId}/table-structure?${params.toString()}`)
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to fetch table structure:', error);
      throw error;
    });
}
