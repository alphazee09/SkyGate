import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{username?: string, password?: string}>({});
  const { login, loading, error } = useAuth();

  const validateForm = () => {
    const errors: {username?: string, password?: string} = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(username, password);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography 
        variant="h4" 
        component="h2" 
        align="center" 
        gutterBottom
        sx={{ 
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          mb: 3
        }}
      >
        Login
      </Typography>

      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={!!formErrors.username}
        helperText={formErrors.username}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: 'secondary.main',
              boxShadow: '0 0 5px rgba(0, 229, 255, 0.5)',
            },
          },
        }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!formErrors.password}
        helperText={formErrors.password}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: 'secondary.main',
              boxShadow: '0 0 5px rgba(0, 229, 255, 0.5)',
            },
          },
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        sx={{ 
          mt: 3, 
          mb: 2,
          py: 1.5,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'all 0.5s',
          },
          '&:hover::after': {
            left: '100%',
          },
        }}
        className="hover-glow"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
      </Button>
      
      <Grid container justifyContent="center">
        <Grid item>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body2" 
              color="secondary"
              sx={{ 
                textAlign: 'center',
                transition: 'all 0.3s',
                '&:hover': {
                  textShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
                },
              }}
            >
              Don't have an account? Sign Up
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
