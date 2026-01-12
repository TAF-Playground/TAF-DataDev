"""
Project model for storing project information
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import db


class Project(db.Model):
    """
    Project model for storing project details
    """
    __tablename__ = 'projects'
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    directory_id = Column(String(36), ForeignKey('directories.id'), nullable=True)
    requirement_name = Column(String(255), nullable=True)  # 需求名称（通常等于项目名称）
    requirement_description = Column(Text, nullable=True)  # 需求描述
    requester = Column(String(255), nullable=True)  # 需求方
    creator = Column(String(255), nullable=True)  # 创建人
    sql_content = Column(Text, nullable=True)  # SQL内容
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    directory = relationship('Directory', back_populates='projects')
    
    def __init__(
        self,
        id: str,
        name: str,
        directory_id: Optional[str] = None,
        requirement_name: Optional[str] = None,
        requirement_description: Optional[str] = None,
        requester: Optional[str] = None,
        creator: Optional[str] = None,
        sql_content: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.directory_id = directory_id
        self.requirement_name = requirement_name or name  # 默认使用项目名称
        self.requirement_description = requirement_description
        self.requester = requester
        self.creator = creator
        self.sql_content = sql_content
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> dict:
        """
        Convert project to dictionary
        """
        return {
            'id': self.id,
            'name': self.name,
            'type': 'file',
            'parentId': self.directory_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'projectDetails': {
                'requirementName': self.requirement_name,
                'requirementDescription': self.requirement_description,
                'requester': self.requester,
                'creator': self.creator,
                'sql': self.sql_content,
            }
        }
    
    def __repr__(self):
        return f'<Project {self.id}: {self.name}>'

