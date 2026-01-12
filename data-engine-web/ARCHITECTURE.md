# 项目架构说明

## 目录结构

```
data-engine-web/
├── app/                          # Next.js App Router 页面
│   ├── (dashboard)/              # 路由组（共享布局）
│   │   ├── layout.tsx           # Dashboard 共享布局（包含 EditorProvider）
│   │   └── editor/              # 编辑器页面
│   │       └── page.tsx         # 编辑器主页面
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页（重定向到 /editor）
│   └── globals.css              # 全局样式
│
├── components/                   # 组件目录
│   ├── layout/                  # 布局相关组件
│   │   └── TopBar.tsx          # 顶部栏组件
│   └── editor/                  # 编辑器相关组件
│       ├── Sidebar.tsx         # 左侧文件浏览器
│       ├── CodeEditor.tsx       # 代码编辑器
│       ├── RightSidebar.tsx    # 右侧大纲面板
│       └── BottomPanel.tsx     # 底部查询结果面板
│
├── contexts/                     # React Context
│   └── EditorContext.tsx        # 编辑器状态管理
│
├── hooks/                        # 自定义 Hooks
│   └── useEditor.ts            # 编辑器 Hook（导出 useEditor）
│
├── types/                        # TypeScript 类型定义
│   └── index.ts                # 共享类型定义
│
├── constants/                    # 常量定义
│   └── index.ts                # 应用常量
│
└── lib/                          # 工具函数（预留）
```

## 核心概念

### 1. 路由结构
- 使用 Next.js App Router 的文件系统路由
- `(dashboard)` 是路由组，用于共享布局但不影响 URL
- `/editor` 是编辑器页面路径

### 2. 状态管理
- 使用 React Context API 管理编辑器状态
- `EditorContext` 提供全局编辑器状态
- `useEditor` Hook 用于访问编辑器状态

### 3. 组件组织
- **layout/** - 布局组件（TopBar 等）
- **editor/** - 编辑器特定组件（Sidebar, CodeEditor 等）

### 4. 类型安全
- 所有类型定义集中在 `types/index.ts`
- 使用 TypeScript 确保类型安全

## 如何添加新页面

### 示例：添加一个设置页面

1. **创建页面文件**
```typescript
// app/(dashboard)/settings/page.tsx
export default function SettingsPage() {
  return <div>Settings Page</div>;
}
```

2. **如果需要新的布局**
```typescript
// app/(dashboard)/settings/layout.tsx
export default function SettingsLayout({ children }) {
  return <div className="settings-layout">{children}</div>;
}
```

3. **添加导航链接**（在 TopBar 或其他导航组件中）

## 如何添加新功能

### 1. 添加新的 Context
```typescript
// contexts/NewContext.tsx
'use client';
import { createContext, useContext } from 'react';

const NewContext = createContext();

export function NewProvider({ children }) {
  // ...
}

export function useNew() {
  const context = useContext(NewContext);
  if (!context) throw new Error('useNew must be used within NewProvider');
  return context;
}
```

### 2. 添加新的组件
- 通用组件放在 `components/ui/`
- 功能特定组件放在对应的子目录（如 `components/editor/`）

### 3. 添加新的类型
在 `types/index.ts` 中添加类型定义

### 4. 添加新的常量
在 `constants/index.ts` 中添加常量

## 最佳实践

1. **组件职责单一** - 每个组件只负责一个功能
2. **类型安全** - 使用 TypeScript 类型定义
3. **状态管理** - 使用 Context 管理全局状态
4. **代码复用** - 提取可复用的逻辑到 Hooks
5. **常量集中管理** - 所有常量放在 `constants/` 目录

## 扩展建议

- 添加 `lib/utils.ts` 用于工具函数
- 添加 `lib/api.ts` 用于 API 调用
- 添加 `components/ui/` 用于通用 UI 组件（按钮、输入框等）
- 考虑添加状态管理库（如 Zustand）如果 Context 变得复杂
