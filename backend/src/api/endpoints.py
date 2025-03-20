"""
SkyGate Application - API Endpoints
This module defines the API endpoints for the SkyGate application.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime
import logging

from ..models.postgresql_models import db, User, Upload, DetectionResult
from ..models.mongodb_models import MongoDBModel
from ..detection.detection_engine import DetectionEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
upload_bp = Blueprint('upload', __name__, url_prefix='/api/uploads')
detection_bp = Blueprint('detection', __name__, url_prefix='/api/detections')
user_bp = Blueprint('user', __name__, url_prefix='/api/users')

# Initialize detection engine
detection_engine = DetectionEngine()

# Helper functions
def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

# Authentication endpoints
@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == data['username']) | 
            (User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 409
        
        # Create new user
        from werkzeug.security import generate_password_hash
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': new_user.user_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error in user registration: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        # Verify password
        from werkzeug.security import check_password_hash
        from flask_jwt_extended import create_access_token, create_refresh_token
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.user_id)
        refresh_token = create_refresh_token(identity=user.user_id)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user_id': user.user_id,
            'username': user.username
        }), 200
        
    except Exception as e:
        logger.error(f"Error in user login: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        from flask_jwt_extended import create_access_token
        
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=current_user_id)
        
        return jsonify({'access_token': access_token}), 200
        
    except Exception as e:
        logger.error(f"Error in token refresh: {str(e)}")
        return jsonify({'error': 'Token refresh failed'}), 500

# Upload endpoints
@upload_bp.route('', methods=['POST'])
@jwt_required()
def upload_file():
    """Upload a file for AI detection"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get current user
        current_user_id = get_jwt_identity()
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        
        # Create upload directory if it doesn't exist
        upload_folder = current_app.config['UPLOAD_FOLDER']
        user_folder = os.path.join(upload_folder, str(current_user_id))
        os.makedirs(user_folder, exist_ok=True)
        
        # Save file
        file_path = os.path.join(user_folder, unique_filename)
        file.save(file_path)
        
        # Get file size and type
        file_size = os.path.getsize(file_path)
        file_type = file_extension
        mime_type = file.content_type or f"image/{file_extension}"
        
        # Create upload record
        new_upload = Upload(
            user_id=current_user_id,
            file_name=unique_filename,
            original_file_name=original_filename,
            file_path=file_path,
            file_size=file_size,
            file_type=file_type,
            mime_type=mime_type,
            upload_date=datetime.utcnow(),
            is_processed=False
        )
        
        db.session.add(new_upload)
        db.session.commit()
        
        # Start detection process
        return process_detection(new_upload.upload_id)
        
    except Exception as e:
        logger.error(f"Error in file upload: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'File upload failed'}), 500

@upload_bp.route('', methods=['GET'])
@jwt_required()
def get_uploads():
    """Get all uploads for the current user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Query uploads
        uploads = Upload.query.filter_by(user_id=current_user_id) \
            .order_by(Upload.upload_date.desc()) \
            .paginate(page=page, per_page=per_page)
        
        # Format response
        result = {
            'items': [],
            'total': uploads.total,
            'pages': uploads.pages,
            'current_page': uploads.page
        }
        
        for upload in uploads.items:
            # Get detection result if available
            detection_result = None
            if upload.detection_result:
                detection_result = {
                    'result_id': upload.detection_result.result_id,
                    'is_ai_generated': upload.detection_result.is_ai_generated,
                    'confidence_score': float(upload.detection_result.confidence_score),
                    'detection_date': upload.detection_result.detection_date.isoformat()
                }
            
            result['items'].append({
                'upload_id': upload.upload_id,
                'file_name': upload.original_file_name,
                'file_type': upload.file_type,
                'file_size': upload.file_size,
                'upload_date': upload.upload_date.isoformat(),
                'is_processed': upload.is_processed,
                'detection_result': detection_result
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in get uploads: {str(e)}")
        return jsonify({'error': 'Failed to retrieve uploads'}), 500

@upload_bp.route('/<int:upload_id>', methods=['GET'])
@jwt_required()
def get_upload(upload_id):
    """Get a specific upload"""
    try:
        current_user_id = get_jwt_identity()
        
        # Query upload
        upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user_id).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        # Get detection result if available
        detection_result = None
        if upload.detection_result:
            detection_result = {
                'result_id': upload.detection_result.result_id,
                'is_ai_generated': upload.detection_result.is_ai_generated,
                'confidence_score': float(upload.detection_result.confidence_score),
                'detection_date': upload.detection_result.detection_date.isoformat(),
                'processing_time': float(upload.detection_result.processing_time),
                'algorithm_version': upload.detection_result.algorithm_version,
                'result_summary': upload.detection_result.result_summary
            }
        
        result = {
            'upload_id': upload.upload_id,
            'file_name': upload.original_file_name,
            'file_type': upload.file_type,
            'file_size': upload.file_size,
            'upload_date': upload.upload_date.isoformat(),
            'is_processed': upload.is_processed,
            'detection_result': detection_result
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in get upload: {str(e)}")
        return jsonify({'error': 'Failed to retrieve upload'}), 500

# Detection endpoints
@detection_bp.route('/process/<int:upload_id>', methods=['POST'])
@jwt_required()
def process_detection(upload_id):
    """Process detection for an upload"""
    try:
        current_user_id = get_jwt_identity()
        
        # Query upload
        upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user_id).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        # Check if already processed
        if upload.is_processed and upload.detection_result:
            return jsonify({
                'message': 'Upload already processed',
                'result_id': upload.detection_result.result_id
            }), 200
        
        # Update upload status
        upload.is_processed = False
        upload.processing_started_at = datetime.utcnow()
        db.session.commit()
        
        try:
            # Create MongoDB metadata document
            metadata_id = MongoDBModel.create_detection_metadata(
                result_id=None,  # Will be updated after detection result is created
                upload_id=upload.upload_id,
                user_id=current_user_id,
                file_info={
                    'file_name': upload.original_file_name,
                    'file_type': upload.file_type,
                    'file_size': upload.file_size
                }
            )
            
            # Run detection
            detection_results = detection_engine.detect(upload.file_path, str(metadata_id))
            
            # Create detection result
            new_result = DetectionResult(
                upload_id=upload.upload_id,
                is_ai_generated=detection_results['is_ai_generated'],
                confidence_score=detection_results['confidence_score'],
                processing_time=detection_results['processing_time'],
                detection_date=datetime.utcnow(),
                algorithm_version='1.0',
                result_summary=generate_result_summary(detection_results),
                metadata_id=str(metadata_id)
            )
            
            db.session.add(new_result)
            db.session.flush()  # Get the result_id without committing
            
            # Update MongoDB metadata with result_id
            MongoDBModel.update_detection_metadata(
                metadata_id=str(metadata_id),
                update_data={'result_id': new_result.result_id}
            )
            
            # Update upload status
            upload.is_processed = True
            upload.processing_completed_at = datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'message': 'Detection processed successfully',
                'result_id': new_result.result_id,
                'is_ai_generated': new_result.is_ai_generated,
                'confidence_score': float(new_result.confidence_score)
            }), 200
            
        except Exception as e:
            logger.error(f"Error in detection processing: {str(e)}")
            db.session.rollback()
            return jsonify({'error': 'Detection processing failed'}), 500
        
    except Exception as e:
        logger.error(f"Error in process detection: {str(e)}")
        return jsonify({'error': 'Failed to process detection'}), 500

@detection_bp.route('/<int:result_id>', methods=['GET'])
@jwt_required()
def get_detection_result(result_id):
    """Get a specific detection result"""
    try:
        current_user_id = get_jwt_identity()
        
        # Query detection result
        result = DetectionResult.query.join(Upload).filter(
            DetectionResult.result_id == result_id,
            Upload.user_id == current_user_id
        ).first()
        
        if not result:
            return jsonify({'error': 'Detection result not found'}), 404
        
        # Get MongoDB metadata
        metadata = None
        if result.metadata_id:
            metadata = MongoDBModel.get_detection_metadata(result.metadata_id)
        
        # Format response
        response = {
            'result_id': result.result_id,
            'upload_id': result.upload_id,
            'is_ai_generated': result.is_ai_generated,
            'confidence_score': float(result.confidence_score),
            'processing_time': float(result.processing_time),
            'detection_date': result.detection_date.isoformat(),
            'algorithm_version': result.algorithm_version,
            'result_summary': result.result_summary
        }
        
        # Add metadata if available
        if metadata:
            response['metadata'] = {
                'exif_analysis': metadata.get('exif_data', {}).get('analysis_result', {}),
                'pixel_analysis': {
                    'prnu': metadata.get('pixel_analysis', {}).get('prnu_results', {}),
                    'ela': metadata.get('pixel_analysis', {}).get('ela_results', {}),
                    'texture': metadata.get('pixel_analysis', {}).get('texture_analysis', {})
                },
                'model_results': metadata.get('model_results', []),
                'contributing_factors': metadata.get('aggregated_results', {}).get('contributing_factors', [])
            }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get detection result: {str(e)}")
        return jsonify({'error': 'Failed to retrieve detection result'}), 500

# User endpoints
@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        
        # Query user
        user = User.query.filter_by(user_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Format response
        response = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'profile_image_url': user.profile_image_url
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get profile: {str(e)}")
        return jsonify({'error': 'Failed to retrieve profile'}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Query user
        user = User.query.filter_by(user_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        if 'email' in data:
            # Check if email is already used
            existing_user = User.query.filter(
                User.email == data['email'],
                User.user_id != current_user_id
            ).first()
            
            if existing_user:
                return jsonify({'error': 'Email already in use'}), 409
            
            user.email = data['email']
        
        if 'profile_image_url' in data:
            user.profile_image_url = data['profile_image_url']
        
        # Update password if provided
        if 'current_password' in data and 'new_password' in data:
            from werkzeug.security import check_password_hash, generate_password_hash
            
            if not check_password_hash(user.password_hash, data['current_password']):
                return jsonify({'error': 'Current password is incorrect'}), 401
            
            user.password_hash = generate_password_hash(data['new_password'])
        
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error in update profile: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

# Helper functions
def generate_result_summary(detection_results):
    """Generate a human-readable summary of detection results"""
    try:
        is_ai_generated = detection_results['is_ai_generated']
        confidence = detection_results['confidence_score']
        contributing_factors = detection_results.get('contributing_factors', [])
        
        if is_ai_generated:
            summary = f"This image is likely AI-generated with {confidence:.1%} confidence. "
            
            if contributing_factors:
                summary += "Key indicators include: "
                factor_descriptions = []
                
                for factor in contributing_factors:
                    factor_name = factor['factor']
                    contribution = factor['contribution']
                    
                    if factor_name == 'metadata_analysis':
                        factor_descriptions.append(f"suspicious metadata patterns ({contribution:.1%} confidence)")
                    elif factor_name == 'ela_analysis':
                        factor_descriptions.append(f"error level analysis ({contribution:.1%} confidence)")
                    elif factor_name == 'prnu_analysis':
                        factor_descriptions.append(f"photo response non-uniformity ({contribution:.1%} confidence)")
                    elif factor_name == 'texture_analysis':
                        factor_descriptions.append(f"unnatural texture smoothness ({contribution:.1%} confidence)")
                    elif factor_name == 'vit_model':
                        factor_descriptions.append(f"Vision Transformer model detection ({contribution:.1%} confidence)")
                    elif factor_name == 'resnet_model':
                        factor_descriptions.append(f"ResNet model detection ({contribution:.1%} confidence)")
                
                summary += ", ".join(factor_descriptions) + "."
            
        else:
            summary = f"This image appears to be authentic with {(1-confidence):.1%} confidence. "
            summary += "No significant indicators of AI generation were detected."
        
        return summary
        
    except Exception as e:
        logger.error(f"Error in generate result summary: {str(e)}")
        return "Detection completed, but summary generation failed."
