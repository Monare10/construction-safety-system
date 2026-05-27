import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Grid, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button
} from '@mui/material';
import { getReports, getAllCertificates } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReports(), getAllCertificates()])
      .then(([reportsRes, certsRes]) => {
        setReports(reportsRes.data);
        setCertificates(certsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="#1A1A2E">
            Compliance Reports 📊
          </Typography>
          <Button onClick={() => navigate('/admin/dashboard')} sx={{ color: '#E8660A' }}>
            ← Back
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Workers', value: reports?.total_workers, color: '#1565C0' },
            { label: 'Eligible Workers', value: reports?.eligible_workers, color: '#2E7D32' },
            { label: 'Active Certificates', value: reports?.active_certificates, color: '#E8660A' },
            { label: 'Expired Certificates', value: reports?.expired_certificates, color: '#c62828' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h3" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          All Certificates Issued
        </Typography>
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#1A1A2E' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Worker</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Training</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cert Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Issued</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expires</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert, index) => (
                <TableRow key={index} hover>
                  <TableCell>{cert.worker_name}</TableCell>
                  <TableCell>{cert.training_program}</TableCell>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">
                      {cert.certificate_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(cert.expires_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cert.status.toUpperCase()}
                      color={cert.status === 'certified' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {certificates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No certificates issued yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Reports;