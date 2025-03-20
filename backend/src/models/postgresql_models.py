"""
SkyGate Application - Database Models
This module defines the SQLAlchemy models for the PostgreSQL database.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    account_status = db.Column(db.String(20), default='active')
    profile_image_url = db.Column(db.String(255))
    
    # Relationships
    uploads = db.relationship('Upload', backref='user', lazy=True, cascade='all, delete-orphan')
    api_keys = db.relationship('ApiKey', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'


class Upload(db.Model):
    """Upload model for tracking uploaded files"""
    __tablename__ = 'uploads'
    
    upload_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    original_file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_processed = db.Column(db.Boolean, default=False)
    processing_started_at = db.Column(db.DateTime)
    processing_completed_at = db.Column(db.DateTime)
    thumbnail_path = db.Column(db.String(255))
    
    # Relationships
    detection_result = db.relationship('DetectionResult', backref='upload', lazy=True, uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Upload {self.file_name}>'


class DetectionResult(db.Model):
    """Detection result model for storing AI detection results"""
    __tablename__ = 'detection_results'
    
    result_id = db.Column(db.Integer, primary_key=True)
    upload_id = db.Column(db.Integer, db.ForeignKey('uploads.upload_id', ondelete='CASCADE'), nullable=False)
    is_ai_generated = db.Column(db.Boolean)
    confidence_score = db.Column(db.Numeric(5, 4), nullable=False)
    processing_time = db.Column(db.Numeric(10, 3), nullable=False)  # in seconds
    detection_date = db.Column(db.DateTime, default=datetime.utcnow)
    algorithm_version = db.Column(db.String(50), nullable=False)
    result_summary = db.Column(db.Text)
    metadata_id = db.Column(db.String(50))  # Reference to MongoDB document ID
    
    # Relationships
    method_results = db.relationship('MethodResult', backref='detection_result', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<DetectionResult {self.result_id}>'


class DetectionMethod(db.Model):
    """Detection method model for tracking different detection algorithms"""
    __tablename__ = 'detection_methods'
    
    method_id = db.Column(db.Integer, primary_key=True)
    method_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    weight = db.Column(db.Numeric(3, 2), default=1.00)  # For weighted ensemble approach
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    method_results = db.relationship('MethodResult', backref='detection_method', lazy=True)
    
    def __repr__(self):
        return f'<DetectionMethod {self.method_name}>'


class MethodResult(db.Model):
    """Method result model for storing individual detection method results"""
    __tablename__ = 'method_results'
    
    method_result_id = db.Column(db.Integer, primary_key=True)
    result_id = db.Column(db.Integer, db.ForeignKey('detection_results.result_id', ondelete='CASCADE'), nullable=False)
    method_id = db.Column(db.Integer, db.ForeignKey('detection_methods.method_id', ondelete='CASCADE'), nullable=False)
    is_ai_generated = db.Column(db.Boolean)
    confidence_score = db.Column(db.Numeric(5, 4), nullable=False)
    processing_time = db.Column(db.Numeric(10, 3), nullable=False)  # in seconds
    result_details = db.Column(JSONB)  # Allows storing method-specific results
    
    def __repr__(self):
        return f'<MethodResult {self.method_result_id}>'


class ApiKey(db.Model):
    """API key model for API access management"""
    __tablename__ = 'api_keys'
    
    key_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    api_key = db.Column(db.String(100), unique=True, nullable=False)
    key_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    last_used_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    request_limit = db.Column(db.Integer, default=1000)
    requests_made = db.Column(db.Integer, default=0)
    
    # Relationships
    usage_logs = db.relationship('UsageLog', backref='api_key', lazy=True)
    
    def __repr__(self):
        return f'<ApiKey {self.key_name}>'


class UsageLog(db.Model):
    """Usage log model for tracking API usage"""
    __tablename__ = 'usage_logs'
    
    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'))
    api_key_id = db.Column(db.Integer, db.ForeignKey('api_keys.key_id', ondelete='SET NULL'))
    request_type = db.Column(db.String(50), nullable=False)
    request_path = db.Column(db.String(255), nullable=False)
    request_date = db.Column(db.DateTime, default=datetime.utcnow)
    response_code = db.Column(db.Integer, nullable=False)
    processing_time = db.Column(db.Numeric(10, 3), nullable=False)  # in seconds
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    
    def __repr__(self):
        return f'<UsageLog {self.log_id}>'
