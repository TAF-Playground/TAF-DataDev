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


@editor_bp.route('/directories/<directory_id>', methods=['PUT', 'PATCH'])
def update_directory(directory_id):
    """
    Update directory name
    ---
    tags:
      - Editor
    summary: Update directory name
    description: Updates the name of an existing directory
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: path
        name: directory_id
        type: string
        required: true
        description: Directory ID
      - in: body
        name: body
        description: Directory update information
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              description: New directory name
              example: "更新后的目录名称"
    responses:
      200:
        description: Directory updated successfully
        schema:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            type:
              type: string
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
        description: Bad request - name is required
        schema:
          type: object
          properties:
            error:
              type: string
      404:
        description: Directory not found
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
        
        if not data or 'name' not in data:
            return jsonify({'error': '目录名称不能为空'}), 400
        
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': '目录名称不能为空'}), 400
        
        directory = Directory.query.get(directory_id)
        if not directory:
            return jsonify({'error': '目录不存在'}), 404
        
        directory.name = name
        db.session.commit()
        
        return jsonify(directory.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@editor_bp.route('/projects/<project_id>', methods=['PUT', 'PATCH'])
def update_project(project_id):
    """
    Update project name
    ---
    tags:
      - Editor
    summary: Update project name
    description: Updates the name of an existing project and requirement name
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: path
        name: project_id
        type: string
        required: true
        description: Project ID
      - in: body
        name: body
        description: Project update information
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              description: New project name
              example: "更新后的项目名称"
    responses:
      200:
        description: Project updated successfully
        schema:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            type:
              type: string
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
      400:
        description: Bad request - name is required
        schema:
          type: object
          properties:
            error:
              type: string
      404:
        description: Project not found
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
        
        if not data or 'name' not in data:
            return jsonify({'error': '项目名称不能为空'}), 400
        
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': '项目名称不能为空'}), 400
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        
        project.name = name
        # 同时更新需求名称
        project.requirement_name = name
        db.session.commit()
        
        return jsonify(project.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@editor_bp.route('/projects/<project_id>/details', methods=['PUT', 'PATCH'])
def update_project_details(project_id):
    """
    Update project details
    ---
    tags:
      - Editor
    summary: Update project details
    description: Updates project details including requirement description, requester, and SQL content
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: path
        name: project_id
        type: string
        required: true
        description: Project ID
      - in: body
        name: body
        description: Project details to update
        required: true
        schema:
          type: object
          properties:
            requirementName:
              type: string
              description: Requirement name
            requirementDescription:
              type: string
              description: Requirement description
            requester:
              type: string
              description: Requester name
            sql:
              type: string
              description: SQL content
    responses:
      200:
        description: Project details updated successfully
        schema:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            projectDetails:
              type: object
      404:
        description: Project not found
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
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        
        # 更新项目详情
        if 'requirementName' in data:
            project.requirement_name = data['requirementName']
        if 'requirementDescription' in data:
            project.requirement_description = data.get('requirementDescription')
        if 'requester' in data:
            project.requester = data.get('requester')
        if 'sql' in data:
            project.sql_content = data.get('sql')
        
        db.session.commit()
        
        return jsonify(project.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@editor_bp.route('/projects/<project_id>/move', methods=['PUT', 'PATCH'])
def move_project(project_id):
    """
    Move project to different directory
    ---
    tags:
      - Editor
    summary: Move project to different directory
    description: Moves a project to a different directory or root
    consumes:
      - application/json
    produces:
      - application/json
    parameters:
      - in: path
        name: project_id
        type: string
        required: true
        description: Project ID
      - in: body
        name: body
        description: Target directory information
        required: false
        schema:
          type: object
          properties:
            targetParentId:
              type: string
              description: Target directory ID (null for root)
              nullable: true
    responses:
      200:
        description: Project moved successfully
        schema:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
            parentId:
              type: string
              nullable: true
      404:
        description: Project or target directory not found
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
        target_parent_id = data.get('targetParentId')
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': '项目不存在'}), 404
        
        # Validate target directory if provided
        if target_parent_id:
            target_parent = Directory.query.get(target_parent_id)
            if not target_parent:
                return jsonify({'error': '目标目录不存在'}), 404
        
        # Update project's directory
        project.directory_id = target_parent_id
        db.session.commit()
        
        return jsonify(project.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

