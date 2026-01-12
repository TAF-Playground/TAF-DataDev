'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MetricCategory } from '@/types/metrics';
import { 
  getMetricsCategories, 
  addMetricsCategory, 
  addMetricToCategory,
  updateCategoryName,
  updateMetricName,
  createTemporaryCategory,
  createTemporaryMetric,
} from '@/lib/api/metrics';

interface MetricsContextType {
  categories: MetricCategory[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<MetricCategory>;
  createMetric: (categoryId: string, metric: { name: string; description: string }) => Promise<void>;
  updateCategoryName: (categoryId: string, name: string) => Promise<void>;
  updateMetricName: (categoryId: string, metricId: string, name: string) => Promise<void>;
  createTemporaryCategory: () => Promise<MetricCategory>;
  createTemporaryMetric: (categoryId: string) => Promise<any>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = async () => {
    try {
      const data = await getMetricsCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string) => {
    try {
      const newCategory = await addMetricsCategory(name);
      await refreshCategories();
      return newCategory;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const createMetric = async (
    categoryId: string,
    metric: { name: string; description: string }
  ) => {
    try {
      await addMetricToCategory(categoryId, metric);
      await refreshCategories();
    } catch (error) {
      console.error('Failed to create metric:', error);
      throw error;
    }
  };

  const handleUpdateCategoryName = async (categoryId: string, name: string) => {
    try {
      await updateCategoryName(categoryId, name);
      await refreshCategories();
    } catch (error) {
      console.error('Failed to update category name:', error);
      throw error;
    }
  };

  const handleUpdateMetricName = async (categoryId: string, metricId: string, name: string) => {
    try {
      await updateMetricName(categoryId, metricId, name);
      await refreshCategories();
    } catch (error) {
      console.error('Failed to update metric name:', error);
      throw error;
    }
  };

  const handleCreateTemporaryCategory = async () => {
    return await createTemporaryCategory();
  };

  const handleCreateTemporaryMetric = async (categoryId: string) => {
    return await createTemporaryMetric(categoryId);
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return (
    <MetricsContext.Provider
      value={{
        categories,
        loading,
        refreshCategories,
        createCategory,
        createMetric,
        updateCategoryName: handleUpdateCategoryName,
        updateMetricName: handleUpdateMetricName,
        createTemporaryCategory: handleCreateTemporaryCategory,
        createTemporaryMetric: handleCreateTemporaryMetric,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}
