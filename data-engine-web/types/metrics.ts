export interface Metric {
  id: string;
  name: string;
  description: string;
  category?: string;
  status: 'active' | 'draft';
  updatedAt: string;
}

export interface MetricCategory {
  id: string;
  name: string;
  metrics?: Metric[];
  children?: MetricCategory[];
  createdAt?: string;
  updatedAt?: string;
}
