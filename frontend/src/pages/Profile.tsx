import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await userAPI.updateProfile(user.user_id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email
      });
      
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!validatePasswordForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await userAPI.changePassword(user.user_id, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      setSuccess('Password changed successfully');
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
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
        User Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card 
        elevation={8}
        sx={{ 
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
        }}
        className="fade-in"
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || <PersonIcon fontSize="large" />}
              </Avatar>
              <Typography variant="h6">
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date().getFullYear()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  variant={editMode ? "contained" : "outlined"}
                  color={editMode ? "secondary" : "primary"}
                  onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                  disabled={loading}
                >
                  {editMode ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'secondary.main',
                          boxShadow: '0 0 5px rgba(0, 229, 255, 0.5)',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'secondary.main',
                          boxShadow: '0 0 5px rgba(0, 229, 255, 0.5)',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'secondary.main',
                          boxShadow: '0 0 5px rgba(0, 229, 255, 0.5)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card 
        elevation={8}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif' }}>
            Account Security
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1">Password</Typography>
              <Typography variant="body2" color="text.secondary">
                Change your account password
              </Typography>
            </Box>
            <Button
              startIcon={<LockIcon />}
              variant="outlined"
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1">Logout</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign out from your account
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1e2746, #171e38)',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Orbitron", sans-serif' }}>
          Change Password
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordInputChange}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordInputChange}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordInputChange}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
