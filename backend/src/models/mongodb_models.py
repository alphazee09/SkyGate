"""
SkyGate Application - MongoDB Models
This module defines the MongoDB models and connection utilities.
"""

from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/skygate')
client = MongoClient(mongo_uri)
db = client.get_database()

# Collections
detection_metadata = db.detection_metadata
system_configuration = db.system_configuration

class MongoDBModel:
    """Base class for MongoDB models with common operations"""
    
    @staticmethod
    def create_detection_metadata(result_id, upload_id, user_id, file_info=None):
        """
        Create a new detection metadata document
        
        Args:
            result_id: Reference to PostgreSQL detection_results.result_id
            upload_id: Reference to PostgreSQL uploads.upload_id
            user_id: Reference to PostgreSQL users.user_id
            file_info: Dictionary containing file information
            
        Returns:
            ObjectId: The ID of the created document
        """
        metadata_doc = {
            "result_id": result_id,
            "upload_id": upload_id,
            "user_id": user_id,
            "file_info": file_info or {},
            "exif_data": {
                "exists": False,
                "analysis_result": {
                    "is_suspicious": False,
                    "confidence": 0.0,
                    "anomalies": []
                }
            },
            "pixel_analysis": {
                "prnu_results": {
                    "pattern_score": 0.0,
                    "is_suspicious": False,
                    "confidence": 0.0
                },
                "ela_results": {
                    "error_level_score": 0.0,
                    "is_suspicious": False,
                    "confidence": 0.0
                },
                "texture_analysis": {
                    "smoothness_score": 0.0,
                    "is_suspicious": False,
                    "confidence": 0.0
                }
            },
            "model_results": [],
            "visual_anomalies": {
                "detected_anomalies": []
            },
            "aggregated_results": {
                "is_ai_generated": False,
                "confidence_score": 0.0,
                "contributing_factors": []
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = detection_metadata.insert_one(metadata_doc)
        return result.inserted_id
    
    @staticmethod
    def update_detection_metadata(metadata_id, update_data):
        """
        Update an existing detection metadata document
        
        Args:
            metadata_id: The ID of the document to update
            update_data: Dictionary containing fields to update
            
        Returns:
            bool: True if update was successful, False otherwise
        """
        update_data["updated_at"] = datetime.utcnow()
        
        result = detection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    def get_detection_metadata(metadata_id):
        """
        Retrieve a detection metadata document by ID
        
        Args:
            metadata_id: The ID of the document to retrieve
            
        Returns:
            dict: The retrieved document or None if not found
        """
        return detection_metadata.find_one({"_id": ObjectId(metadata_id)})
    
    @staticmethod
    def get_detection_metadata_by_result_id(result_id):
        """
        Retrieve a detection metadata document by result_id
        
        Args:
            result_id: The result_id to search for
            
        Returns:
            dict: The retrieved document or None if not found
        """
        return detection_metadata.find_one({"result_id": result_id})
    
    @staticmethod
    def create_system_config(config_name, config_type, parameters, created_by=None):
        """
        Create a new system configuration document
        
        Args:
            config_name: Name of the configuration
            config_type: Type of configuration (e.g., "model", "algorithm", "threshold")
            parameters: Dictionary containing configuration parameters
            created_by: User ID of the creator
            
        Returns:
            ObjectId: The ID of the created document
        """
        config_doc = {
            "config_name": config_name,
            "config_type": config_type,
            "parameters": parameters,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": created_by
        }
        
        result = system_configuration.insert_one(config_doc)
        return result.inserted_id
    
    @staticmethod
    def get_active_config(config_type):
        """
        Retrieve active configuration of a specific type
        
        Args:
            config_type: Type of configuration to retrieve
            
        Returns:
            dict: The retrieved configuration or None if not found
        """
        return system_configuration.find_one({
            "config_type": config_type,
            "is_active": True
        })
    
    @staticmethod
    def get_all_configs(config_type=None):
        """
        Retrieve all configurations, optionally filtered by type
        
        Args:
            config_type: Optional type of configurations to retrieve
            
        Returns:
            list: List of configuration documents
        """
        query = {}
        if config_type:
            query["config_type"] = config_type
            
        return list(system_configuration.find(query))
