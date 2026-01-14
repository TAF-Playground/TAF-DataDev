"""
Database API endpoints for managing database connections
"""
import uuid
import os
import sqlite3
from pathlib import Path
from flask import Blueprint, request, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from models import db
from models.database_connection import DatabaseConnection

database_bp = Blueprint('database', __name__, url_prefix='/database')


def build_connection_string(db_type: str, host: str = None, port: int = None, 
                           database: str = None, username: str = None, 
                           password: str = None, connection_string: str = None) -> str:
    """
    Build database connection string based on database type
    """
    if connection_string:
        # If connection_string is provided, use it directly
        # But for SQLite, we need to handle it specially
        if db_type == 'sqlite' and connection_string:
            # Remove sqlite:/// prefix if present
            if connection_string.startswith('sqlite:///'):
                file_path = connection_string[10:]
            elif connection_string.startswith('sqlite:'):
                file_path = connection_string[7:]
            else:
                file_path = connection_string
            
            # Convert to absolute path and normalize
            try:
                file_path = os.path.abspath(os.path.expanduser(file_path))
                # Use 4 slashes for absolute paths in SQLite
                return f'sqlite:///{file_path}'
            except Exception:
                return connection_string
        return connection_string
    
    if db_type == 'sqlite':
        # SQLite uses file path
        if not database:
            return 'sqlite:///:memory:'
        
        # Convert to absolute path and normalize
        try:
            file_path = os.path.abspath(os.path.expanduser(database))
            # Use 4 slashes for absolute paths in SQLite
            return f'sqlite:///{file_path}'
        except Exception as e:
            raise ValueError(f'无效的 SQLite 文件路径: {str(e)}')
    elif db_type == 'mysql':
        if not all([host, database, username]):
            raise ValueError('MySQL requires host, database, and username')
        if password is None:
            password = ''
        port = port or 3306
        # URL encode username and password to handle special characters
        from urllib.parse import quote_plus
        username_encoded = quote_plus(str(username))
        password_encoded = quote_plus(str(password))
        database_encoded = quote_plus(str(database))
        return f'mysql+pymysql://{username_encoded}:{password_encoded}@{host}:{port}/{database_encoded}'
    elif db_type == 'postgresql':
        if not all([host, database, username]):
            raise ValueError('PostgreSQL requires host, database, and username')
        if password is None:
            password = ''
        port = port or 5432
        # URL encode username and password to handle special characters
        from urllib.parse import quote_plus
        username_encoded = quote_plus(str(username))
        password_encoded = quote_plus(str(password))
        database_encoded = quote_plus(str(database))
        return f'postgresql+psycopg2://{username_encoded}:{password_encoded}@{host}:{port}/{database_encoded}'
    else:
        raise ValueError(f'Unsupported database type: {db_type}')


def test_database_connection(db_type: str, host: str = None, port: int = None,
                            database: str = None, username: str = None,
                            password: str = None, connection_string: str = None) -> tuple[bool, str]:
    """
    Test database connection
    Returns (success: bool, message: str)
    """
    try:
        # Validate required fields based on database type
        if db_type == 'sqlite':
            if not database and not connection_string:
                return False, 'SQLite 数据库文件路径不能为空'
            
            # Get the actual file path from database or connection_string
            file_path = database or connection_string
            
            # Remove sqlite:/// prefix if present
            if file_path.startswith('sqlite:///'):
                file_path = file_path[10:]
            elif file_path.startswith('sqlite:'):
                file_path = file_path[7:]
            
            # Convert to absolute path
            try:
                file_path = os.path.abspath(os.path.expanduser(file_path))
            except Exception as e:
                return False, f'无效的文件路径: {str(e)}'
            
            # Check if file exists
            if not os.path.exists(file_path):
                return False, f'数据库文件不存在: {file_path}'
            
            # Check if it's a file (not a directory)
            if not os.path.isfile(file_path):
                return False, f'路径不是文件: {file_path}'
            
            # Check if file is readable
            if not os.access(file_path, os.R_OK):
                return False, f'数据库文件不可读: {file_path}'
            
            # Try to open and verify it's a valid SQLite database
            try:
                conn_test = sqlite3.connect(file_path, timeout=5.0)
                # Try to execute a query to verify it's a valid SQLite database
                cursor = conn_test.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1")
                cursor.fetchone()
                conn_test.close()
            except sqlite3.Error as e:
                return False, f'无效的 SQLite 数据库文件: {str(e)}'
            except Exception as e:
                return False, f'无法打开数据库文件: {str(e)}'
            
            # Update database path for connection string building
            database = file_path
            
        elif db_type in ['mysql', 'postgresql']:
            # For MySQL and PostgreSQL, all fields are required (except connection_string)
            if not connection_string:
                if not host:
                    return False, '主机地址不能为空'
                if not database:
                    return False, '数据库名不能为空'
                if not username:
                    return False, '用户名不能为空'
                if password is None:  # Allow empty password but not None
                    return False, '密码不能为空'
        else:
            # For other database types, require connection_string or all fields
            if not connection_string:
                if not all([host, database, username]):
                    return False, f'{db_type} 数据库需要提供主机、数据库名和用户名'
        
        conn_str = build_connection_string(
            db_type=db_type,
            host=host,
            port=port,
            database=database,
            username=username,
            password=password,
            connection_string=connection_string
        )
        
        # Create engine with connection timeout and strict validation
        engine = create_engine(
            conn_str,
            connect_args={'connect_timeout': 5} if db_type != 'sqlite' else {},
            pool_pre_ping=True,  # Verify connections before using
            echo=False
        )
        
        # Test connection - actually connect and execute a query
        with engine.connect() as conn:
            # Execute a simple query to verify connection works
            result = conn.execute(text('SELECT 1 as test'))
            # Fetch the result to ensure query executed successfully
            row = result.fetchone()
            if not row or row[0] != 1:
                return False, '连接测试失败：查询结果异常'
            
            # For SQLite, also verify we can read the database schema
            if db_type == 'sqlite':
                try:
                    # Try to query sqlite_master to verify database integrity
                    schema_result = conn.execute(text("SELECT COUNT(*) FROM sqlite_master"))
                    schema_row = schema_result.fetchone()
                    if schema_row is None:
                        return False, '连接测试失败：无法读取数据库结构'
                except Exception as e:
                    return False, f'连接测试失败：数据库文件损坏或无法访问 - {str(e)}'
        
        # Close the engine to clean up
        engine.dispose()
        
        return True, '连接成功'
    except ValueError as e:
        return False, f'配置错误: {str(e)}'
    except SQLAlchemyError as e:
        error_msg = str(e)
        # Provide more specific error messages
        if 'Access denied' in error_msg or 'authentication failed' in error_msg.lower():
            return False, '连接失败：用户名或密码错误'
        elif 'Unknown database' in error_msg or 'database' in error_msg.lower() and 'does not exist' in error_msg.lower():
            return False, '连接失败：数据库不存在'
        elif 'Connection refused' in error_msg or 'Can\'t connect' in error_msg:
            return False, '连接失败：无法连接到数据库服务器，请检查主机地址和端口'
        elif 'timeout' in error_msg.lower():
            return False, '连接失败：连接超时，请检查网络和服务器状态'
        else:
            return False, f'连接失败: {error_msg}'
    except Exception as e:
        error_msg = str(e)
        return False, f'连接测试失败: {error_msg}'


@database_bp.route('/connections', methods=['GET'])
def get_connections():
    """
    Get all database connections
    ---
    tags:
      - Database
    summary: Get all database connections
    description: Returns a list of all database connections
    responses:
      200:
        description: Successfully retrieved database connections
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              name:
                type: string
              dbType:
                type: string
              host:
                type: string
                nullable: true
              port:
                type: integer
                nullable: true
              database:
                type: string
                nullable: true
              username:
                type: string
                nullable: true
              connectionString:
                type: string
                nullable: true
              description:
                type: string
                nullable: true
              createdAt:
                type: string
                format: date-time
              updatedAt:
                type: string
                format: date-time
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        connections = DatabaseConnection.query.all()
        return jsonify([conn.to_dict(include_password=False) for conn in connections]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@database_bp.route('/connections', methods=['POST'])
def create_connection():
    """
    Create a new database connection
    ---
    tags:
      - Database
    summary: Create a new database connection
    description: Creates a new database connection with provided information
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: body
        name: body
        description: Database connection information
        required: true
        schema:
          type: object
          required:
            - name
            - dbType
          properties:
            name:
              type: string
              description: Connection name
              example: "生产数据库"
            dbType:
              type: string
              description: Database type (mysql, postgresql, sqlite, etc.)
              example: "mysql"
            host:
              type: string
              description: Database host
              example: "localhost"
            port:
              type: integer
              description: Database port
              example: 3306
            database:
              type: string
              description: Database name
              example: "mydb"
            username:
              type: string
              description: Database username
              example: "root"
            password:
              type: string
              description: Database password
              example: "password"
            connectionString:
              type: string
              description: Full connection string (optional)
              example: "mysql://user:pass@host:port/db"
            description:
              type: string
              description: Connection description
              example: "生产环境MySQL数据库"
    responses:
      201:
        description: Database connection created successfully
        schema:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            dbType:
              type: string
            host:
              type: string
            port:
              type: integer
            database:
              type: string
            username:
              type: string
            createdAt:
              type: string
              format: date-time
      400:
        description: Bad request
        schema:
          type: object
          properties:
            error:
              type: string
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        data = request.get_json()
        
        if not data or 'name' not in data or 'dbType' not in data:
            return jsonify({'error': '连接名称和数据库类型不能为空'}), 400
        
        name = data.get('name', '').strip()
        db_type = data.get('dbType', '').strip()
        
        if not name or not db_type:
            return jsonify({'error': '连接名称和数据库类型不能为空'}), 400
        
        # Create new database connection
        connection_id = f"db_{uuid.uuid4()}"
        new_connection = DatabaseConnection(
            id=connection_id,
            name=name,
            db_type=db_type,
            host=data.get('host'),
            port=data.get('port'),
            database=data.get('database'),
            username=data.get('username'),
            password=data.get('password'),  # TODO: 加密存储密码
            connection_string=data.get('connectionString'),
            description=data.get('description')
        )
        
        db.session.add(new_connection)
        db.session.commit()
        
        return jsonify(new_connection.to_dict(include_password=False)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@database_bp.route('/connections/<connection_id>', methods=['PUT', 'PATCH'])
def update_connection(connection_id):
    """
    Update database connection
    ---
    tags:
      - Database
    summary: Update database connection
    description: Updates an existing database connection
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: path
        name: connection_id
        type: string
        required: true
        description: Connection ID
      - in: body
        name: body
        description: Database connection information to update
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            dbType:
              type: string
            host:
              type: string
            port:
              type: integer
            database:
              type: string
            username:
              type: string
            password:
              type: string
            connectionString:
              type: string
            description:
              type: string
    responses:
      200:
        description: Connection updated successfully
        schema:
          type: object
      404:
        description: Connection not found
        schema:
          type: object
          properties:
            error:
              type: string
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        data = request.get_json() or {}
        
        connection = DatabaseConnection.query.get(connection_id)
        if not connection:
            return jsonify({'error': '数据库连接不存在'}), 404
        
        # Update fields
        if 'name' in data:
            connection.name = data['name']
        if 'dbType' in data:
            connection.db_type = data['dbType']
        if 'host' in data:
            connection.host = data['host']
        if 'port' in data:
            connection.port = data.get('port')
        if 'database' in data:
            connection.database = data.get('database')
        if 'username' in data:
            connection.username = data.get('username')
        if 'password' in data:
            connection.password = data.get('password')  # TODO: 加密存储
        if 'connectionString' in data:
            connection.connection_string = data.get('connectionString')
        if 'description' in data:
            connection.description = data.get('description')
        
        db.session.commit()
        
        return jsonify(connection.to_dict(include_password=False)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@database_bp.route('/connections/<connection_id>', methods=['DELETE'])
def delete_connection(connection_id):
    """
    Delete database connection
    ---
    tags:
      - Database
    summary: Delete database connection
    description: Deletes an existing database connection
    parameters:
      - in: path
        name: connection_id
        type: string
        required: true
        description: Connection ID
    responses:
      200:
        description: Connection deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Connection not found
        schema:
          type: object
          properties:
            error:
              type: string
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        connection = DatabaseConnection.query.get(connection_id)
        if not connection:
            return jsonify({'error': '数据库连接不存在'}), 404
        
        db.session.delete(connection)
        db.session.commit()
        
        return jsonify({'message': '数据库连接已删除'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@database_bp.route('/connections/test', methods=['POST'])
def test_connection():
    """
    Test database connection
    ---
    tags:
      - Database
    summary: Test database connection
    description: Tests if a database connection can be established with provided credentials
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: body
        name: body
        description: Database connection information to test
        required: true
        schema:
          type: object
          required:
            - dbType
          properties:
            dbType:
              type: string
              description: Database type
              example: "mysql"
            host:
              type: string
              description: Database host
            port:
              type: integer
              description: Database port
            database:
              type: string
              description: Database name or file path (for SQLite)
            username:
              type: string
              description: Database username
            password:
              type: string
              description: Database password
            connectionString:
              type: string
              description: Full connection string
    responses:
      200:
        description: Connection test result
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
      400:
        description: Bad request
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        data = request.get_json()
        
        if not data or 'dbType' not in data:
            return jsonify({'error': '数据库类型不能为空'}), 400
        
        db_type = data.get('dbType', '').strip()
        if not db_type:
            return jsonify({'error': '数据库类型不能为空'}), 400
        
        # SQLite 特殊处理
        if db_type == 'sqlite':
            database = data.get('database') or data.get('connectionString')
            if not database or not database.strip():
                return jsonify({'success': False, 'message': 'SQLite 数据库文件路径不能为空'}), 200
            
            success, message = test_database_connection(
                db_type=db_type,
                database=database.strip()
            )
        else:
            # 其他数据库类型 - 验证必填字段
            host = data.get('host', '').strip() if data.get('host') else None
            database = data.get('database', '').strip() if data.get('database') else None
            username = data.get('username', '').strip() if data.get('username') else None
            password = data.get('password')  # Password can be empty string
            connection_string = data.get('connectionString', '').strip() if data.get('connectionString') else None
            
            # If connection_string is provided, use it; otherwise validate individual fields
            if not connection_string:
                if not host:
                    return jsonify({'success': False, 'message': '主机地址不能为空'}), 200
                if not database:
                    return jsonify({'success': False, 'message': '数据库名不能为空'}), 200
                if not username:
                    return jsonify({'success': False, 'message': '用户名不能为空'}), 200
                if password is None:
                    return jsonify({'success': False, 'message': '密码不能为空'}), 200
            
            success, message = test_database_connection(
                db_type=db_type,
                host=host,
                port=data.get('port'),
                database=database,
                username=username,
                password=password or '',  # Convert None to empty string
                connection_string=connection_string
            )
        
        if success:
            return jsonify({'success': True, 'message': message}), 200
        else:
            return jsonify({'success': False, 'message': message}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'测试失败: {str(e)}'}), 200


@database_bp.route('/connections/<connection_id>/execute', methods=['POST'])
def execute_sql(connection_id):
    """
    Execute SQL query on a database connection
    ---
    tags:
      - Database
    summary: Execute SQL query
    description: Executes a SQL query on the specified database connection
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: path
        name: connection_id
        type: string
        required: true
        description: Database connection ID
      - in: body
        name: body
        description: SQL query to execute
        required: true
        schema:
          type: object
          required:
            - sql
          properties:
            sql:
              type: string
              description: SQL query to execute
              example: "SELECT * FROM users LIMIT 10"
    responses:
      200:
        description: Query executed successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            columns:
              type: array
              items:
                type: string
            rows:
              type: array
              items:
                type: array
            rowCount:
              type: integer
            executionTime:
              type: number
            message:
              type: string
      400:
        description: Bad request
        schema:
          type: object
          properties:
            error:
              type: string
      404:
        description: Connection not found
        schema:
          type: object
          properties:
            error:
              type: string
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    import time
    
    try:
        data = request.get_json()
        
        if not data or 'sql' not in data:
            return jsonify({'error': 'SQL 查询不能为空'}), 400
        
        sql_query = data.get('sql', '').strip()
        if not sql_query:
            return jsonify({'error': 'SQL 查询不能为空'}), 400
        
        # Get database connection
        connection = DatabaseConnection.query.get(connection_id)
        if not connection:
            return jsonify({'error': '数据库连接不存在'}), 404
        
        # Build connection string with proper error handling
        try:
            conn_str = build_connection_string(
                db_type=connection.db_type,
                host=connection.host,
                port=connection.port,
                database=connection.database,
                username=connection.username,
                password=connection.password,
                connection_string=connection.connection_string
            )
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'连接字符串构建失败: {str(e)}',
                'message': f'连接字符串构建失败: {str(e)}'
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'连接配置错误: {str(e)}',
                'message': f'连接配置错误: {str(e)}'
            }), 200
        
        # Create engine
        try:
            engine = create_engine(
                conn_str,
                connect_args={'connect_timeout': 10} if connection.db_type != 'sqlite' else {},
                pool_pre_ping=True,
                echo=False
            )
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'无法创建数据库引擎: {str(e)}',
                'message': f'无法创建数据库引擎: {str(e)}'
            }), 200
        
        start_time = time.time()
        
        # Execute query
        with engine.connect() as conn:
            # Determine if query returns a result set
            sql_upper = sql_query.upper().strip()
            # Queries that return result sets
            returns_result_set = (
                sql_upper.startswith('SELECT') or 
                sql_upper.startswith('WITH') or
                sql_upper.startswith('SHOW') or  # SHOW TABLES, SHOW DATABASES, etc.
                sql_upper.startswith('DESCRIBE') or
                sql_upper.startswith('DESC') or
                sql_upper.startswith('EXPLAIN') or
                sql_upper.startswith('PRAGMA')  # SQLite pragma statements
            )
            
            if returns_result_set:
                # For queries that return result sets (SELECT, SHOW, DESCRIBE, etc.)
                result = conn.execute(text(sql_query))
                
                # Try to fetch results
                try:
                    rows = result.fetchall()
                    # Get column names from result
                    if hasattr(result, 'keys'):
                        columns = list(result.keys())
                    elif hasattr(result, 'columns'):
                        columns = [col.name for col in result.columns]
                    else:
                        # Fallback: try to get columns from first row
                        columns = []
                        if rows:
                            if hasattr(rows[0], '_fields'):
                                columns = list(rows[0]._fields)
                            elif hasattr(rows[0], '_asdict'):
                                columns = list(rows[0]._asdict().keys())
                            elif isinstance(rows[0], (list, tuple)):
                                # For tuple/list rows, use generic column names
                                columns = [f'column_{i+1}' for i in range(len(rows[0]))]
                    
                    # Convert rows to list of lists
                    rows_data = []
                    for row in rows:
                        row_list = []
                        if hasattr(row, '_asdict'):
                            # Row is a Row object
                            row_dict = row._asdict()
                            for col in columns:
                                value = row_dict.get(col, None)
                                if value is None:
                                    row_list.append(None)
                                elif isinstance(value, (int, float, str, bool)):
                                    row_list.append(value)
                                else:
                                    row_list.append(str(value))
                        elif isinstance(row, (list, tuple)):
                            # Row is a list/tuple
                            for value in row:
                                if value is None:
                                    row_list.append(None)
                                elif isinstance(value, (int, float, str, bool)):
                                    row_list.append(value)
                                else:
                                    row_list.append(str(value))
                        else:
                            # Try to access by column name
                            for col in columns:
                                value = getattr(row, col, None)
                                if value is None:
                                    row_list.append(None)
                                elif isinstance(value, (int, float, str, bool)):
                                    row_list.append(value)
                                else:
                                    row_list.append(str(value))
                        rows_data.append(row_list)
                    
                    execution_time = time.time() - start_time
                    
                    return jsonify({
                        'success': True,
                        'columns': columns,
                        'rows': rows_data,
                        'rowCount': len(rows_data),
                        'executionTime': round(execution_time, 3),
                        'message': f'查询成功，返回 {len(rows_data)} 行'
                    }), 200
                except Exception as fetch_error:
                    # If fetch fails, it might be a DDL/DML statement that was misclassified
                    # Try to commit and return rowcount
                    conn.commit()
                    execution_time = time.time() - start_time
                    affected_rows = result.rowcount if hasattr(result, 'rowcount') else 0
                    
                    return jsonify({
                        'success': True,
                        'columns': [],
                        'rows': [],
                        'rowCount': affected_rows,
                        'executionTime': round(execution_time, 3),
                        'message': f'执行成功，影响 {affected_rows} 行'
                    }), 200
            else:
                # For non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, ALTER, etc.)
                result = conn.execute(text(sql_query))
                conn.commit()
                
                execution_time = time.time() - start_time
                affected_rows = result.rowcount if hasattr(result, 'rowcount') else 0
                
                return jsonify({
                    'success': True,
                    'columns': [],
                    'rows': [],
                    'rowCount': affected_rows,
                    'executionTime': round(execution_time, 3),
                    'message': f'执行成功，影响 {affected_rows} 行'
                }), 200
        
    except SQLAlchemyError as e:
        error_msg = str(e)
        return jsonify({
            'success': False,
            'error': f'SQL 执行失败: {error_msg}',
            'message': f'SQL 执行失败: {error_msg}'
        }), 200
    except Exception as e:
        error_msg = str(e)
        return jsonify({
            'success': False,
            'error': f'执行失败: {error_msg}',
            'message': f'执行失败: {error_msg}'
        }), 200


@database_bp.route('/connections/<connection_id>/databases', methods=['GET'])
def get_databases(connection_id):
    """
    Get list of databases for a connection
    """
    try:
        connection = DatabaseConnection.query.get(connection_id)
        if not connection:
            return jsonify({'error': '数据库连接不存在'}), 404
        
        try:
            conn_str = build_connection_string(
                db_type=connection.db_type,
                host=connection.host,
                port=connection.port,
                database=connection.database,
                username=connection.username,
                password=connection.password,
                connection_string=connection.connection_string
            )
        except Exception as e:
            return jsonify({'error': f'连接字符串构建失败: {str(e)}'}), 400
        
        try:
            engine = create_engine(
                conn_str,
                connect_args={'connect_timeout': 10} if connection.db_type != 'sqlite' else {},
                pool_pre_ping=True,
                echo=False
            )
        except Exception as e:
            return jsonify({'error': f'无法创建数据库引擎: {str(e)}'}), 500
        
        with engine.connect() as conn:
            if connection.db_type == 'mysql':
                result = conn.execute(text('SHOW DATABASES'))
                databases = [row[0] for row in result.fetchall()]
            elif connection.db_type == 'postgresql':
                result = conn.execute(text("SELECT datname FROM pg_database WHERE datistemplate = false"))
                databases = [row[0] for row in result.fetchall()]
            elif connection.db_type == 'sqlite':
                # SQLite doesn't have multiple databases, return the current database name
                databases = [connection.database or 'main']
            else:
                return jsonify({'error': f'不支持的数据库类型: {connection.db_type}'}), 400
            
            return jsonify({'databases': databases}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取数据库列表失败: {str(e)}'}), 500


@database_bp.route('/connections/<connection_id>/tables', methods=['GET'])
def get_tables(connection_id):
    """
    Get list of tables for a database
    """
    try:
        connection = DatabaseConnection.query.get(connection_id)
        if not connection:
            return jsonify({'error': '数据库连接不存在'}), 404
        
        database = request.args.get('database', connection.database)
        schema = request.args.get('schema', None)
        
        try:
            conn_str = build_connection_string(
                db_type=connection.db_type,
                host=connection.host,
                port=connection.port,
                database=database,
                username=connection.username,
                password=connection.password,
                connection_string=connection.connection_string
            )
        except Exception as e:
            return jsonify({'error': f'连接字符串构建失败: {str(e)}'}), 400
        
        try:
            engine = create_engine(
                conn_str,
                connect_args={'connect_timeout': 10} if connection.db_type != 'sqlite' else {},
                pool_pre_ping=True,
                echo=False
            )
        except Exception as e:
            return jsonify({'error': f'无法创建数据库引擎: {str(e)}'}), 500
        
        with engine.connect() as conn:
            if connection.db_type == 'mysql':
                if database:
                    conn.execute(text(f'USE `{database}`'))
                result = conn.execute(text('SHOW TABLES'))
                tables = [row[0] for row in result.fetchall()]
            elif connection.db_type == 'postgresql':
                if schema:
                    query = text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = :schema 
                        AND table_type = 'BASE TABLE'
                        ORDER BY table_name
                    """)
                    result = conn.execute(query, {'schema': schema})
                else:
                    query = text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_type = 'BASE TABLE'
                        ORDER BY table_name
                    """)
                    result = conn.execute(query)
                tables = [row[0] for row in result.fetchall()]
            elif connection.db_type == 'sqlite':
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
                tables = [row[0] for row in result.fetchall()]
            else:
                return jsonify({'error': f'不支持的数据库类型: {connection.db_type}'}), 400
            
            return jsonify({'tables': tables}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取表列表失败: {str(e)}'}), 500


@database_bp.route('/connections/<connection_id>/table-structure', methods=['GET'])
def get_table_structure(connection_id):
    """
    Get table structure (columns, types, comments)
    """
    try:
        connection = DatabaseConnection.query.get(connection_id)
        if not connection:
            return jsonify({'error': '数据库连接不存在'}), 404
        
        database = request.args.get('database', connection.database)
        schema = request.args.get('schema', None)
        table = request.args.get('table')
        
        if not table:
            return jsonify({'error': '表名不能为空'}), 400
        
        try:
            conn_str = build_connection_string(
                db_type=connection.db_type,
                host=connection.host,
                port=connection.port,
                database=database,
                username=connection.username,
                password=connection.password,
                connection_string=connection.connection_string
            )
        except Exception as e:
            return jsonify({'error': f'连接字符串构建失败: {str(e)}'}), 400
        
        try:
            engine = create_engine(
                conn_str,
                connect_args={'connect_timeout': 10} if connection.db_type != 'sqlite' else {},
                pool_pre_ping=True,
                echo=False
            )
        except Exception as e:
            return jsonify({'error': f'无法创建数据库引擎: {str(e)}'}), 500
        
        with engine.connect() as conn:
            columns = []
            
            if connection.db_type == 'mysql':
                if database:
                    conn.execute(text(f'USE `{database}`'))
                query = text(f"""
                    SELECT 
                        COLUMN_NAME as column_name,
                        DATA_TYPE as data_type,
                        COLUMN_TYPE as column_type,
                        IS_NULLABLE as is_nullable,
                        COLUMN_DEFAULT as column_default,
                        COLUMN_COMMENT as column_comment,
                        COLUMN_KEY as column_key,
                        EXTRA as extra
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = :database
                    AND TABLE_NAME = :table
                    ORDER BY ORDINAL_POSITION
                """)
                result = conn.execute(query, {'database': database or connection.database, 'table': table})
                for row in result.fetchall():
                    columns.append({
                        'field': row[0],
                        'type': row[2] or row[1],  # Use COLUMN_TYPE if available, else DATA_TYPE
                        'nullable': row[3] == 'YES',
                        'default': row[4],
                        'comment': row[5] or '',
                        'key': row[6] or '',
                        'extra': row[7] or ''
                    })
            elif connection.db_type == 'postgresql':
                schema_name = schema or 'public'
                query = text("""
                    SELECT 
                        column_name,
                        data_type,
                        udt_name,
                        is_nullable,
                        column_default,
                        COALESCE(col_description(c.oid, a.attnum), '') as column_comment
                    FROM information_schema.columns c
                    LEFT JOIN pg_class cls ON cls.relname = c.table_name
                    LEFT JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace AND nsp.nspname = c.table_schema
                    LEFT JOIN pg_attribute a ON a.attrelid = cls.oid AND a.attname = c.column_name
                    WHERE table_schema = :schema
                    AND table_name = :table
                    ORDER BY ordinal_position
                """)
                result = conn.execute(query, {'schema': schema_name, 'table': table})
                for row in result.fetchall():
                    columns.append({
                        'field': row[0],
                        'type': row[2] or row[1],  # Use udt_name if available, else data_type
                        'nullable': row[3] == 'YES',
                        'default': row[4],
                        'comment': row[5] or '',
                        'key': '',
                        'extra': ''
                    })
            elif connection.db_type == 'sqlite':
                # SQLite doesn't have a standard way to get column comments
                result = conn.execute(text(f"PRAGMA table_info(`{table}`)"))
                for row in result.fetchall():
                    columns.append({
                        'field': row[1],
                        'type': row[2] or '',
                        'nullable': not row[3],  # notnull is 0 for nullable
                        'default': row[4],
                        'comment': '',  # SQLite doesn't support comments
                        'key': 'PRI' if row[5] else '',
                        'extra': ''
                    })
            else:
                return jsonify({'error': f'不支持的数据库类型: {connection.db_type}'}), 400
            
            return jsonify({
                'database': database or connection.database,
                'schema': schema,
                'table': table,
                'columns': columns
            }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取表结构失败: {str(e)}'}), 500

