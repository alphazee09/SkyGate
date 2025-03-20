"""
SkyGate Application - Metadata Analysis Utilities
This module provides utility functions for analyzing image metadata.
"""

import logging
import re
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_exif_metadata(exif_tags):
    """
    Analyze EXIF metadata for signs of AI generation
    
    Args:
        exif_tags: Dictionary of EXIF tags extracted from an image
        
    Returns:
        dict: Analysis results
    """
    try:
        # Initialize results
        results = {
            'is_suspicious': False,
            'confidence': 0.0,
            'anomalies': []
        }
        
        # Check if EXIF data exists
        if not exif_tags:
            results['is_suspicious'] = True
            results['confidence'] = 0.7
            results['anomalies'].append('No EXIF metadata found')
            return results
        
        # Check for camera make and model
        if 'Image Make' not in exif_tags and 'Image Model' not in exif_tags:
            results['anomalies'].append('No camera make or model information')
        
        # Check for lens information
        if 'EXIF LensModel' not in exif_tags and 'EXIF LensInfo' not in exif_tags:
            results['anomalies'].append('No lens information')
        
        # Check for exposure settings
        if ('EXIF ExposureTime' not in exif_tags or 
            'EXIF FNumber' not in exif_tags or 
            'EXIF ISOSpeedRatings' not in exif_tags):
            results['anomalies'].append('Incomplete exposure settings')
        
        # Check for software information
        if 'Image Software' in exif_tags:
            software = str(exif_tags['Image Software'])
            ai_software_patterns = [
                r'(?i)stable\s*diffusion',
                r'(?i)dall\s*[- ]?e',
                r'(?i)midjourney',
                r'(?i)generative',
                r'(?i)gan',
                r'(?i)neural',
                r'(?i)deep\s*dream',
                r'(?i)ai\s*image',
                r'(?i)openai'
            ]
            
            for pattern in ai_software_patterns:
                if re.search(pattern, software):
                    results['anomalies'].append(f'AI software detected: {software}')
                    results['is_suspicious'] = True
                    results['confidence'] = 0.95
                    return results
        
        # Check for creation date consistency
        if 'EXIF DateTimeOriginal' in exif_tags and 'EXIF DateTimeDigitized' in exif_tags:
            original_date = str(exif_tags['EXIF DateTimeOriginal'])
            digitized_date = str(exif_tags['EXIF DateTimeDigitized'])
            
            if original_date != digitized_date:
                results['anomalies'].append('Inconsistent creation dates')
        
        # Check for GPS information
        has_gps = any(key.startswith('GPS ') for key in exif_tags)
        if not has_gps:
            results['anomalies'].append('No GPS information')
        
        # Calculate suspicion level based on anomalies
        anomaly_count = len(results['anomalies'])
        
        if anomaly_count >= 4:
            results['is_suspicious'] = True
            results['confidence'] = min(0.7 + (anomaly_count - 4) * 0.05, 0.9)
        elif anomaly_count >= 2:
            results['is_suspicious'] = True
            results['confidence'] = 0.5 + (anomaly_count - 2) * 0.1
        else:
            results['is_suspicious'] = False
            results['confidence'] = max(0.3 - anomaly_count * 0.15, 0.0)
        
        return results
        
    except Exception as e:
        logger.error(f"Error in EXIF metadata analysis: {str(e)}")
        return {
            'is_suspicious': False,
            'confidence': 0.0,
            'anomalies': [f'Error during analysis: {str(e)}']
        }

def extract_metadata_features(exif_tags):
    """
    Extract features from EXIF metadata for machine learning models
    
    Args:
        exif_tags: Dictionary of EXIF tags extracted from an image
        
    Returns:
        dict: Extracted features
    """
    try:
        # Initialize features
        features = {
            'has_exif': len(exif_tags) > 0,
            'has_camera_info': False,
            'has_lens_info': False,
            'has_exposure_info': False,
            'has_gps': False,
            'has_software_info': False,
            'has_date_info': False,
            'software_name': None,
            'camera_make': None,
            'camera_model': None
        }
        
        # Extract camera information
        if 'Image Make' in exif_tags:
            features['has_camera_info'] = True
            features['camera_make'] = str(exif_tags['Image Make'])
        
        if 'Image Model' in exif_tags:
            features['has_camera_info'] = True
            features['camera_model'] = str(exif_tags['Image Model'])
        
        # Extract lens information
        features['has_lens_info'] = ('EXIF LensModel' in exif_tags or 'EXIF LensInfo' in exif_tags)
        
        # Extract exposure information
        features['has_exposure_info'] = ('EXIF ExposureTime' in exif_tags and 
                                        'EXIF FNumber' in exif_tags and 
                                        'EXIF ISOSpeedRatings' in exif_tags)
        
        # Extract GPS information
        features['has_gps'] = any(key.startswith('GPS ') for key in exif_tags)
        
        # Extract software information
        if 'Image Software' in exif_tags:
            features['has_software_info'] = True
            features['software_name'] = str(exif_tags['Image Software'])
        
        # Extract date information
        features['has_date_info'] = ('EXIF DateTimeOriginal' in exif_tags or 
                                    'EXIF DateTimeDigitized' in exif_tags or 
                                    'Image DateTime' in exif_tags)
        
        return features
        
    except Exception as e:
        logger.error(f"Error in metadata feature extraction: {str(e)}")
        return {
            'has_exif': False,
            'error': str(e)
        }

def check_metadata_consistency(exif_tags):
    """
    Check for consistency in metadata values
    
    Args:
        exif_tags: Dictionary of EXIF tags extracted from an image
        
    Returns:
        dict: Consistency check results
    """
    try:
        # Initialize results
        results = {
            'is_consistent': True,
            'inconsistencies': []
        }
        
        # Check date consistency
        date_fields = [
            'EXIF DateTimeOriginal',
            'EXIF DateTimeDigitized',
            'Image DateTime'
        ]
        
        dates = {}
        for field in date_fields:
            if field in exif_tags:
                dates[field] = str(exif_tags[field])
        
        if len(dates) > 1:
            unique_dates = set(dates.values())
            if len(unique_dates) > 1:
                results['is_consistent'] = False
                results['inconsistencies'].append(f'Inconsistent dates: {dates}')
        
        # Check for impossible camera settings
        if 'EXIF FNumber' in exif_tags:
            try:
                f_number = float(str(exif_tags['EXIF FNumber']).split('/')[0])
                if f_number < 0.7 or f_number > 64:
                    results['is_consistent'] = False
                    results['inconsistencies'].append(f'Unrealistic F-number: {f_number}')
            except (ValueError, IndexError):
                pass
        
        if 'EXIF ISOSpeedRatings' in exif_tags:
            try:
                iso = int(str(exif_tags['EXIF ISOSpeedRatings']))
                if iso < 50 or iso > 409600:
                    results['is_consistent'] = False
                    results['inconsistencies'].append(f'Unrealistic ISO: {iso}')
            except ValueError:
                pass
        
        # Check for impossible GPS coordinates
        if 'GPS GPSLatitude' in exif_tags and 'GPS GPSLongitude' in exif_tags:
            try:
                # This is a simplified check; a real implementation would parse the coordinates properly
                lat = str(exif_tags['GPS GPSLatitude'])
                lon = str(exif_tags['GPS GPSLongitude'])
                
                if '[0, 0, 0]' in lat or '[0, 0, 0]' in lon:
                    results['is_consistent'] = False
                    results['inconsistencies'].append('Zero GPS coordinates')
            except Exception:
                pass
        
        return results
        
    except Exception as e:
        logger.error(f"Error in metadata consistency check: {str(e)}")
        return {
            'is_consistent': True,
            'error': str(e)
        }
