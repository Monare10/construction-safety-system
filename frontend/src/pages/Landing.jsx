import { Box, Button, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: '#E8660A' }} />,
    title: 'Role-Based Training',
    desc: 'Workers receive training specific to their job role — Electrician, Driver, Plumber and more.'
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#E8660A' }} />,
    title: 'Safety Assessments',
    desc: 'Timed quizzes ensure workers understand safety protocols before setting foot on site.'
  },
  {
    icon: <CardMembershipIcon sx={{ fontSize: 40, color: '#E8660A' }} />,
    title: 'Digital Certificates',
    desc: 'Passing workers receive a unique PDF certificate valid for one year.'
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: 40, color: '#E8660A' }} />,
    title: 'Compliance Reports',
    desc: 'Admins monitor all workers, track expiring certificates and control site eligibility.'
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0D0D1A' }}>

      {/* Navbar */}
      <Box sx={{
        backgroundColor: '#1A1A2E', px: 4, py: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '2px solid #E8660A'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: '#E8660A', fontSize: 30 }} />
          <Typography variant="h6" fontWeight="bold" color="white">
            SafetyTrain Pro
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{ color: '#E8660A', borderColor: '#E8660A' }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{ backgroundColor: '#E8660A', '&:hover': { backgroundColor: '#c55a09' } }}
          >
            Register
          </Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        py: 12, px: 4, textAlign: 'center',
        borderBottom: '3px solid #E8660A'
      }}>
        <SecurityIcon sx={{ fontSize: 80, color: '#E8660A', mb: 2 }} />
        <Typography variant="h2" fontWeight="bold" color="white" sx={{ mb: 2 }}>
          Construction Site
        </Typography>
        <Typography variant="h2" fontWeight="bold" sx={{ color: '#E8660A', mb: 3 }}>
          Safety Training System
        </Typography>
        <Typography variant="h6" color="#AAAAAA" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
          Ensure every worker is trained, certified, and compliant before
          setting foot on your construction site.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained" size="large"
            onClick={() => navigate('/register')}
            sx={{
              px: 5, py: 1.8, fontSize: 16, fontWeight: 'bold',
              backgroundColor: '#E8660A',
              '&:hover': { backgroundColor: '#c55a09', transform: 'scale(1.05)' }
            }}
          >
            Get Started — Register
          </Button>
          <Button
            variant="outlined" size="large"
            onClick={() => navigate('/login')}
            sx={{
              px: 5, py: 1.8, fontSize: 16,
              color: 'white', borderColor: 'white',
              '&:hover': { borderColor: '#E8660A', color: '#E8660A' }
            }}
          >
            Sign In
          </Button>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Box sx={{
        backgroundColor: '#E8660A', py: 3,
        display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap'
      }}>
        {[
          { value: '5+', label: 'Job Roles' },
          { value: '70%', label: 'Pass Mark Required' },
          { value: '1 Year', label: 'Certificate Validity' },
          { value: '3', label: 'Max Quiz Attempts' },
        ].map((stat) => (
          <Box key={stat.label} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="white">{stat.value}</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" fontWeight="bold" color="white"
          textAlign="center" sx={{ mb: 6 }}>
          Everything You Need for Site Compliance
        </Typography>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card sx={{
                backgroundColor: '#1A1A2E', borderRadius: 3, height: '100%',
                border: '1px solid #333',
                '&:hover': { border: '1px solid #E8660A', transform: 'translateY(-4px)' },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  {f.icon}
                  <Typography variant="h6" fontWeight="bold" color="white" sx={{ my: 2 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="#AAAAAA">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ backgroundColor: '#1A1A2E', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" color="white"
            textAlign="center" sx={{ mb: 6 }}>
            How It Works
          </Typography>
          <Grid container spacing={3}>
            {[
              { step: '01', title: 'Register', desc: 'Create your account and select your job role' },
              { step: '02', title: 'Watch Training', desc: 'Complete all assigned safety training videos' },
              { step: '03', title: 'Pass the Quiz', desc: 'Score 70% or above on the safety assessment' },
              { step: '04', title: 'Get Certified', desc: 'Download your PDF certificate and start work' },
            ].map((item) => (
              <Grid item xs={12} sm={6} key={item.step}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#E8660A', minWidth: 60 }}>
                    {item.step}
                  </Typography>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="white">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="#AAAAAA">
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{
        background: 'linear-gradient(135deg, #E8660A, #c55a09)',
        py: 8, textAlign: 'center'
      }}>
        <Typography variant="h4" fontWeight="bold" color="white" sx={{ mb: 2 }}>
          Ready to Get Certified?
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.85)" sx={{ mb: 4 }}>
          Join workers who have completed their safety training online.
        </Typography>
        <Button
          variant="contained" size="large"
          onClick={() => navigate('/register')}
          sx={{
            px: 6, py: 1.8, fontSize: 16, fontWeight: 'bold',
            backgroundColor: '#1A1A2E',
            '&:hover': { backgroundColor: '#0D0D1A' }
          }}
        >
          Register Now — It's Free
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{
        backgroundColor: '#0D0D1A', py: 3, textAlign: 'center',
        borderTop: '1px solid #333'
      }}>
        <Typography variant="body2" color="#666">
          © {new Date().getFullYear()} SafetyTrain Pro — Construction Site Safety Training System
        </Typography>
      </Box>
    </Box>
  );
};

export default Landing;