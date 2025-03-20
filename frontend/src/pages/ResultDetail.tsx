import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Button,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { detectionAPI } from '../utils/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`detection-tabpanel-${index}`}
      aria-labelledby={`detection-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface DetectionResult {
  result_id: number;
  upload_id: number;
  file_name: string;
  file_type: string;
  file_url: string;
  is_ai_generated: boolean;
  confidence_score: number;
  processing_time: number;
  detection_date: string;
  algorithm_version: string;
  result_summary: string;
  metadata: {
    exif_analysis: {
      has_metadata: boolean;
      suspicious_patterns: string[];
      software_detected: string;
      creation_date: string | null;
    };
    pixel_analysis: {
      prnu: {
        score: number;
        analysis: string;
      };
      ela: {
        score: number;
        analysis: string;
      };
      texture: {
        score: number;
        analysis: string;
      };
    };
    model_results: Array<{
      model_name: string;
      confidence: number;
      prediction: string;
    }>;
    contributing_factors: string[];
  };
}

const ResultDetail: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResultDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!resultId) {
          throw new Error('Result ID is missing');
        }
        
        const response = await detectionAPI.getDetectionById(parseInt(resultId));
        setResult(response.data);
      } catch (err: any) {
        console.error('Error fetching result details:', err);
        setError(err.response?.data?.error || 'Failed to load detection result details');
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResultDetails();
    }
  }, [resultId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} color="secondary" className="pulse" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/results')}
          variant="outlined"
        >
          Back to Results
        </Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Result not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/results')}
          variant="outlined"
        >
          Back to Results
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/results')}
        variant="outlined"
        sx={{ mb: 4 }}
      >
        Back to Results
      </Button>

      {/* Header Section */}
      <Card 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="fade-in"
      >
        {/* Status indicator bar */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '4px', 
            bgcolor: result.is_ai_generated ? 'error.main' : 'success.main' 
          }} 
        />
        
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif' }}>
                Detection Result
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>File:</strong> {result.file_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Analyzed on {formatDate(result.detection_date)} • Processing time: {result.processing_time.toFixed(2)}s
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip
                icon={result.is_ai_generated ? <CancelIcon /> : <CheckCircleIcon />}
                label={result.is_ai_generated ? 'AI Generated' : 'Real Content'}
                color={result.is_ai_generated ? 'error' : 'success'}
                sx={{ 
                  fontSize: '1rem', 
                  py: 2.5, 
                  px: 1,
                  '& .MuiChip-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              />
              <Typography 
                variant="h4" 
                sx={{ 
                  mt: 2,
                  fontWeight: 'bold',
                  color: result.is_ai_generated ? 'error.main' : 'success.main'
                }}
              >
                {Math.round(result.confidence_score * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confidence Score
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* File Preview */}
      {result.file_type.startsWith('image/') && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Paper 
            elevation={8} 
            sx={{ 
              p: 2, 
              display: 'inline-block',
              maxWidth: '100%',
              background: 'linear-gradient(145deg, #1e2746, #171e38)',
            }}
          >
            <img 
              src={result.file_url} 
              alt={result.file_name} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '400px',
                borderRadius: '4px'
              }} 
            />
          </Paper>
        </Box>
      )}

      {/* Summary Card */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif' }}>
            Analysis Summary
          </Typography>
          <Typography variant="body1" paragraph>
            {result.result_summary}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Key Contributing Factors:
          </Typography>
          <List dense>
            {result.metadata.contributing_factors.map((factor, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InfoIcon color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={factor} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': {
              py: 2,
            },
          }}
        >
          <Tab label="Detection Models" />
          <Tab label="Metadata Analysis" />
          <Tab label="Pixel Analysis" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Model Detection Results
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Multiple AI detection models were used to analyze this content.
            </Typography>
            
            <Grid container spacing={3}>
              {result.metadata.model_results.map((modelResult, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {modelResult.model_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={modelResult.confidence * 100} 
                            color={modelResult.prediction === "AI Generated" ? "error" : "success"}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(modelResult.confidence * 100)}%
                        </Typography>
                      </Box>
                      <Chip
                        label={modelResult.prediction}
                        color={modelResult.prediction === "AI Generated" ? "error" : "success"}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Metadata Examination
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Analysis of file metadata and EXIF information.
            </Typography>
            
            <Card sx={{ mb: 3, background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Metadata Present
                    </Typography>
                    <Chip
                      icon={result.metadata.exif_analysis.has_metadata ? <CheckCircleIcon /> : <CancelIcon />}
                      label={result.metadata.exif_analysis.has_metadata ? "Yes" : "No"}
                      color={result.metadata.exif_analysis.has_metadata ? "success" : "error"}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Software Detected
                    </Typography>
                    <Typography variant="body2">
                      {result.metadata.exif_analysis.software_detected || "None detected"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Creation Date
                    </Typography>
                    <Typography variant="body2">
                      {result.metadata.exif_analysis.creation_date 
                        ? formatDate(result.metadata.exif_analysis.creation_date) 
                        : "Not available"}
                    </Typography>
                  </Grid>
                </Grid>
                
                {result.metadata.exif_analysis.suspicious_patterns.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Suspicious Patterns
                    </Typography>
                    <List dense>
                      {result.metadata.exif_analysis.suspicious_patterns.map((pattern, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={pattern} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Pixel-Level Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Detailed examination of image pixels and patterns.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      PRNU Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={result.metadata.pixel_analysis.prnu.score * 100}
                        color={result.metadata.pixel_analysis.prnu.score > 0.5 ? "error" : "success"}
                        size={60}
                        thickness={4}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="h5">
                        {Math.round(result.metadata.pixel_analysis.prnu.score * 100)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {result.metadata.pixel_analysis.prnu.analysis}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ELA Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={result.metadata.pixel_analysis.ela.score * 100}
                        color={result.metadata.pixel_analysis.ela.score > 0.5 ? "error" : "success"}
                        size={60}
                        thickness={4}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="h5">
                        {Math.round(result.metadata.pixel_analysis.ela.score * 100)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {result.metadata.pixel_analysis.ela.analysis}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #1e2746, #171e38)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Texture Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={result.metadata.pixel_analysis.texture.score * 100}
                        color={result.metadata.pixel_analysis.texture.score > 0.5 ? "error" : "success"}
                        size={60}
                        thickness={4}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="h5">
                        {Math.round(result.metadata.pixel_analysis.texture.score * 100)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {result.metadata.pixel_analysis.texture.analysis}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => window.open(result.file_url, '_blank')}
        >
          Download Original
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShareIcon />}
          className="hover-glow"
          disabled={!process.env.REACT_APP_ENABLE_SOCIAL_SHARING}
        >
          Share Results
        </Button>
      </Box>
    </Box>
  );
};

export default ResultDetail;
