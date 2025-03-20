import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a2035 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="grid-bg"
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.5,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(63,81,181,0.2) 0%, rgba(63,81,181,0) 70%)',
            animation: 'float 8s infinite ease-in-out',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, rgba(0,229,255,0) 70%)',
            animation: 'float 6s infinite ease-in-out reverse',
          }}
        />
      </Box>

      {/* Logo and title */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          zIndex: 1,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            letterSpacing: 2,
            mb: 1,
            color: '#fff',
          }}
          className="glow-text"
        >
          SkyGate
        </Typography>
        <Typography
          variant="h6"
          sx={{
            opacity: 0.8,
            fontWeight: 300,
          }}
        >
          Advanced AI Detection System
        </Typography>
      </Box>

      {/* Auth form container */}
      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(145deg, rgba(26,32,53,0.9), rgba(10,14,26,0.9))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 15px 25px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="fade-in"
        >
          {/* Glowing border effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
              animation: 'glow 2s infinite linear',
            }}
          />
          
          <Outlet />
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          textAlign: 'center',
          width: '100%',
          opacity: 0.7,
          zIndex: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} SkyGate AI Detection | All Rights Reserved
        </Typography>
      </Box>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes glow {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
        `}
      </style>
    </Box>
  );
};

export default AuthLayout;
