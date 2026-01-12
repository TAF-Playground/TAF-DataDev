# Models Documentation

## 概述

本目录包含数据引擎 API 的数据库模型定义，支持目录和项目的管理。

## 模型结构

### Directory (目录模型)
- `id`: 目录唯一标识符 (String, 36字符)
- `name`: 目录名称 (String, 255字符)
- `parent_id`: 父目录ID，支持嵌套目录结构 (String, 36字符, 可选)
- `created_at`: 创建时间 (DateTime)
- `updated_at`: 更新时间 (DateTime)

### Project (项目模型)
- `id`: 项目唯一标识符 (String, 36字符)
- `name`: 项目名称 (String, 255字符)
- `directory_id`: 所属目录ID (String, 36字符, 可选)
- `requirement_name`: 需求名称，默认等于项目名称 (String, 255字符, 可选)
- `requirement_description`: 需求描述 (Text, 可选)
- `requester`: 需求方 (String, 255字符, 可选)
- `creator`: 创建人 (String, 255字符, 可选)
- `sql_content`: SQL内容 (Text, 可选)
- `created_at`: 创建时间 (DateTime)
- `updated_at`: 更新时间 (DateTime)

## 数据库配置

### 默认配置 (SQLite)
项目默认使用 SQLite 数据库，数据库文件为 `data_engine.db`。

### 切换到 PostgreSQL
1. 复制 `env.example` 为 `.env`
2. 设置环境变量：
   ```env
   DATABASE_TYPE=postgresql
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=data_engine
   ```

## 初始化数据库

运行以下命令初始化数据库表：

```bash
python -m models.init_db
```

或者通过 Flask 应用初始化：

```python
from flask import Flask
from models import init_db

app = Flask(__name__)
init_db(app)
```

## 使用示例

### 创建目录
```python
from models import db
from models.directory import Directory
import uuid

directory = Directory(
    id=str(uuid.uuid4()),
    name="我的目录",
    parent_id=None
)
db.session.add(directory)
db.session.commit()
```

### 创建项目
```python
from models import db
from models.project import Project
import uuid

project = Project(
    id=str(uuid.uuid4()),
    name="我的项目",
    directory_id=directory.id,
    creator="张三",
    requester="李四",
    requirement_description="这是一个测试项目"
)
db.session.add(project)
db.session.commit()
```

### 查询数据
```python
from models import db
from models.directory import Directory
from models.project import Project

# 查询所有目录
directories = Directory.query.all()

# 查询所有项目
projects = Project.query.all()

# 查询特定目录下的项目
directory = Directory.query.filter_by(name="我的目录").first()
projects = directory.projects
```

