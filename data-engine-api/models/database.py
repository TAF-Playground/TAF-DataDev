"""
Database configuration and initialization
Supports SQLite (default) and PostgreSQL
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()


def get_database_uri():
    """
    Get database URI from environment variable or use default SQLite
    """
    db_type = os.getenv('DATABASE_TYPE', 'sqlite').lower()
    
    if db_type == 'postgresql':
        # PostgreSQL configuration
        db_user = os.getenv('POSTGRES_USER', 'postgres')
        db_password = os.getenv('POSTGRES_PASSWORD', '')
        db_host = os.getenv('POSTGRES_HOST', 'localhost')
        db_port = os.getenv('POSTGRES_PORT', '5432')
        db_name = os.getenv('POSTGRES_DB', 'data_engine')
        
        return f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    else:
        # SQLite (default)
        db_path = os.getenv('SQLITE_PATH', 'data_engine.db')
        return f'sqlite:///{db_path}'


def init_db(app: Flask):
    """
    Initialize database with Flask app
    """
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        print(f"Database initialized: {app.config['SQLALCHEMY_DATABASE_URI']}")

