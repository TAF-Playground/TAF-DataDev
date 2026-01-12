# API Documentation

## 概述

本目录包含 Flask 蓝图（Blueprint）组织的 API 端点，用于处理不同页面的业务逻辑。

## 目录结构

```
api/
├── __init__.py      # API 蓝图注册
├── editor.py        # Editor 页面相关 API
└── README.md        # API 文档
```

## Editor API (`/api/editor`)

### GET `/api/editor/files`

获取所有文件和目录的树形结构。

**响应示例：**
```json
[
  {
    "id": "dir_xxx",
    "name": "目录名称",
    "type": "directory",
    "parentId": null,
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00",
    "children": [
      {
        "id": "file_xxx",
        "name": "项目名称",
        "type": "file",
        "parentId": "dir_xxx",
        "projectDetails": {
          "requirementName": "项目名称",
          "requirementDescription": null,
          "requester": null,
          "creator": "当前用户",
          "sql": null
        }
      }
    ]
  }
]
```

### POST `/api/editor/directories`

创建新目录。

**请求体：**
```json
{
  "name": "目录名称",
  "parentId": "父目录ID (可选)"
}
```

**响应示例：**
```json
{
  "id": "dir_xxx",
  "name": "目录名称",
  "type": "directory",
  "parentId": null,
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

### POST `/api/editor/projects`

创建新项目。

**请求体：**
```json
{
  "name": "项目名称",
  "parentId": "目录ID (可选)",
  "creator": "创建人 (可选，默认: '当前用户')"
}
```

**响应示例：**
```json
{
  "id": "file_xxx",
  "name": "项目名称",
  "type": "file",
  "parentId": null,
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00",
  "projectDetails": {
    "requirementName": "项目名称",
    "requirementDescription": null,
    "requester": null,
    "creator": "当前用户",
    "sql": null
  }
}
```

## 错误响应

所有 API 在出错时返回以下格式：

```json
{
  "error": "错误消息"
}
```

HTTP 状态码：
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

### 前端调用示例

```typescript
// 创建目录
const response = await fetch('http://localhost:5000/api/editor/directories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '新目录',
    parentId: null
  })
});
const directory = await response.json();

// 创建项目
const projectResponse = await fetch('http://localhost:5000/api/editor/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '新项目',
    parentId: directory.id,
    creator: '张三'
  })
});
const project = await projectResponse.json();
```

