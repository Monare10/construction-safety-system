import { useState } from 'react';
import {
  Container, Box, TextField, Button,
  Typography, Alert, Paper, Link
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.access_token, res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#1A1A2E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SecurityIcon sx={{ fontSize: 60, color: '#E8660A' }} />
            <Typography variant="h5" fontWeight="bold" color="#1A1A2E">
              Safety Training System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email"
              margin="normal" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth label="Password" type="password"
              margin="normal" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button
              fullWidth type="submit" variant="contained"
              disabled={loading}
              sx={{
                mt: 3, py: 1.5,
                backgroundColor: '#E8660A',
                '&:hover': { backgroundColor: '#c55a09' }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="/register" underline="hover">
                Don't have an account? Register
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link href="/" underline="hover" color="text.secondary">
                ← Back to Home
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;