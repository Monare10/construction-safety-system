import { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Box, Button, LinearProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getReports } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card
    elevation={3}
    sx={{ borderRadius: 3, cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { elevation: 6, transform: 'translateY(-2px)' } : {} }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          backgroundColor: color + '20', borderRadius: 2,
          p: 1.5, display: 'flex'
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports()
      .then((res) => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1A1A2E" sx={{ mb: 4 }}>
          Admin Dashboard 🛡️
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Workers"
              value={reports?.total_workers || 0}
              icon={<PeopleIcon sx={{ color: '#1565C0' }} />}
              color="#1565C0"
              onClick={() => navigate('/admin/workers')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Eligible Workers"
              value={reports?.eligible_workers || 0}
              icon={<PeopleIcon sx={{ color: '#2E7D32' }} />}
              color="#2E7D32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Certificates"
              value={reports?.active_certificates || 0}
              icon={<CardMembershipIcon sx={{ color: '#E8660A' }} />}
              color="#E8660A"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Expired Certificates"
              value={reports?.expired_certificates || 0}
              icon={<CardMembershipIcon sx={{ color: '#c62828' }} />}
              color="#c62828"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 50, color: '#E8660A', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Training Programs
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={() => navigate('/admin/training')}
                  sx={{
                    backgroundColor: '#E8660A',
                    '&:hover': { backgroundColor: '#c55a09' }
                  }}
                >
                  Manage Training
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 50, color: '#1565C0', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Worker Management
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={() => navigate('/admin/workers')}
                  sx={{ backgroundColor: '#1565C0' }}
                >
                  View Workers
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 50, color: '#2E7D32', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Compliance Reports
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={() => navigate('/admin/reports')}
                  sx={{ backgroundColor: '#2E7D32' }}
                >
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AdminDashboard;