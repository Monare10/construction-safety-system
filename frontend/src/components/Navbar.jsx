import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';import SecurityIcon from '@mui/icons-material/Security';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1A1A2E' }}>
      <Toolbar>
        <SecurityIcon sx={{ mr: 1, color: '#E8660A' }} />
        <Typography variant="h6" sx={{ flexGrow: 1, color: '#E8660A', fontWeight: 'bold' }}>
          Safety Training System
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {user.full_name} ({user.role})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{ color: '#E8660A', borderColor: '#E8660A' }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;