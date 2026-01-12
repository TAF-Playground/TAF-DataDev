"""
Database initialization script
Run this to create database tables
"""
from flask import Flask
from .database import init_db, db
from .directory import Directory
from .project import Project


def create_app():
    """
    Create Flask app for initialization
    """
    app = Flask(__name__)
    init_db(app)
    return app


if __name__ == '__main__':
    import sys
    import os
    # Add parent directory to path for imports
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    from models.database import init_db, db
    from models.directory import Directory
    from models.project import Project
    
    app = Flask(__name__)
    init_db(app)
    print("Database tables created successfully!")

