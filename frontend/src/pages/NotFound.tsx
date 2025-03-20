import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 6,
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1e2746, #171e38)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="fade-in"
        >
          <SadIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
          
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '4rem', md: '6rem' },
              background: 'linear-gradient(90deg, #3f51b5, #00e5ff)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              mb: 2,
            }}
          >
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                color="primary"
                size="large"
                className="hover-glow"
              >
                Go to Dashboard
              </Button>
            </Grid>
            <Grid item>
              <Button
                component={Link}
                to="/upload"
                variant="outlined"
                color="secondary"
                size="large"
              >
                Upload New File
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
