"""
SkyGate Application - API Resources
This module defines the RESTful API resources for the SkyGate application.
"""

from flask_restful import Resource, reqparse
from flask import request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging

from ..models.postgresql_models import db, User, Upload, DetectionResult
from ..models.mongodb_models import MongoDBModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UserResource(Resource):
    """Resource for individual user operations"""
    
    @jwt_required()
    def get(self, user_id):
        """Get user details"""
        try:
            current_user_id = get_jwt_identity()
            
            # Only allow users to access their own data
            if current_user_id != user_id:
                return {'error': 'Unauthorized access'}, 403
            
            user = User.query.filter_by(user_id=user_id).first()
            
            if not user:
                return {'error': 'User not found'}, 404
            
            return {
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'profile_image_url': user.profile_image_url
            }, 200
            
        except Exception as e:
            logger.error(f"Error in get user: {str(e)}")
            return {'error': 'Failed to retrieve user'}, 500
    
    @jwt_required()
    def put(self, user_id):
        """Update user details"""
        try:
            current_user_id = get_jwt_identity()
            
            # Only allow users to update their own data
            if current_user_id != user_id:
                return {'error': 'Unauthorized access'}, 403
            
            user = User.query.filter_by(user_id=user_id).first()
            
            if not user:
                return {'error': 'User not found'}, 404
            
            data = request.get_json()
            
            # Update fields
            if 'first_name' in data:
                user.first_name = data['first_name']
            
            if 'last_name' in data:
                user.last_name = data['last_name']
            
            if 'email' in data:
                # Check if email is already used
                existing_user = User.query.filter(
                    User.email == data['email'],
                    User.user_id != user_id
                ).first()
                
                if existing_user:
                    return {'error': 'Email already in use'}, 409
                
                user.email = data['email']
            
            if 'profile_image_url' in data:
                user.profile_image_url = data['profile_image_url']
            
            db.session.commit()
            
            return {'message': 'User updated successfully'}, 200
            
        except Exception as e:
            logger.error(f"Error in update user: {str(e)}")
            db.session.rollback()
            return {'error': 'Failed to update user'}, 500
    
    @jwt_required()
    def delete(self, user_id):
        """Delete user"""
        try:
            current_user_id = get_jwt_identity()
            
            # Only allow users to delete their own account
            if current_user_id != user_id:
                return {'error': 'Unauthorized access'}, 403
            
            user = User.query.filter_by(user_id=user_id).first()
            
            if not user:
                return {'error': 'User not found'}, 404
            
            db.session.delete(user)
            db.session.commit()
            
            return {'message': 'User deleted successfully'}, 200
            
        except Exception as e:
            logger.error(f"Error in delete user: {str(e)}")
            db.session.rollback()
            return {'error': 'Failed to delete user'}, 500

class UserListResource(Resource):
    """Resource for user collection operations"""
    
    def post(self):
        """Create a new user"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['username', 'email', 'password']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            # Check if user already exists
            existing_user = User.query.filter(
                (User.username == data['username']) | 
                (User.email == data['email'])
            ).first()
            
            if existing_user:
                return {'error': 'Username or email already exists'}, 409
            
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
            
            return {
                'message': 'User created successfully',
                'user_id': new_user.user_id
            }, 201
            
        except Exception as e:
            logger.error(f"Error in create user: {str(e)}")
            db.session.rollback()
            return {'error': 'Failed to create user'}, 500

class UploadResource(Resource):
    """Resource for individual upload operations"""
    
    @jwt_required()
    def get(self, upload_id):
        """Get upload details"""
        try:
            current_user_id = get_jwt_identity()
            
            upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user_id).first()
            
            if not upload:
                return {'error': 'Upload not found'}, 404
            
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
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get upload: {str(e)}")
            return {'error': 'Failed to retrieve upload'}, 500
    
    @jwt_required()
    def delete(self, upload_id):
        """Delete upload"""
        try:
            current_user_id = get_jwt_identity()
            
            upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user_id).first()
            
            if not upload:
                return {'error': 'Upload not found'}, 404
            
            # Delete file
            import os
            if os.path.exists(upload.file_path):
                os.remove(upload.file_path)
            
            # Delete from database
            db.session.delete(upload)
            db.session.commit()
            
            return {'message': 'Upload deleted successfully'}, 200
            
        except Exception as e:
            logger.error(f"Error in delete upload: {str(e)}")
            db.session.rollback()
            return {'error': 'Failed to delete upload'}, 500

class UploadListResource(Resource):
    """Resource for upload collection operations"""
    
    @jwt_required()
    def get(self):
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
            
            return result, 200
            
        except Exception as e:
            logger.error(f"Error in get uploads: {str(e)}")
            return {'error': 'Failed to retrieve uploads'}, 500

class DetectionResource(Resource):
    """Resource for individual detection result operations"""
    
    @jwt_required()
    def get(self, result_id):
        """Get detection result details"""
        try:
            current_user_id = get_jwt_identity()
            
            # Query detection result
            result = DetectionResult.query.join(Upload).filter(
                DetectionResult.result_id == result_id,
                Upload.user_id == current_user_id
            ).first()
            
            if not result:
                return {'error': 'Detection result not found'}, 404
            
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
            
            return response, 200
            
        except Exception as e:
            logger.error(f"Error in get detection result: {str(e)}")
            return {'error': 'Failed to retrieve detection result'}, 500

class DetectionListResource(Resource):
    """Resource for detection result collection operations"""
    
    @jwt_required()
    def get(self):
        """Get all detection results for the current user"""
        try:
            current_user_id = get_jwt_identity()
            
            # Get pagination parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            # Query detection results
            results = DetectionResult.query.join(Upload).filter(
                Upload.user_id == current_user_id
            ).order_by(DetectionResult.detection_date.desc()) \
                .paginate(page=page, per_page=per_page)
            
            # Format response
            response = {
                'items': [],
                'total': results.total,
                'pages': results.pages,
                'current_page': results.page
            }
            
            for result in results.items:
                response['items'].append({
                    'result_id': result.result_id,
                    'upload_id': result.upload_id,
                    'is_ai_generated': result.is_ai_generated,
                    'confidence_score': float(result.confidence_score),
                    'detection_date': result.detection_date.isoformat(),
                    'algorithm_version': result.algorithm_version,
                    'result_summary': result.result_summary
                })
            
            return response, 200
            
        except Exception as e:
            logger.error(f"Error in get detection results: {str(e)}")
            return {'error': 'Failed to retrieve detection results'}, 500

class AuthResource(Resource):
    """Resource for authentication operations"""
    
    def post(self):
        """Login a user"""
        try:
            data = request.get_json()
            
            # Validate required fields
            if 'username' not in data or 'password' not in data:
                return {'error': 'Username and password are required'}, 400
            
            # Find user
            user = User.query.filter_by(username=data['username']).first()
            
            # Verify password
            from werkzeug.security import check_password_hash
            from flask_jwt_extended import create_access_token, create_refresh_token
            from datetime import datetime
            
            if not user or not check_password_hash(user.password_hash, data['password']):
                return {'error': 'Invalid username or password'}, 401
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Generate tokens
            access_token = create_access_token(identity=user.user_id)
            refresh_token = create_refresh_token(identity=user.user_id)
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user_id': user.user_id,
                'username': user.username
            }, 200
            
        except Exception as e:
            logger.error(f"Error in user login: {str(e)}")
            return {'error': 'Login failed'}, 500

class RefreshResource(Resource):
    """Resource for token refresh operations"""
    
    @jwt_required(refresh=True)
    def post(self):
        """Refresh access token"""
        try:
            from flask_jwt_extended import create_access_token
            
            current_user_id = get_jwt_identity()
            access_token = create_access_token(identity=current_user_id)
            
            return {'access_token': access_token}, 200
            
        except Exception as e:
            logger.error(f"Error in token refresh: {str(e)}")
            return {'error': 'Token refresh failed'}, 500
