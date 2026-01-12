export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  badge?: string;
  children?: FileNode[];
}

export interface EditorState {
  selectedFile: string;
  codeContent: string;
  showLeftSidebar: boolean;
  showBottomPanel: boolean;
  showRightSidebar: boolean;
}

export interface SchemaField {
  field: string;
  type: string;
}

export interface SchemaData {
  schema: string;
  datasets: string[];
}

// Re-export metrics types
export type { Metric, MetricCategory } from './metrics';
