import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  CircularProgress,
  Container,
  Divider,
  Alert
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Assessment as ResultsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../utils/api';

interface DashboardStats {
  total_uploads: number;
  ai_detected: number;
  real_detected: number;
  recent_results: Array<{
    result_id: number;
    file_name: string;
    is_ai_generated: boolean;
    confidence_score: number;
    detection_date: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
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
          variant="contained"
          color="primary"
          onClick={fetchDashboardData}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 600,
            }}
            className="glow-text"
          >
            Welcome to SkyGate
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Advanced AI-generated content detection at your fingertips
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
              className="fade-in"
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  bgcolor: 'primary.main' 
                }} 
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    Total Uploads
                  </Typography>
                  <UploadIcon color="primary" />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats?.total_uploads || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
              className="fade-in"
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  bgcolor: 'error.main' 
                }} 
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    AI Detected
                  </Typography>
                  <SecurityIcon color="error" />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats?.ai_detected || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
              className="fade-in"
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  bgcolor: 'success.main' 
                }} 
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    Real Content
                  </Typography>
                  <SpeedIcon color="success" />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats?.real_detected || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
              className="fade-in"
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  bgcolor: 'secondary.main' 
                }} 
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    Detection Rate
                  </Typography>
                  <ResultsIcon color="secondary" />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats && stats.total_uploads > 0 
                    ? `${Math.round((stats.ai_detected / stats.total_uploads) * 100)}%` 
                    : '0%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 6, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1e2746, #171e38)',
          }}
          className="fade-in"
        >
          <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
                sx={{ py: 2 }}
                className="hover-glow"
              >
                Upload New File
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={<ResultsIcon />}
                onClick={() => navigate('/results')}
                sx={{ py: 2 }}
              >
                View All Results
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Results */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif' }}>
            Recent Results
          </Typography>
          
          {stats && stats.recent_results.length > 0 ? (
            <Grid container spacing={2}>
              {stats.recent_results.map((result) => (
                <Grid item xs={12} sm={6} md={4} key={result.result_id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
                      },
                    }}
                    onClick={() => navigate(`/results/${result.result_id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" noWrap sx={{ maxWidth: '70%' }}>
                          {result.file_name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: result.is_ai_generated ? 'error.main' : 'success.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {result.is_ai_generated ? 'AI' : 'Real'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(result.detection_date)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {Math.round(result.confidence_score * 100)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">
                No detection results yet. Upload your first file to get started.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
                sx={{ mt: 2 }}
              >
                Upload File
              </Button>
            </Paper>
          )}
        </Box>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Divider sx={{ mb: 6 }} />
          <Typography 
            variant="h5" 
            gutterBottom 
            align="center" 
            sx={{ 
              fontFamily: '"Orbitron", sans-serif',
              mb: 4
            }}
          >
            SkyGate Detection Features
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(63, 81, 181, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <img 
                    src="/assets/icons/pixel-analysis.svg" 
                    alt="Pixel Analysis" 
                    width={40} 
                    height={40}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Pixel Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced algorithms analyze pixel patterns to detect inconsistencies typical in AI-generated images.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(0, 229, 255, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <img 
                    src="/assets/icons/metadata.svg" 
                    alt="Metadata Examination" 
                    width={40} 
                    height={40}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Metadata Examination
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thorough analysis of file metadata to identify missing or inconsistent information in AI-generated content.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(244, 67, 54, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <img 
                    src="/assets/icons/gan-detection.svg" 
                    alt="GAN Detection" 
                    width={40} 
                    height={40}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  GAN Detection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Specialized neural networks trained to recognize patterns and artifacts produced by Generative Adversarial Networks.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
