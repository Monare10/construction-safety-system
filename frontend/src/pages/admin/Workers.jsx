import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Button, Chip, LinearProgress, Alert, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getWorkers, getWorkerCompliance, updateEligibility } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Workers = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    getWorkers()
      .then((res) => setWorkers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewCompliance = async (worker) => {
    setSelected(worker);
    setDialogOpen(true);
    try {
      const res = await getWorkerCompliance(worker.id);
      setCompliance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEligibility = async (workerId, eligible) => {
    try {
      await updateEligibility(workerId, { is_eligible: eligible });
      const res = await getWorkers();
      setWorkers(res.data);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="#1A1A2E">
            Workers 👷
          </Typography>
          <Button
            onClick={() => navigate('/admin/dashboard')}
            sx={{ color: '#E8660A' }}
          >
            ← Back
          </Button>
        </Box>

        {workers.length === 0 ? (
          <Alert severity="info">No workers registered yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {workers.map((worker) => (
              <Grid item xs={12} md={6} key={worker.id}>
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {worker.full_name}
                      </Typography>
                      <Chip
                        label={worker.is_eligible ? 'Eligible' : 'Not Eligible'}
                        color={worker.is_eligible ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {worker.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Role: {worker.job_role?.name || 'Not assigned'}
                    </Typography>
                    <Button
                      size="small" variant="outlined"
                      onClick={() => handleViewCompliance(worker)}
                      sx={{ borderColor: '#E8660A', color: '#E8660A' }}
                    >
                      View Compliance
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Compliance Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm" fullWidth
        >
          <DialogTitle>
            {selected?.full_name} — Compliance Status
          </DialogTitle>
          <DialogContent>
            {compliance ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Programs completed: {compliance.completed_programs}/
                  {compliance.total_programs}
                </Typography>
                {compliance.certificates.map((cert) => (
                  <Box key={cert.program_id} sx={{
                    p: 2, mb: 1, backgroundColor: '#f5f5f5', borderRadius: 2
                  }}>
                    <Typography variant="body2" fontWeight="bold">
                      {cert.program_title}
                    </Typography>
                    <Chip
                      label={cert.status.replace('_', ' ').toUpperCase()}
                      color={
                        cert.status === 'certified' ? 'success' :
                        cert.status === 'expired' ? 'error' : 'warning'
                      }
                      size="small" sx={{ mt: 0.5 }}
                    />
                    {cert.certificate_number && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Cert #: {cert.certificate_number}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <LinearProgress />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleEligibility(selected?.id, false)}
              color="error"
            >
              Deny Eligibility
            </Button>
            <Button
              onClick={() => handleEligibility(selected?.id, true)}
              variant="contained"
              sx={{ backgroundColor: '#E8660A' }}
            >
              Approve Eligibility
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Workers;