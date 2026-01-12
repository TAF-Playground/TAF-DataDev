// 文件/目录管理 API

export interface ProjectDetails {
  requirementName?: string; // 需求名称（项目名称）
  requirementDescription?: string; // 需求描述
  requester?: string; // 需求方
  sql?: string; // SQL内容
  creator?: string; // 创建人
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  parentId?: string;
  children?: FileItem[];
  content?: string; // 保留用于向后兼容
  // 项目详情（仅用于type='file'的项目）
  projectDetails?: ProjectDetails;
  createdAt?: string;
  updatedAt?: string;
}

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 临时保留用于尚未迁移到 API 的函数
const STORAGE_KEY = 'workspace_files';
const initialData: FileItem[] = [];

// 获取所有文件和目录
export function getFiles(): Promise<FileItem[]> {
  return fetch(`${API_BASE_URL}/editor/files`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to fetch files:', error);
      // 返回空数组作为降级
      return [];
    });
}

// 创建目录
export function createDirectory(name: string, parentId?: string): Promise<FileItem> {
  if (!name || name.trim() === '') {
    return Promise.reject(new Error('目录名称不能为空'));
  }

  return fetch(`${API_BASE_URL}/editor/directories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
      parentId: parentId || null,
    }),
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
      console.error('Failed to create directory:', error);
      throw error;
    });
}

// 创建文件（项目）
export function createFile(name: string, parentId?: string): Promise<FileItem> {
  if (!name || name.trim() === '') {
    return Promise.reject(new Error('项目名称不能为空'));
  }

  return fetch(`${API_BASE_URL}/editor/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
      parentId: parentId || null,
      creator: '当前用户', // TODO: 从用户上下文获取实际创建人
    }),
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
      console.error('Failed to create project:', error);
      throw error;
    });
}

// 更新文件/目录名称
export function updateItemName(itemId: string, name: string): Promise<void> {
  if (!name || name.trim() === '') {
    return Promise.reject(new Error('名称不能为空'));
  }

  // 先获取文件列表，判断是目录还是项目
  return getFiles()
    .then(files => {
      const item = findItemById(files, itemId);
      if (!item) {
        throw new Error('项目不存在');
      }

      const trimmedName = name.trim();
      
      // 根据类型调用不同的API
      if (item.type === 'directory') {
        return fetch(`${API_BASE_URL}/editor/directories/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        });
      } else {
        return fetch(`${API_BASE_URL}/editor/projects/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        });
      }
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
      // 更新成功，不需要返回值
    })
    .catch(error => {
      console.error('Failed to update item name:', error);
      throw error;
    });
}

// 删除文件/目录
export function deleteItem(itemId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const removed = removeItemById(data, itemId);
    if (removed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } else {
      reject(new Error('项目不存在'));
    }
  });
}

// 辅助函数：根据ID查找项目
function findItemById(items: FileItem[], id: string): FileItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// 辅助函数：根据ID删除项目
function removeItemById(items: FileItem[], id: string): boolean {
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    return true;
  }
  for (const item of items) {
    if (item.children && removeItemById(item.children, id)) {
      return true;
    }
  }
  return false;
}

// 更新项目详情（需求名称、需求描述、需求方）
export function updateProjectDetails(
  projectId: string,
  details: Partial<ProjectDetails>
): Promise<void> {
  return fetch(`${API_BASE_URL}/editor/projects/${projectId}/details`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(details),
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
      // 更新成功，不需要返回值
    })
    .catch(error => {
      console.error('Failed to update project details:', error);
      throw error;
    });
}

// 保存SQL内容
export function saveProjectSQL(projectId: string, sql: string): Promise<void> {
  return updateProjectDetails(projectId, { sql });
}

// 移动项目到不同目录
export function moveProject(projectId: string, targetParentId?: string): Promise<void> {
  return fetch(`${API_BASE_URL}/editor/projects/${projectId}/move`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetParentId: targetParentId || null,
    }),
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
      // 移动成功，不需要返回值
    })
    .catch(error => {
      console.error('Failed to move project:', error);
      throw error;
    });
}

// 获取项目详情
export function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  return getFiles()
    .then(files => {
      const item = findItemById(files, projectId);
      if (!item || item.type !== 'file') {
        return null;
      }
      return item.projectDetails || {};
    })
    .catch(error => {
      console.error('Failed to get project details:', error);
      return null;
    });
}

// 获取所有项目（递归查找所有文件）
export function getAllProjects(): Promise<FileItem[]> {
  return getFiles()
    .then(files => {
      const projects: FileItem[] = [];
      
      const collectProjects = (items: FileItem[]) => {
        for (const item of items) {
          if (item.type === 'file') {
            projects.push(item);
          }
          if (item.children) {
            collectProjects(item.children);
          }
        }
      };

      collectProjects(files);
      return projects;
    })
    .catch(error => {
      console.error('Failed to get all projects:', error);
      return [];
    });
}

// 获取目录下的所有项目
export function getDirectoryProjects(directoryId: string): Promise<FileItem[]> {
  return getFiles()
    .then(files => {
      const directory = findItemById(files, directoryId);
      if (!directory || directory.type !== 'directory') {
        throw new Error('目录不存在');
      }

      const projects: FileItem[] = [];
      
      const collectProjects = (items: FileItem[]) => {
        for (const item of items) {
          if (item.type === 'file') {
            projects.push(item);
          }
          if (item.children) {
            collectProjects(item.children);
          }
        }
      };

      collectProjects(directory.children || []);
      return projects;
    })
    .catch(error => {
      console.error('Failed to get directory projects:', error);
      throw error;
    });
}

// 获取目录信息
export function getDirectory(directoryId: string): Promise<FileItem | null> {
  return getFiles()
    .then(files => {
      const directory = findItemById(files, directoryId);
      if (directory && directory.type === 'directory') {
        return directory;
      }
      return null;
    })
    .catch(error => {
      console.error('Failed to get directory:', error);
      return null;
    });
}

// 根据ID获取文件项
export function getFileItem(itemId: string): Promise<FileItem | null> {
  return getFiles()
    .then(files => {
      const item = findItemById(files, itemId);
      return item || null;
    })
    .catch(error => {
      console.error('Failed to get file item:', error);
      return null;
    });
}
