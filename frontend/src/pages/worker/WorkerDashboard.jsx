import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { useAuth } from '../../context/AuthContext';
import { getMyProgress, getMyCertificates } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progress, setProgress] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProgress(), getMyCertificates()])
      .then(([progressRes, certRes]) => {
        setProgress(progressRes.data);
        setCertificates(certRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCertStatus = (programId) => {
    const cert = certificates.find((c) => c.program_id === programId);
    return cert ? cert.status : 'not_certified';
  };

  const statusColor = {
    certified: 'success',
    not_certified: 'warning',
    expired: 'error'
  };

  return (
    <>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="#1A1A2E">
            Welcome, {user?.full_name}! 👷
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {user?.job_role?.name} | Eligibility:{' '}
            <Chip
              label={user?.is_eligible ? 'Eligible' : 'Not Eligible'}
              color={user?.is_eligible ? 'success' : 'error'}
              size="small"
            />
          </Typography>
        </Box>

        {loading ? (
          <LinearProgress sx={{ color: '#E8660A' }} />
        ) : progress.length === 0 ? (
          <Alert severity="info">
            No training programs assigned to your role yet.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {progress.map((program) => {
              const certStatus = getCertStatus(program.program_id);

              const completionPct =
                program.total_videos > 0
                  ? Math.round(
                      (program.completed_videos / program.total_videos) * 100
                    )
                  : 0;

              return (
                <Grid item xs={12} md={6} key={program.program_id}>
                  <Card
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 2
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="#1A1A2E"
                        >
                          {program.program_title}
                        </Typography>

                        <Chip
                          label={certStatus.replace('_', ' ').toUpperCase()}
                          color={statusColor[certStatus]}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Videos: {program.completed_videos}/
                          {program.total_videos} completed
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={completionPct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#E8660A'
                            }
                          }}
                        />

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {completionPct}% complete
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SchoolIcon />}
                          onClick={() =>
                            navigate(
                              `/worker/training/${program.program_id}`
                            )
                          }
                          sx={{
                            backgroundColor: '#E8660A',
                            '&:hover': {
                              backgroundColor: '#c55a09'
                            }
                          }}
                        >
                          Watch Training
                        </Button>

                        {program.ready_for_quiz &&
                          certStatus !== 'certified' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PendingIcon />}
                              onClick={() =>
                                navigate(
                                  `/worker/quiz/${program.program_id}`
                                )
                              }
                              sx={{
                                borderColor: '#E8660A',
                                color: '#E8660A'
                              }}
                            >
                              Take Quiz
                            </Button>
                          )}

                        {certStatus === 'certified' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CardMembershipIcon />}
                            onClick={() =>
                              navigate(
                                `/worker/certificate/${program.program_id}`
                              )
                            }
                            sx={{
                              borderColor: 'green',
                              color: 'green'
                            }}
                          >
                            View Certificate
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default WorkerDashboard;