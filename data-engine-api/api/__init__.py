"""
API package for data-engine-api
"""
from flask import Blueprint

# Create main API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import blueprints to register routes
from . import editor

# Register blueprints
api_bp.register_blueprint(editor.editor_bp)

