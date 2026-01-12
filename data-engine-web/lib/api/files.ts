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
  return new Promise((resolve, reject) => {
    if (!name || name.trim() === '') {
      reject(new Error('名称不能为空'));
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const item = findItemById(data, itemId);
    if (item) {
      item.name = name.trim();
      // 如果是项目文件，同时更新需求名称
      if (item.type === 'file') {
        if (!item.projectDetails) {
          item.projectDetails = {};
        }
        item.projectDetails.requirementName = name.trim();
      }
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } else {
      reject(new Error('项目不存在'));
    }
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
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const item = findItemById(data, projectId);
    if (!item) {
      reject(new Error('项目不存在'));
      return;
    }

    if (item.type !== 'file') {
      reject(new Error('只能更新项目的详情'));
      return;
    }

    // 初始化projectDetails对象
    if (!item.projectDetails) {
      item.projectDetails = {};
    }

    // 更新详情
    if (details.requirementName !== undefined) {
      item.projectDetails.requirementName = details.requirementName;
    }
    if (details.requirementDescription !== undefined) {
      item.projectDetails.requirementDescription = details.requirementDescription;
    }
    if (details.requester !== undefined) {
      item.projectDetails.requester = details.requester;
    }
    if (details.sql !== undefined) {
      item.projectDetails.sql = details.sql;
    }

    item.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    resolve();
  });
}

// 保存SQL内容
export function saveProjectSQL(projectId: string, sql: string): Promise<void> {
  return updateProjectDetails(projectId, { sql });
}

// 移动项目到不同目录
export function moveProject(projectId: string, targetParentId?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    // 查找要移动的项目
    const project = findItemById(data, projectId);
    if (!project) {
      reject(new Error('项目不存在'));
      return;
    }

    if (project.type !== 'file') {
      reject(new Error('只能移动项目文件'));
      return;
    }

    // 验证目标目录（如果提供了）
    if (targetParentId) {
      const targetParent = findItemById(data, targetParentId);
      if (!targetParent || targetParent.type !== 'directory') {
        reject(new Error('目标目录不存在'));
        return;
      }
    }

    // 从原位置移除项目
    const removeFromParent = (items: FileItem[], id: string, parentId?: string): boolean => {
      if (parentId) {
        const parent = findItemById(items, parentId);
        if (parent && parent.children) {
          const index = parent.children.findIndex(item => item.id === id);
          if (index !== -1) {
            parent.children.splice(index, 1);
            parent.updatedAt = new Date().toISOString();
            return true;
          }
        }
      } else {
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items.splice(index, 1);
          return true;
        }
      }
      return false;
    };

    // 从原位置移除
    if (!removeFromParent(data, projectId, project.parentId)) {
      reject(new Error('无法从原位置移除项目'));
      return;
    }

    // 更新项目的parentId
    project.parentId = targetParentId;
    project.updatedAt = new Date().toISOString();

    // 添加到新位置
    if (targetParentId) {
      const targetParent = findItemById(data, targetParentId);
      if (targetParent && targetParent.type === 'directory') {
        if (!targetParent.children) {
          targetParent.children = [];
        }
        targetParent.children.push(project);
        targetParent.updatedAt = new Date().toISOString();
      }
    } else {
      // 添加到根目录
      data.push(project);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    resolve();
  });
}

// 获取项目详情
export function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const item = findItemById(data, projectId);
    if (!item || item.type !== 'file') {
      resolve(null);
      return;
    }

    resolve(item.projectDetails || {});
  });
}

// 获取所有项目（递归查找所有文件）
export function getAllProjects(): Promise<FileItem[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

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

    collectProjects(data);
    resolve(projects);
  });
}

// 获取目录下的所有项目
export function getDirectoryProjects(directoryId: string): Promise<FileItem[]> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const directory = findItemById(data, directoryId);
    if (!directory || directory.type !== 'directory') {
      reject(new Error('目录不存在'));
      return;
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
    resolve(projects);
  });
}

// 获取目录信息
export function getDirectory(directoryId: string): Promise<FileItem | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const directory = findItemById(data, directoryId);
    if (directory && directory.type === 'directory') {
      resolve(directory);
    } else {
      resolve(null);
    }
  });
}

// 根据ID获取文件项
export function getFileItem(itemId: string): Promise<FileItem | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const item = findItemById(data, itemId);
    resolve(item || null);
  });
}
