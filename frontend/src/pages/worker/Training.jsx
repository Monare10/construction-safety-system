import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Button, Chip, LinearProgress, Alert, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgram, getTrainingStatus, updateProgress } from '../../api/api';
import Navbar from '../../components/Navbar';

const Training = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [status, setStatus] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgram(programId), getTrainingStatus(programId)])
      .then(([progRes, statusRes]) => {
        setProgram(progRes.data);
        setStatus(statusRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [programId]);

  const handleWatchVideo = (video) => {
    setActiveVideo(video);
  };

  const handleMarkComplete = async (videoId) => {
    const video = program.videos.find((v) => v.id === videoId);
    try {
      await updateProgress(videoId, {
        watched_seconds: video.duration_seconds
      });
      const statusRes = await getTrainingStatus(programId);
      setStatus(statusRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getVideoStatus = (videoId) => {
    if (!status) return false;
    const v = status.videos.find((v) => v.video_id === videoId);
    return v ? v.completed : false;
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/worker/dashboard')} sx={{ mb: 2, color: '#E8660A' }}>
          ← Back to Dashboard
        </Button>

        <Typography variant="h4" fontWeight="bold" color="#1A1A2E" sx={{ mb: 1 }}>
          {program?.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {program?.description}
        </Typography>

        {status?.ready_for_quiz && (
          <Alert
            severity="success" sx={{ mb: 3 }}
            action={
              <Button
                color="inherit" size="small"
                onClick={() => navigate(`/worker/quiz/${programId}`)}
              >
                Take Quiz Now
              </Button>
            }
          >
            All videos completed! You are ready to take the quiz.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Video List */}
          <Box sx={{ width: { xs: '100%', md: '35%' } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Training Videos
            </Typography>
            {program?.videos.map((video, index) => {
              const completed = getVideoStatus(video.id);
              return (
                <Card
                  key={video.id}
                  elevation={activeVideo?.id === video.id ? 4 : 1}
                  sx={{
                    mb: 2, cursor: 'pointer', borderRadius: 2,
                    border: activeVideo?.id === video.id
                      ? '2px solid #E8660A' : '1px solid #eee'
                  }}
                  onClick={() => handleWatchVideo(video)}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {completed
                        ? <CheckCircleIcon sx={{ color: 'green', fontSize: 20 }} />
                        : <PlayCircleIcon sx={{ color: '#E8660A', fontSize: 20 }} />
                      }
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {index + 1}. {video.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(video.duration_seconds / 60)} min
                        </Typography>
                      </Box>
                      {completed && (
                        <Chip label="Done" color="success" size="small" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Video Player */}
          <Box sx={{ flexGrow: 1 }}>
            {activeVideo ? (
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    {activeVideo.title}
                  </Typography>
                  <Box sx={{
                    position: 'relative', paddingBottom: '56.25%',
                    height: 0, overflow: 'hidden', borderRadius: 2, mb: 2
                  }}>
                    <iframe
                      src={getEmbedUrl(activeVideo.video_url)}
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%', border: 'none'
                      }}
                      allowFullScreen
                      title={activeVideo.title}
                    />
                  </Box>
                  {!getVideoStatus(activeVideo.id) && (
                    <Button
                      fullWidth variant="contained"
                      onClick={() => handleMarkComplete(activeVideo.id)}
                      sx={{
                        backgroundColor: '#E8660A',
                        '&:hover': { backgroundColor: '#c55a09' }
                      }}
                    >
                      Mark as Completed ✓
                    </Button>
                  )}
                  {getVideoStatus(activeVideo.id) && (
                    <Alert severity="success">
                      Video completed! ✓
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Box sx={{
                height: 300, display: 'flex', alignItems: 'center',
                justifyContent: 'center', backgroundColor: '#f5f5f5',
                borderRadius: 3
              }}>
                <Typography color="text.secondary">
                  Select a video from the list to start watching
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Training;