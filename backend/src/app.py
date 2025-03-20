"""
SkyGate Application - Main Flask Application
This module initializes the Flask application and sets up all necessary configurations.
"""

import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_restful import Api
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app(test_config=None):
    """Create and configure the Flask application"""
    app = Flask(__name__, instance_relative_config=True)
    
    # Configure app
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key_replace_in_production'),
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt_dev_key_replace_in_production'),
        UPLOAD_FOLDER=os.environ.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads')),
        MAX_CONTENT_LENGTH=50 * 1024 * 1024,  # 50MB max upload size
        POSTGRES_URI=os.environ.get('POSTGRES_URI', 'postgresql://postgres:postgres@localhost:5432/skygate'),
        MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://localhost:27017/skygate'),
        ALLOWED_EXTENSIONS={'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'mp4', 'mov', 'avi', 'webm'},
    )
    
    # Override config with test config if provided
    if test_config:
        app.config.update(test_config)
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize CORS
    CORS(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize API
    api = Api(app)
    
    # Register blueprints
    from .api import auth_bp, upload_bp, detection_bp, user_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(detection_bp)
    app.register_blueprint(user_bp)
    
    # Register API resources
    from .api.resources import (
        UserResource, UserListResource,
        UploadResource, UploadListResource,
        DetectionResource, DetectionListResource,
        AuthResource, RefreshResource
    )
    
    api.add_resource(UserResource, '/api/users/<int:user_id>')
    api.add_resource(UserListResource, '/api/users')
    api.add_resource(UploadResource, '/api/uploads/<int:upload_id>')
    api.add_resource(UploadListResource, '/api/uploads')
    api.add_resource(DetectionResource, '/api/detections/<int:result_id>')
    api.add_resource(DetectionListResource, '/api/detections')
    api.add_resource(AuthResource, '/api/auth/login')
    api.add_resource(RefreshResource, '/api/auth/refresh')
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Resource not found"}, 404
    
    @app.errorhandler(500)
    def server_error(e):
        return {"error": "Internal server error"}, 500
    
    return app
