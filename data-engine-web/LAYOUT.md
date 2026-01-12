# 布局结构说明文档

本文档详细描述了编辑器页面的布局结构和各个组件的位置，方便后续修改和维护。

## 整体布局结构

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │              TopBar (顶部栏)                          │
│          │  位置: 工作区顶部                                      │
│          │  文件: components/layout/TopBar.tsx                  │
│          │  高度: h-12 (48px)                                    │
│          │  背景: bg-gray-800                                    │
│ Sidebar  ├──────────┬───────────────────────────────────────────┤
│ (IconBar)│          │                                           │
│          │  Files   │      CodeEditor (代码编辑器)               │
│          │          │      位置: TopBar 下方，Files 右侧          │
│          │          │      文件: components/editor/              │
│          │          │            CodeEditor.tsx                 │
│          │          │                                           │
│          │          ├───────────────────────────────────────────┤
│          │          │      BottomPanel (底部面板)                 │
│          │          │      位置: CodeEditor 下方                 │
│          │          │      文件: components/editor/              │
│          │          │            BottomPanel.tsx                │
│          │          │      高度: h-64 (256px)                   │
│          │          │                                           │
│          │          │      RightSidebar (右侧边栏)               │
│          │          │      位置: CodeEditor 和 BottomPanel 右侧  │
└──────────┴──────────┴───────────────────────────────────────────┘

主布局：左右布局
├── 左边：Sidebar (IconBar)
└── 右边：工作区（上下布局）
    ├── 上面：TopBar
    └── 下面：左右布局
        ├── 左边：Files
        └── 右边：其他工作区（CodeEditor + BottomPanel + RightSidebar）
```

## 详细组件位置说明

### 1. 主布局结构
- **布局方式**: 左右布局
- **左侧**: Sidebar (IconBar)
- **右侧**: 工作区（上下布局）

### 2. Sidebar (IconBar - 图标栏)
- **位置**: 屏幕最左侧，从顶部开始
- **文件路径**: `components/editor/IconBar.tsx`
- **宽度**: 约 48px（由 padding 和图标大小决定）
- **背景色**: `bg-gray-850`
- **高度**: 从屏幕顶部到底部（`h-full`）
- **包含内容**:
  - **顶部图标组**（从上到下）:
    1. 播放按钮（Play）
    2. 设置按钮（Settings）
    3. 搜索按钮（Search）
    4. 分隔线
    5. Git 相关按钮
    6. 刷新按钮
    7. 列表按钮
    8. 数据库按钮
  - **底部用户头像**:
    - 位置: 图标栏最底部
    - 样式: 圆形头像，带边框分隔线
    - 功能: 用户信息/设置入口

### 3. 工作区（右侧区域）
- **布局方式**: 上下布局
- **上面**: TopBar
- **下面**: 左右布局（Files + 其他工作区）

#### 3.1 TopBar (顶部栏)
- **位置**: 工作区顶部
- **文件路径**: `components/layout/TopBar.tsx`
- **高度**: `h-12` (48px)
- **背景色**: `bg-gray-800`
- **包含内容**:
  - 左侧: Logo、项目名称下拉、环境选择、省略号菜单
  - 中间: Commit 按钮
  - 右侧: 三个切换按钮（左侧栏、底部面板、右侧栏）+ 窗口控制按钮

#### 3.2 下方区域（左右布局）
- **左边**: FilesPanel
- **右边**: 其他工作区（CodeEditor + BottomPanel + RightSidebar）

##### 3.2.1 FilesPanel (文件面板)
- **位置**: TopBar 下方，工作区左侧
- **文件路径**: `components/editor/FilesPanel.tsx`
- **宽度**: `w-56` (224px)
- **背景色**: `bg-gray-900`
- **包含内容**:
  - **顶部**: "Files" 标题（带文件夹图标）
  - **中间**: 文件树（可滚动）
  - **底部**: 无

### 4. CodeEditor (代码编辑器)
- **位置**: TopBar 下方，FilesPanel 右侧，占据中间主要区域
- **文件路径**: `components/editor/CodeEditor.tsx`
- **布局**: 垂直布局
- **背景色**: `bg-gray-950`

#### 3.1 文件路径栏
- **位置**: CodeEditor 顶部
- **高度**: 约 40px（由 padding 决定）
- **背景色**: `bg-gray-850`
- **包含内容**:
  - 左侧: 文件路径显示（definitions/...）
  - 右侧: Save 按钮

#### 3.2 代码编辑区域
- **位置**: 文件路径栏下方
- **布局**: 相对定位，包含行号和编辑区
- **行号栏**:
  - 位置: 绝对定位在左侧
  - 宽度: `w-12` (48px)
  - 背景色: `bg-gray-850`
- **编辑区**:
  - 位置: 行号栏右侧
  - 背景色: `bg-gray-950`
  - 内容: textarea 编辑器

### 5. BottomPanel (底部面板)
- **位置**: CodeEditor 下方
- **文件路径**: `components/editor/BottomPanel.tsx`
- **高度**: `h-64` (256px)
- **背景色**: `bg-gray-800`
- **包含内容**:
  - 标签页: Query results / Schemas
  - 内容区域: 根据选中的标签显示不同内容

### 6. RightSidebar (右侧边栏)
- **位置**: CodeEditor 和 BottomPanel 右侧
- **文件路径**: `components/editor/RightSidebar.tsx`
- **宽度**: `w-80` (320px)
- **背景色**: `bg-gray-800`
- **包含内容**:
  - 标签页: Outline / Documentation
  - 内容区域: 编译状态、依赖、查询等信息

## 布局层次关系

```
app/(dashboard)/editor/page.tsx (主页面)
├── 主布局：左右布局
│   ├── 左边：Sidebar (IconBar) (可选显示)
│   │   ├── 顶部图标组
│   │   └── 底部用户头像
│   └── 右边：工作区 (flex-1)
│       ├── 工作区：上下布局
│       │   ├── 上面：TopBar
│       │   └── 下面：左右布局
│       │       ├── 左边：FilesPanel (可选显示)
│       │       │   ├── Files 标题
│       │       │   └── 文件树
│       │       └── 右边：其他工作区 (flex-1)
│       │           ├── CodeEditor
│       │           │   ├── 文件路径栏
│       │           │   └── 代码编辑区
│       │           ├── BottomPanel (可选显示)
│       │           └── RightSidebar (可选显示)
```

## 响应式行为

- **左侧栏切换**: 通过 TopBar 右上角的第一个按钮控制
- **底部面板切换**: 通过 TopBar 右上角的第二个按钮控制
- **右侧栏切换**: 通过 TopBar 右上角的第三个按钮控制

## 颜色方案

- **TopBar**: `bg-gray-800`
- **Sidebar 图标栏**: `bg-gray-850`
- **Sidebar Files 区域**: `bg-gray-900`
- **CodeEditor**: `bg-gray-950`
- **CodeEditor 路径栏**: `bg-gray-850`
- **BottomPanel**: `bg-gray-800`
- **RightSidebar**: `bg-gray-800`

## 修改建议

### 调整左侧边栏位置
修改文件: `app/(dashboard)/editor/page.tsx`
- 当前: 左侧边栏区域从 TopBar 下方开始
- 如需顶到最上面: 将左侧边栏区域移到 TopBar 同级，使用 `h-screen` 而不是 `h-full`

### 调整用户头像位置
修改文件: `components/editor/IconBar.tsx`
- 当前: 用户头像在图标栏底部
- 如需移到 FilesPanel 底部: 将用户头像代码从 IconBar 移到 FilesPanel 组件中

### 调整 IconBar 和 FilesPanel 的布局
修改文件: `app/(dashboard)/editor/page.tsx`
- 当前: IconBar 和 FilesPanel 在同一个容器中左右布局
- 如需独立控制: 可以将它们分别用 `showLeftSidebar` 控制，实现独立显示/隐藏

### 调整组件宽度
- Sidebar 图标栏: 修改 `p-2` 的 padding 值
- Sidebar Files 区域: 修改 `w-56` 类
- RightSidebar: 修改 `w-80` 类

### 调整组件高度
- TopBar: 修改 `h-12` 类
- BottomPanel: 修改 `h-64` 类
