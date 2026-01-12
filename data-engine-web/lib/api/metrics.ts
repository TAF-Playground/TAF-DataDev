import { MetricCategory } from '@/types/metrics';

// 从本地 JSON 文件读取数据（在客户端使用 localStorage，在服务端读取文件）
const STORAGE_KEY = 'metrics_data';

// 初始化数据
const initialData = {
  categories: [
    {
      id: 'cat_1',
      name: '用户指标',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      metrics: [
        {
          id: 'metric_1',
          name: '日活跃用户数',
          description: '统计每日活跃用户数量',
          status: 'active',
          updatedAt: '2024-01-15',
        },
      ],
    },
    {
      id: 'cat_2',
      name: '业务指标',
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-14T10:00:00Z',
      metrics: [
        {
          id: 'metric_2',
          name: '订单转化率',
          description: '计算订单转化率',
          status: 'active',
          updatedAt: '2024-01-14',
        },
        {
          id: 'metric_3',
          name: 'GMV',
          description: '总交易额',
          status: 'draft',
          updatedAt: '2024-01-13',
        },
      ],
    },
  ],
};

// 获取所有指标目录
export function getMetricsCategories(): Promise<MetricCategory[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      // 服务端：返回初始数据
      resolve(initialData.categories as MetricCategory[]);
      return;
    }

    // 客户端：从 localStorage 读取
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        resolve(data.categories || []);
      } catch {
        resolve(initialData.categories as MetricCategory[]);
      }
    } else {
      // 首次使用，初始化 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      resolve(initialData.categories as MetricCategory[]);
    }
  });
}

// 添加新目录
export function addMetricsCategory(name: string): Promise<MetricCategory> {
  return new Promise((resolve, reject) => {
    if (!name || name.trim() === '') {
      reject(new Error('目录名称不能为空'));
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    // 从 localStorage 读取现有数据
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    // 创建新目录
    const newCategory: MetricCategory = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      metrics: [],
    };

    // 添加到列表
    data.categories.push(newCategory);

    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    resolve(newCategory);
  });
}

// 添加指标到目录
export function addMetricToCategory(
  categoryId: string,
  metric: { name: string; description: string }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const category = data.categories.find((cat: any) => cat.id === categoryId);
    if (category) {
      const newMetric = {
        id: `metric_${Date.now()}`,
        name: metric.name,
        description: metric.description,
        status: 'draft',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      category.metrics.push(newMetric);
      category.updatedAt = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    resolve();
  });
}

// 更新目录名称
export function updateCategoryName(categoryId: string, name: string): Promise<void> {
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

    const category = data.categories.find((cat: any) => cat.id === categoryId);
    if (category) {
      category.name = name.trim();
      category.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    resolve();
  });
}

// 更新指标名称
export function updateMetricName(categoryId: string, metricId: string, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!name || name.trim() === '') {
      reject(new Error('指标名称不能为空'));
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('此功能仅在客户端可用'));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : initialData;

    const category = data.categories.find((cat: any) => cat.id === categoryId);
    if (category && category.metrics) {
      const metric = category.metrics.find((m: any) => m.id === metricId);
      if (metric) {
        metric.name = name.trim();
        metric.updatedAt = new Date().toISOString().split('T')[0];
        category.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }

    resolve();
  });
}

// 创建临时目录（用于内联编辑）
export function createTemporaryCategory(): Promise<MetricCategory> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        id: `temp_cat_${Date.now()}`,
        name: '新目录',
        metrics: [],
      });
      return;
    }

    const newCategory: MetricCategory = {
      id: `temp_cat_${Date.now()}`,
      name: '新目录',
      metrics: [],
    };

    resolve(newCategory);
  });
}

// 创建临时指标（用于内联编辑）
export function createTemporaryMetric(categoryId: string): Promise<any> {
  return new Promise((resolve) => {
    const newMetric = {
      id: `temp_metric_${Date.now()}`,
      name: '新指标',
      description: '',
      status: 'draft' as const,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    resolve(newMetric);
  });
}

// 删除目录
export function deleteMetricsCategory(categoryId: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      data.categories = data.categories.filter((cat: any) => cat.id !== categoryId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    resolve();
  });
}
