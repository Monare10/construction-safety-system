import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  MenuItem,
  Link
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { registerUser, getJobRoles } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    job_role_id: ''
  });

  const [jobRoles, setJobRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getJobRoles()
      .then((res) => {
        setJobRoles(res.data);
      })
      .catch((err) => {
        console.error('Failed to load job roles:', err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await registerUser({
        ...form,
        job_role_id: parseInt(form.job_role_id)
      });

      navigate('/login');

    } catch (err) {
      console.error('Registration error:', err);

      const detail = err.response?.data?.detail;

      // FastAPI validation errors
      if (Array.isArray(detail)) {
        const messages = detail
          .map((e) => e.msg)
          .join(', ');

        setError(messages);

      } 
      // Normal string errors
      else if (typeof detail === 'string') {
        setError(detail);

      } 
      // Fallback
      else {
        setError('Registration failed');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1A1A2E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SecurityIcon
              sx={{
                fontSize: 60,
                color: '#E8660A'
              }}
            />

            <Typography
              variant="h5"
              fontWeight="bold"
              color="#1A1A2E"
            >
              Create Account
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Register as a new worker
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              required
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              required
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              select
              label="Job Role"
              margin="normal"
              required
              value={form.job_role_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  job_role_id: e.target.value
                })
              }
            >
              {jobRoles.map((role) => (
                <MenuItem
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </MenuItem>
              ))}
            </TextField>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                backgroundColor: '#E8660A',
                '&:hover': {
                  backgroundColor: '#c55a09'
                }
              }}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Box
              sx={{
                textAlign: 'center',
                mt: 2
              }}
            >
              <Link href="/login" underline="hover">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;