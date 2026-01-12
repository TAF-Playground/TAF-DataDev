"""
Editor API endpoints for directory and project management
"""
import uuid
from flask import Blueprint, request, jsonify
from models import db
from models.directory import Directory
from models.project import Project

editor_bp = Blueprint('editor', __name__, url_prefix='/editor')


def build_file_tree(directories, projects):
    """
    Build a hierarchical file tree structure from directories and projects
    """
    # Create a map of all items by parent_id
    items_by_parent = {}
    
    # Add directories
    for directory in directories:
        parent_id = directory.parent_id if directory.parent_id else 'root'
        if parent_id not in items_by_parent:
            items_by_parent[parent_id] = []
        items_by_parent[parent_id].append(directory.to_dict(include_children=False))
    
    # Add projects
    for project in projects:
        parent_id = project.directory_id if project.directory_id else 'root'
        if parent_id not in items_by_parent:
            items_by_parent[parent_id] = []
        items_by_parent[parent_id].append(project.to_dict())
    
    # Build tree recursively
    def build_tree(parent_id='root'):
        items = items_by_parent.get(parent_id, [])
        result = []
        for item in items:
            if item['type'] == 'directory':
                # Get children for this directory
                children = build_tree(item['id'])
                if children:
                    item['children'] = children
            result.append(item)
        return result
    
    return build_tree()


@editor_bp.route('/files', methods=['GET'])
def get_files():
    """
    Get all files and directories in tree structure
    ---
    tags:
      - Editor
    summary: Get all files and directories
    description: Returns a hierarchical tree structure of all directories and projects
    responses:
      200:
        description: Successfully retrieved files and directories
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "dir_xxx"
              name:
                type: string
                example: "目录名称"
              type:
                type: string
                enum: [directory, file]
              parentId:
                type: string
                nullable: true
              children:
                type: array
                items:
                  type: object
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
        directories = Directory.query.all()
        projects = Project.query.all()
        
        # Build tree structure
        tree = build_file_tree(directories, projects)
        
        return jsonify(tree), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@editor_bp.route('/directories', methods=['POST'])
def create_directory():
    """
    Create a new directory
    ---
    tags:
      - Editor
    summary: Create a new directory
    description: Creates a new directory with optional parent directory
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: body
        name: body
        description: Directory information
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              description: Directory name
              example: "新目录"
            parentId:
              type: string
              description: Parent directory ID (optional)
              example: "dir_xxx"
              nullable: true
    responses:
      201:
        description: Directory created successfully
        schema:
          type: object
          properties:
            id:
              type: string
              example: "dir_xxx"
            name:
              type: string
              example: "新目录"
            type:
              type: string
              example: "directory"
            parentId:
              type: string
              nullable: true
            createdAt:
              type: string
              format: date-time
            updatedAt:
              type: string
              format: date-time
      400:
        description: Bad request - directory name is required
        schema:
          type: object
          properties:
            error:
              type: string
              example: "目录名称不能为空"
      404:
        description: Parent directory not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: "父目录不存在"
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
        
        if not data or 'name' not in data:
            return jsonify({'error': '目录名称不能为空'}), 400
        
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': '目录名称不能为空'}), 400
        
        parent_id = data.get('parentId')
        
        # Validate parent directory if provided
        if parent_id:
            parent = Directory.query.get(parent_id)
            if not parent:
                return jsonify({'error': '父目录不存在'}), 404
        
        # Create new directory
        directory_id = f"dir_{uuid.uuid4()}"
        new_directory = Directory(
            id=directory_id,
            name=name,
            parent_id=parent_id
        )
        
        db.session.add(new_directory)
        db.session.commit()
        
        return jsonify(new_directory.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@editor_bp.route('/projects', methods=['POST'])
def create_project():
    """
    Create a new project
    ---
    tags:
      - Editor
    summary: Create a new project
    description: Creates a new project with optional parent directory
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: body
        name: body
        description: Project information
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              description: Project name
              example: "新项目"
            parentId:
              type: string
              description: Parent directory ID (optional)
              example: "dir_xxx"
              nullable: true
            creator:
              type: string
              description: "Creator name (optional, default: 当前用户)"
              example: "张三"
    responses:
      201:
        description: Project created successfully
        schema:
          type: object
          properties:
            id:
              type: string
              example: "file_xxx"
            name:
              type: string
              example: "新项目"
            type:
              type: string
              example: "file"
            parentId:
              type: string
              nullable: true
            createdAt:
              type: string
              format: date-time
            updatedAt:
              type: string
              format: date-time
            projectDetails:
              type: object
              properties:
                requirementName:
                  type: string
                requirementDescription:
                  type: string
                  nullable: true
                requester:
                  type: string
                  nullable: true
                creator:
                  type: string
                sql:
                  type: string
                  nullable: true
      400:
        description: Bad request - project name is required
        schema:
          type: object
          properties:
            error:
              type: string
              example: "项目名称不能为空"
      404:
        description: Parent directory not found
        schema:
          type: object
          properties:
            error:
              type: string
              example: "父目录不存在"
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
        
        if not data or 'name' not in data:
            return jsonify({'error': '项目名称不能为空'}), 400
        
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': '项目名称不能为空'}), 400
        
        parent_id = data.get('parentId')
        creator = data.get('creator', '当前用户')  # 默认创建人
        
        # Validate parent directory if provided
        if parent_id:
            parent = Directory.query.get(parent_id)
            if not parent:
                return jsonify({'error': '父目录不存在'}), 404
        
        # Create new project
        project_id = f"file_{uuid.uuid4()}"
        new_project = Project(
            id=project_id,
            name=name,
            directory_id=parent_id,
            requirement_name=name,  # 需求名称默认为项目名称
            creator=creator
        )
        
        db.session.add(new_project)
        db.session.commit()
        
        return jsonify(new_project.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

