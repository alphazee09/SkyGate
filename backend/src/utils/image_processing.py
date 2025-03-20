"""
SkyGate Application - Image Processing Utilities
This module provides utility functions for image processing and feature extraction.
"""

import os
import cv2
import numpy as np
from PIL import Image
import logging
from scipy import ndimage
from skimage import feature
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_ela_features(image_path, quality=90):
    """
    Extract Error Level Analysis (ELA) features from an image
    
    Args:
        image_path: Path to the image file
        quality: JPEG compression quality (0-100)
        
    Returns:
        tuple: (ELA features array, path to ELA visualization image)
    """
    try:
        # Create temporary directory for ELA processing
        temp_dir = tempfile.mkdtemp()
        temp_jpg = os.path.join(temp_dir, 'temp.jpg')
        ela_path = os.path.join(temp_dir, 'ela.png')
        
        # Open the original image
        original = Image.open(image_path).convert('RGB')
        
        # Save as temporary JPEG with specified quality
        original.save(temp_jpg, 'JPEG', quality=quality)
        
        # Open the temporary JPEG
        compressed = Image.open(temp_jpg).convert('RGB')
        
        # Calculate the difference
        ela_image = np.array(original) - np.array(compressed)
        
        # Scale the difference for better visualization
        ela_image = np.absolute(ela_image) * 10
        ela_image = np.clip(ela_image, 0, 255).astype(np.uint8)
        
        # Save ELA visualization
        Image.fromarray(ela_image).save(ela_path)
        
        # Extract features from ELA image
        # For simplicity, we'll use mean and std of each channel as features
        features = []
        for channel in range(3):
            channel_data = ela_image[:, :, channel].flatten()
            features.append(np.mean(channel_data))
            features.append(np.std(channel_data))
        
        return np.array(features), ela_path
        
    except Exception as e:
        logger.error(f"Error in ELA feature extraction: {str(e)}")
        return np.zeros(6), None

def extract_prnu_features(image_path):
    """
    Extract Photo Response Non-Uniformity (PRNU) features from an image
    
    Args:
        image_path: Path to the image file
        
    Returns:
        numpy.ndarray: PRNU features array
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply wavelet denoising to extract noise residual
        # This is a simplified approach; a real implementation would use more sophisticated methods
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        noise_residual = gray.astype(np.float32) - denoised.astype(np.float32)
        
        # Extract features from noise residual
        # For simplicity, we'll use statistical measures as features
        features = [
            np.mean(noise_residual),
            np.std(noise_residual),
            np.median(noise_residual),
            np.max(noise_residual),
            np.min(noise_residual),
            np.percentile(noise_residual, 25),
            np.percentile(noise_residual, 75)
        ]
        
        return np.array(features)
        
    except Exception as e:
        logger.error(f"Error in PRNU feature extraction: {str(e)}")
        return np.zeros(7)

def analyze_texture_smoothness(image_path):
    """
    Analyze texture smoothness of an image
    
    Args:
        image_path: Path to the image file
        
    Returns:
        float: Smoothness score (0-1, higher means smoother)
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Calculate edge density using Canny edge detector
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        
        # Calculate local binary pattern (LBP) for texture analysis
        lbp = feature.local_binary_pattern(gray, 8, 1, method='uniform')
        lbp_hist, _ = np.histogram(lbp, bins=10, range=(0, 10), density=True)
        
        # Calculate gradient magnitude
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobelx**2 + sobely**2)
        gradient_mean = np.mean(gradient_magnitude)
        
        # Calculate smoothness score
        # Lower edge density, lower gradient mean, and more uniform LBP indicate smoother textures
        edge_score = 1 - edge_density
        gradient_score = 1 - min(gradient_mean / 100, 1)
        lbp_uniformity = 1 - np.std(lbp_hist)
        
        # Combine scores (weighted average)
        smoothness_score = 0.4 * edge_score + 0.4 * gradient_score + 0.2 * lbp_uniformity
        
        return min(max(smoothness_score, 0), 1)  # Ensure score is between 0 and 1
        
    except Exception as e:
        logger.error(f"Error in texture smoothness analysis: {str(e)}")
        return 0.5  # Return neutral score on error

def detect_visual_anomalies(image_path):
    """
    Detect visual anomalies in an image that are typical of AI-generated content
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Dictionary containing detected anomalies
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Initialize results
        anomalies = []
        
        # Detect unnatural fingers (simplified approach)
        # In a real implementation, this would use more sophisticated object detection
        # and analysis methods specific to each anomaly type
        
        # For demonstration, we'll just return placeholder results
        # In a real implementation, this would perform actual detection
        
        return {
            'detected_anomalies': anomalies,
            'heatmap_path': None
        }
        
    except Exception as e:
        logger.error(f"Error in visual anomaly detection: {str(e)}")
        return {
            'detected_anomalies': [],
            'heatmap_path': None
        }

def preprocess_image_for_model(image_path, target_size=(224, 224)):
    """
    Preprocess an image for input to deep learning models
    
    Args:
        image_path: Path to the image file
        target_size: Target size for resizing
        
    Returns:
        numpy.ndarray: Preprocessed image array
    """
    try:
        # Load image
        image = Image.open(image_path).convert('RGB')
        
        # Resize
        image = image.resize(target_size, Image.LANCZOS)
        
        # Convert to numpy array
        image_array = np.array(image)
        
        # Normalize
        image_array = image_array.astype(np.float32) / 255.0
        
        # Standardize
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        image_array = (image_array - mean) / std
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        logger.error(f"Error in image preprocessing: {str(e)}")
        return np.zeros((1, target_size[0], target_size[1], 3))
