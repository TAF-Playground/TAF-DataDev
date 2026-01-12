// 文件/目录管理 API

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  parentId?: string;
  children?: FileItem[];
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'workspace_files';

// 初始化数据
const initialData: FileItem[] = [];

// 获取所有文件和目录
export function getFiles(): Promise<FileItem[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(initialData);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        resolve(data || []);
      } catch {
        resolve(initialData);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      resolve(initialData);
    }
  });
}

// 创建目录
export function createDirectory(name: string, parentId?: string): Promise<FileItem> {
  return new Promise((resolve, reject) => {
    if (!name || name.trim() === '') {
      reject(new Error('目录名称不能为空'));
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const newDirectory: FileItem = {
      id: `dir_${Date.now()}`,
      name: name.trim(),
      type: 'directory',
      parentId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (parentId) {
      // 添加到父目录
      const parent = findItemById(data, parentId);
      if (parent && parent.type === 'directory') {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newDirectory);
        parent.updatedAt = new Date().toISOString();
      } else {
        reject(new Error('父目录不存在'));
        return;
      }
    } else {
      // 添加到根目录
      data.push(newDirectory);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    resolve(newDirectory);
  });
}

// 创建文件
export function createFile(name: string, parentId?: string): Promise<FileItem> {
  return new Promise((resolve, reject) => {
    if (!name || name.trim() === '') {
      reject(new Error('文件名称不能为空'));
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const newFile: FileItem = {
      id: `file_${Date.now()}`,
      name: name.trim(),
      type: 'file',
      parentId,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (parentId) {
      // 添加到父目录
      const parent = findItemById(data, parentId);
      if (parent && parent.type === 'directory') {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newFile);
        parent.updatedAt = new Date().toISOString();
      } else {
        reject(new Error('父目录不存在'));
        return;
      }
    } else {
      // 添加到根目录
      data.push(newFile);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    resolve(newFile);
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
