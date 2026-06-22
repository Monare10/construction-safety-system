import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Button, Radio, RadioGroup, FormControlLabel,
  FormControl, Alert, LinearProgress, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz, generateCertificate } from '../../api/api';
import Navbar from '../../components/Navbar';

const Quiz = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // NEW: timer state
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    getQuiz(programId)
      .then((res) => setQuiz(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || 'Could not load quiz')
      )
      .finally(() => setLoading(false));
  }, [programId]);

  // Start countdown timer when quiz loads
  useEffect(() => {
    if (quiz && !result) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
  }, [quiz, result]);

  // Countdown every second
  useEffect(() => {
    if (timeLeft === null || result) return;

    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, result, handleSubmit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await submitQuiz(programId, { answers });
      setResult(res.data);

      if (res.data.passed) {
        await generateCertificate(programId);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button
          onClick={() => navigate('/worker/dashboard')}
          sx={{ mb: 2, color: '#E8660A' }}
        >
          ← Back to Dashboard
        </Button>

        <Typography
          variant="h4"
          fontWeight="bold"
          color="#1A1A2E"
          sx={{ mb: 1 }}
        >
          {quiz?.title}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Questions: {quiz?.questions.length} | Pass mark: 70%
          </Typography>

          {timeLeft !== null && (
            <Box
              sx={{
                backgroundColor: timeLeft < 60 ? '#c62828' : '#E8660A',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: 16
              }}
            >
              ⏱ {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')}
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result ? (
          <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 3 }}>
            <Typography
              variant="h3"
              sx={{
                color: result.passed ? 'green' : 'red',
                fontWeight: 'bold'
              }}
            >
              {result.score}%
            </Typography>

            <Chip
              label={result.passed ? '✓ PASSED' : '✗ FAILED'}
              color={result.passed ? 'success' : 'error'}
              sx={{ fontSize: 16, p: 2, my: 2 }}
            />

            <Typography variant="body1" sx={{ mb: 2 }}>
              {result.message}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Correct answers: {result.correct_answers}/{result.total_questions} |
              Attempts remaining: {result.attempts_remaining}
            </Typography>

            {result.passed ? (
              <Button
                variant="contained"
                onClick={() =>
                  navigate(`/worker/certificate/${programId}`)
                }
                sx={{
                  backgroundColor: '#E8660A',
                  '&:hover': { backgroundColor: '#c55a09' }
                }}
              >
                View My Certificate 🏆
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => navigate('/worker/dashboard')}
                sx={{ borderColor: '#E8660A', color: '#E8660A' }}
              >
                Back to Dashboard
              </Button>
            )}
          </Card>
        ) : (
          <>
            {quiz?.questions.map((question, index) => (
              <Card
                key={question.id}
                elevation={2}
                sx={{ mb: 3, borderRadius: 3 }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    {index + 1}. {question.question_text}
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [question.id]: e.target.value
                        })
                      }
                    >
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={
                            <Radio
                              sx={{
                                '&.Mui-checked': { color: '#E8660A' }
                              }}
                            />
                          }
                          label={`${opt.toUpperCase()}. ${
                            question[`option_${opt}`]
                          }`}
                          sx={{
                            mb: 1,
                            p: 1,
                            borderRadius: 2,
                            backgroundColor:
                              answers[question.id] === opt
                                ? '#fff3e0'
                                : 'transparent'
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}

            <Box
              sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  px: 6,
                  py: 1.5,
                  backgroundColor: '#E8660A',
                  '&:hover': { backgroundColor: '#c55a09' }
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default Quiz;