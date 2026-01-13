"""
Database connection model for storing database connection information
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Text, Integer
from .database import db


class DatabaseConnection(db.Model):
    """
    Database connection model for storing database connection information
    """
    __tablename__ = 'database_connections'
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)  # 连接名称
    db_type = Column(String(50), nullable=False)  # 数据库类型: mysql, postgresql, sqlite, etc.
    host = Column(String(255), nullable=True)  # 主机地址
    port = Column(Integer, nullable=True)  # 端口
    database = Column(String(255), nullable=True)  # 数据库名
    username = Column(String(255), nullable=True)  # 用户名
    password = Column(String(255), nullable=True)  # 密码（加密存储）
    connection_string = Column(Text, nullable=True)  # 连接字符串（可选）
    description = Column(Text, nullable=True)  # 描述
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __init__(
        self,
        id: str,
        name: str,
        db_type: str,
        host: Optional[str] = None,
        port: Optional[int] = None,
        database: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        connection_string: Optional[str] = None,
        description: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.db_type = db_type
        self.host = host
        self.port = port
        self.database = database
        self.username = username
        self.password = password
        self.connection_string = connection_string
        self.description = description
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_password: bool = False) -> dict:
        """
        Convert database connection to dictionary
        """
        result = {
            'id': self.id,
            'name': self.name,
            'dbType': self.db_type,
            'host': self.host,
            'port': self.port,
            'database': self.database,
            'username': self.username,
            'connectionString': self.connection_string,
            'description': self.description,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_password:
            result['password'] = self.password
        
        return result
    
    def __repr__(self):
        return f'<DatabaseConnection {self.id}: {self.name}>'

