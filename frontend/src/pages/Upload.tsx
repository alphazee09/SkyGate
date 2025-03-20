import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Fade
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, detectionAPI } from '../utils/api';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultId, setResultId] = useState<number | null>(null);
  const navigate = useNavigate();

  const steps = ['Select File', 'Upload & Process', 'View Results'];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setActiveStep(1);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxSize: parseInt(process.env.REACT_APP_MAX_UPLOAD_SIZE || '50000000'), // Default to 50MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload file with progress tracking
      const uploadResponse = await uploadAPI.uploadFile(formData, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      // Process detection
      const processResponse = await detectionAPI.processUpload(uploadResponse.data.upload_id);
      
      setResultId(processResponse.data.result_id);
      setActiveStep(2);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload and process file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewResults = () => {
    if (resultId) {
      navigate(`/results/${resultId}`);
    }
  };

  const handleReset = () => {
    setFile(null);
    setActiveStep(0);
    setUploadProgress(0);
    setError(null);
    setResultId(null);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          mb: 4,
          textAlign: 'center'
        }}
        className="glow-text"
      >
        Upload for AI Detection
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      <Card 
        elevation={8}
        sx={{ 
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom align="center">
                Select an image or video to analyze
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Supported formats: JPEG, PNG, GIF, BMP, WEBP, TIFF, MP4, MOV, AVI, WEBM
              </Typography>
              
              <Paper
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'secondary.main' : 'rgba(255, 255, 255, 0.23)',
                  borderRadius: 2,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    backgroundColor: 'rgba(0, 229, 255, 0.05)',
                  },
                }}
                className={isDragActive ? 'pulse' : ''}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop the file here' : 'Drag & drop file here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select file
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Maximum file size: {(parseInt(process.env.REACT_APP_MAX_UPLOAD_SIZE || '50000000') / (1024 * 1024)).toFixed(0)}MB
                </Typography>
              </Paper>
            </Box>
          )}

          {activeStep === 1 && file && (
            <Box>
              <Typography variant="h6" gutterBottom align="center">
                Ready to upload and analyze
              </Typography>
              
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Selected file: <strong>{file.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>

              {file.type.startsWith('image/') && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }} 
                  />
                </Box>
              )}

              {uploading ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    size={80} 
                    thickness={4}
                    color="secondary"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {uploadProgress < 100 
                      ? `Upload progress: ${uploadProgress}%` 
                      : 'Analyzing for AI-generated content...'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleReset}
                    >
                      Change File
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpload}
                      startIcon={<UploadIcon />}
                      className="hover-glow"
                    >
                      Upload & Analyze
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}

          {activeStep === 2 && resultId && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="secondary" className="glow-text">
                Analysis Complete!
              </Typography>
              
              <Box sx={{ my: 4 }}>
                <Typography variant="body1" gutterBottom>
                  Your file has been successfully analyzed.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  View the detailed results to see if the content is AI-generated.
                </Typography>
                
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleViewResults}
                  sx={{ mb: 2 }}
                  className="hover-glow"
                >
                  View Detailed Results
                </Button>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleReset}
                >
                  Analyze Another File
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif' }}>
          How It Works
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
              <Typography variant="h6" gutterBottom color="secondary">
                1. Upload
              </Typography>
              <Typography variant="body2">
                Upload any image or video file up to {(parseInt(process.env.REACT_APP_MAX_UPLOAD_SIZE || '50000000') / (1024 * 1024)).toFixed(0)}MB in size.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
              <Typography variant="h6" gutterBottom color="secondary">
                2. Analyze
              </Typography>
              <Typography variant="body2">
                Our advanced AI detection algorithms analyze the content.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
              <Typography variant="h6" gutterBottom color="secondary">
                3. Results
              </Typography>
              <Typography variant="body2">
                Get detailed results showing if the content is AI-generated.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Upload;
