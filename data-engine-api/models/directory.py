"""
Directory model for organizing projects
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import db


class Directory(db.Model):
    """
    Directory model for organizing projects
    """
    __tablename__ = 'directories'
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(String(36), ForeignKey('directories.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    parent = relationship('Directory', remote_side=[id], backref='children')
    projects = relationship('Project', back_populates='directory', cascade='all, delete-orphan')
    
    def __init__(self, id: str, name: str, parent_id: Optional[str] = None):
        self.id = id
        self.name = name
        self.parent_id = parent_id
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_children: bool = False) -> dict:
        """
        Convert directory to dictionary
        """
        result = {
            'id': self.id,
            'name': self.name,
            'type': 'directory',
            'parentId': self.parent_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_children:
            result['children'] = [
                child.to_dict(include_children=True) 
                for child in self.children
            ] + [
                project.to_dict() 
                for project in self.projects
            ]
        
        return result
    
    def __repr__(self):
        return f'<Directory {self.id}: {self.name}>'

