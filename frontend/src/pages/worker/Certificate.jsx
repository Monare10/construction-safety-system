import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Button, Chip, Alert, LinearProgress
} from '@mui/material';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DownloadIcon from '@mui/icons-material/Download';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyCertificates, downloadCertificate } from '../../api/api';
import Navbar from '../../components/Navbar';

const Certificate = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getMyCertificates()
      .then((res) => {
        const cert = res.data.find(
          (c) => c.program_id === parseInt(programId)
        );
        setCertificate(cert);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [programId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadCertificate(programId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${programId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Button
          onClick={() => navigate('/worker/dashboard')}
          sx={{ mb: 2, color: '#E8660A' }}
        >
          ← Back to Dashboard
        </Button>

        {certificate ? (
          <Card elevation={4} sx={{
            borderRadius: 3, textAlign: 'center',
            border: '2px solid #E8660A'
          }}>
            <CardContent sx={{ p: 4 }}>
              <CardMembershipIcon sx={{ fontSize: 80, color: '#E8660A', mb: 2 }} />

              <Typography variant="h5" fontWeight="bold" color="#1A1A2E" sx={{ mb: 1 }}>
                {certificate.program_title}
              </Typography>

              <Chip
                label={certificate.status.toUpperCase()}
                color={certificate.status === 'certified' ? 'success' : 'error'}
                sx={{ mb: 3, fontSize: 14, p: 1 }}
              />

              <Box sx={{
                backgroundColor: '#f5f5f5', borderRadius: 2,
                p: 2, mb: 3, textAlign: 'left'
              }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Certificate No:</strong> {certificate.certificate_number}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Issued:</strong>{' '}
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Expires:</strong>{' '}
                  {new Date(certificate.expires_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Button
                fullWidth variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={downloading}
                sx={{
                  py: 1.5, backgroundColor: '#E8660A',
                  '&:hover': { backgroundColor: '#c55a09' }
                }}
              >
                {downloading ? 'Downloading...' : 'Download PDF Certificate'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="warning">
            No certificate found for this program. Complete the training and
            pass the quiz first.
          </Alert>
        )}
      </Container>
    </>
  );
};

export default Certificate;