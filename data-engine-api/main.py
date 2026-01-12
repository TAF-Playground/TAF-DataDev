"""
Main application entry point
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from models import init_db
from api import api_bp


def create_app():
    """
    Create and configure Flask application
    """
    app = Flask(__name__)
    
    # Enable CORS for frontend
    CORS(app)
    
    # Initialize Swagger
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api-docs"
    }
    
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Data Engine API",
            "description": "API documentation for Data Engine - Directory and Project Management",
            "version": "1.0.0",
            "contact": {
                "name": "API Support"
            }
        },
        "basePath": "/api",
        "schemes": ["http", "https"],
        "tags": [
            {
                "name": "Editor",
                "description": "Editor API endpoints for directory and project management"
            }
        ]
    }
    
    Swagger(app, config=swagger_config, template=swagger_template)
    
    # Initialize database
    init_db(app)
    
    # Register API blueprints
    app.register_blueprint(api_bp)
    
    return app


def main():
    """
    Main entry point
    """
    app = create_app()
    
    @app.route('/health', methods=['GET'])
    def health():
        """Health check endpoint"""
        return jsonify({'status': 'ok', 'message': 'Data Engine API is running'}), 200
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)


if __name__ == "__main__":
    main()
