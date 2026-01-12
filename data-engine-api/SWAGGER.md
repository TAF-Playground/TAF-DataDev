# Swagger API 文档

## 访问 Swagger UI

启动 Flask 应用后，访问以下 URL 查看 Swagger API 文档：

```
http://localhost:5000/api-docs
```

## API 规范

Swagger 文档会自动从代码中的 docstring 生成。所有 API 端点都包含：

- **请求参数说明**
- **响应格式说明**
- **错误码说明**
- **示例数据**

## 当前支持的 API

### Editor API (`/api/editor`)

1. **GET `/api/editor/files`** - 获取所有文件和目录
2. **POST `/api/editor/directories`** - 创建新目录
3. **POST `/api/editor/projects`** - 创建新项目

## 使用 Swagger UI 测试 API

1. 启动应用：
   ```bash
   python main.py
   ```

2. 打开浏览器访问：`http://localhost:5000/api-docs`

3. 在 Swagger UI 中：
   - 查看所有可用的 API 端点
   - 查看每个端点的详细文档
   - 直接在 UI 中测试 API（点击 "Try it out" 按钮）
   - 查看请求和响应示例

## 添加新的 API 文档

在函数 docstring 中使用 YAML 格式添加 Swagger 文档：

```python
@editor_bp.route('/example', methods=['POST'])
def example():
    """
    Example API endpoint
    ---
    tags:
      - Editor
    summary: Example endpoint
    description: This is an example endpoint
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
    responses:
      200:
        description: Success
    """
    # Your code here
```

## 配置说明

Swagger 配置在 `main.py` 中的 `swagger_config` 和 `swagger_template` 中定义。

