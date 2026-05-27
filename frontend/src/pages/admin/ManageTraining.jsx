import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Button, TextField, MenuItem, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, LinearProgress, Divider, IconButton
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

import {
  createQuiz,
  addQuestion,
  getPrograms,
  createProgram,
  addVideo,
  deleteProgram,
  getJobRoles
} from '../../api/api';

import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const ManageTraining = () => {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [programDialog, setProgramDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);

  const [quizDialog, setQuizDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [selectedQuizProgram, setSelectedQuizProgram] = useState(null);

  const [selectedProgram, setSelectedProgram] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    job_role_id: '',
    pass_mark: 70,
    max_attempts: 3
  });

  const [videoForm, setVideoForm] = useState({
    title: '',
    video_url: '',
    order_index: 1,
    duration_seconds: 0
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    time_limit_minutes: 30
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a'
  });

  useEffect(() => {
    Promise.all([getPrograms(), getJobRoles()])
      .then(([progRes, rolesRes]) => {
        setPrograms(progRes.data);
        setJobRoles(rolesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateProgram = async () => {
    setError('');

    try {
      await createProgram({
        ...programForm,
        job_role_id: parseInt(programForm.job_role_id)
      });

      const res = await getPrograms();

      setPrograms(res.data);

      setProgramDialog(false);

      setProgramForm({
        title: '',
        description: '',
        job_role_id: '',
        pass_mark: 70,
        max_attempts: 3
      });

      setSuccess('Training program created successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create program');
    }
  };

  const handleAddVideo = async () => {
    setError('');

    try {
      await addVideo(selectedProgram.id, {
        ...videoForm,
        order_index: parseInt(videoForm.order_index),
        duration_seconds: parseInt(videoForm.duration_seconds)
      });

      const res = await getPrograms();

      setPrograms(res.data);

      setVideoDialog(false);

      setVideoForm({
        title: '',
        video_url: '',
        order_index: 1,
        duration_seconds: 0
      });

      setSuccess('Video added successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add video');
    }
  };

  const handleCreateQuiz = async () => {
    setError('');

    try {
      await createQuiz(selectedQuizProgram.id, quizForm);

      const res = await getPrograms();

      setPrograms(res.data);

      setQuizDialog(false);

      setQuizForm({
        title: '',
        time_limit_minutes: 30
      });

      setSuccess('Quiz created successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create quiz');
    }
  };

  const handleAddQuestion = async () => {
    setError('');

    try {
      const quiz = selectedQuizProgram.quiz;

      if (!quiz) {
        setError('Create a quiz for this program first!');
        return;
      }

      await addQuestion(quiz.id, questionForm);

      setQuestionDialog(false);

      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'a'
      });

      setSuccess('Question added successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add question');
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm('Delete this training program?')) return;

    try {
      await deleteProgram(id);

      setPrograms(programs.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete');
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="#1A1A2E">
            Manage Training 📚
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => navigate('/admin/dashboard')}
              sx={{ color: '#E8660A' }}
            >
              ← Back
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setProgramDialog(true)}
              sx={{
                backgroundColor: '#E8660A',
                '&:hover': { backgroundColor: '#c55a09' }
              }}
            >
              New Program
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {programs.length === 0 ? (
          <Alert severity="info">
            No training programs yet. Create one to get started!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {programs.map((program) => (
              <Grid item xs={12} md={6} key={program.id}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#1A1A2E"
                      >
                        {program.title}
                      </Typography>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProgram(program.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Chip
                      label={program.job_role?.name}
                      size="small"
                      sx={{
                        mb: 1,
                        backgroundColor: '#fff3e0',
                        color: '#E8660A'
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Pass mark: {program.pass_mark}% | Max attempts:{' '}
                      {program.max_attempts} | Videos:{' '}
                      {program.videos.length}
                    </Typography>

                    {program.videos.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {program.videos.map((video) => (
                          <Box
                            key={video.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5
                            }}
                          >
                            <VideoLibraryIcon
                              sx={{
                                fontSize: 16,
                                color: '#E8660A'
                              }}
                            />

                            <Typography variant="caption">
                              {video.title} (
                              {Math.round(video.duration_seconds / 60)} min)
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedProgram(program);
                          setVideoDialog(true);
                        }}
                        sx={{
                          borderColor: '#E8660A',
                          color: '#E8660A'
                        }}
                      >
                        Add Video
                      </Button>

                      {!program.quiz ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedQuizProgram(program);
                            setQuizDialog(true);
                          }}
                          sx={{
                            borderColor: '#7B1FA2',
                            color: '#7B1FA2'
                          }}
                        >
                          Create Quiz
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedQuizProgram(program);
                            setQuestionDialog(true);
                          }}
                          sx={{
                            borderColor: '#7B1FA2',
                            color: '#7B1FA2'
                          }}
                        >
                          Add Question (
                          {program.quiz.questions?.length || 0})
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Program Dialog */}
        <Dialog
          open={programDialog}
          onClose={() => setProgramDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Training Program</DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              value={programForm.title}
              onChange={(e) =>
                setProgramForm({
                  ...programForm,
                  title: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={3}
              value={programForm.description}
              onChange={(e) =>
                setProgramForm({
                  ...programForm,
                  description: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              select
              label="Job Role"
              margin="normal"
              value={programForm.job_role_id}
              onChange={(e) =>
                setProgramForm({
                  ...programForm,
                  job_role_id: e.target.value
                })
              }
            >
              {jobRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Pass Mark (%)"
              margin="normal"
              type="number"
              value={programForm.pass_mark}
              onChange={(e) =>
                setProgramForm({
                  ...programForm,
                  pass_mark: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Max Attempts"
              margin="normal"
              type="number"
              value={programForm.max_attempts}
              onChange={(e) =>
                setProgramForm({
                  ...programForm,
                  max_attempts: e.target.value
                })
              }
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setProgramDialog(false)}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleCreateProgram}
              sx={{ backgroundColor: '#E8660A' }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Video Dialog */}
        <Dialog
          open={videoDialog}
          onClose={() => setVideoDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Add Video to {selectedProgram?.title}
          </DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              label="Video Title"
              margin="normal"
              value={videoForm.title}
              onChange={(e) =>
                setVideoForm({
                  ...videoForm,
                  title: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="YouTube URL"
              margin="normal"
              value={videoForm.video_url}
              onChange={(e) =>
                setVideoForm({
                  ...videoForm,
                  video_url: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Duration (seconds)"
              margin="normal"
              type="number"
              value={videoForm.duration_seconds}
              onChange={(e) =>
                setVideoForm({
                  ...videoForm,
                  duration_seconds: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Order Index"
              margin="normal"
              type="number"
              value={videoForm.order_index}
              onChange={(e) =>
                setVideoForm({
                  ...videoForm,
                  order_index: e.target.value
                })
              }
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setVideoDialog(false)}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleAddVideo}
              sx={{ backgroundColor: '#E8660A' }}
            >
              Add Video
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Quiz Dialog */}
        <Dialog
          open={quizDialog}
          onClose={() => setQuizDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Create Quiz for {selectedQuizProgram?.title}
          </DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              label="Quiz Title"
              margin="normal"
              value={quizForm.title}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  title: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Time Limit (minutes)"
              margin="normal"
              type="number"
              value={quizForm.time_limit_minutes}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  time_limit_minutes: e.target.value
                })
              }
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setQuizDialog(false)}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleCreateQuiz}
              sx={{ backgroundColor: '#7B1FA2' }}
            >
              Create Quiz
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Question Dialog */}
        <Dialog
          open={questionDialog}
          onClose={() => setQuestionDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Add Question to {selectedQuizProgram?.title}
          </DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              label="Question"
              margin="normal"
              multiline
              rows={2}
              value={questionForm.question_text}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  question_text: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Option A"
              margin="normal"
              value={questionForm.option_a}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_a: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Option B"
              margin="normal"
              value={questionForm.option_b}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_b: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Option C"
              margin="normal"
              value={questionForm.option_c}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_c: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              label="Option D"
              margin="normal"
              value={questionForm.option_d}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  option_d: e.target.value
                })
              }
            />

            <TextField
              fullWidth
              select
              label="Correct Answer"
              margin="normal"
              value={questionForm.correct_option}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  correct_option: e.target.value
                })
              }
            >
              {['a', 'b', 'c', 'd'].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  Option {opt.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setQuestionDialog(false)}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleAddQuestion}
              sx={{ backgroundColor: '#7B1FA2' }}
            >
              Add Question
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ManageTraining;