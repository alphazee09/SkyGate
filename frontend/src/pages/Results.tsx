import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Videocam as VideoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { detectionAPI } from '../utils/api';

interface DetectionResult {
  result_id: number;
  upload_id: number;
  file_name: string;
  file_type: string;
  upload_date: string;
  is_ai_generated: boolean;
  confidence_score: number;
  detection_date: string;
}

const Results: React.FC = () => {
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ai' | 'real'>('all');
  const navigate = useNavigate();

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters
      const filters: Record<string, string> = {};
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (filterType !== 'all') {
        filters.is_ai_generated = filterType === 'ai' ? 'true' : 'false';
      }
      
      const response = await detectionAPI.getAllDetections(page, 12, filters);
      
      setResults(response.data.items);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.error || 'Failed to load detection results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchResults();
  };

  const handleResultClick = (resultId: number) => {
    navigate(`/results/${resultId}`);
  };

  const handleFilterChange = (type: 'all' | 'ai' | 'real') => {
    setFilterType(type);
    setPage(1); // Reset to first page when filtering
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType.startsWith('video/')) {
      return <VideoIcon />;
    }
    return null;
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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          mb: 1,
          textAlign: 'center'
        }}
        className="glow-text"
      >
        Detection Results
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        align="center" 
        sx={{ mb: 4 }}
      >
        View and analyze your previous detection results
      </Typography>

      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<FilterIcon />}
                label="All"
                clickable
                color={filterType === 'all' ? 'secondary' : 'default'}
                onClick={() => handleFilterChange('all')}
                sx={{ flex: 1 }}
              />
              <Chip
                label="AI Generated"
                clickable
                color={filterType === 'ai' ? 'secondary' : 'default'}
                onClick={() => handleFilterChange('ai')}
                sx={{ flex: 1 }}
              />
              <Chip
                label="Real"
                clickable
                color={filterType === 'real' ? 'secondary' : 'default'}
                onClick={() => handleFilterChange('real')}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} color="secondary" className="pulse" />
        </Box>
      ) : results.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterType !== 'all' 
              ? 'Try changing your search or filter criteria'
              : 'Upload an image or video to get started'}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {results.map((result) => (
              <Grid item xs={12} sm={6} md={4} key={result.result_id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                  className="fade-in"
                >
                  <CardActionArea 
                    onClick={() => handleResultClick(result.result_id)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFileTypeIcon(result.file_type)}
                        <Typography variant="subtitle2" noWrap sx={{ maxWidth: 150 }}>
                          {result.file_name}
                        </Typography>
                      </Box>
                      <Chip
                        label={result.is_ai_generated ? 'AI Generated' : 'Real'}
                        color={result.is_ai_generated ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Confidence Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress
                            variant="determinate"
                            value={result.confidence_score * 100}
                            color={result.is_ai_generated ? "error" : "success"}
                            size={40}
                            thickness={4}
                          />
                          <Typography variant="h6">
                            {Math.round(result.confidence_score * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        Analyzed on {formatDate(result.detection_date)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(0, 229, 255, 0.2)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Results;
