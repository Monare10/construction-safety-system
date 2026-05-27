import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import Training from './pages/worker/Training';
import Quiz from './pages/worker/Quiz';
import Certificate from './pages/worker/Certificate';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTraining from './pages/admin/ManageTraining';
import Workers from './pages/admin/Workers';
import Reports from './pages/admin/Reports';

// Protected route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#E8660A' }} />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Worker routes */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute role="worker">
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker/training/:programId"
            element={
              <ProtectedRoute role="worker">
                <Training />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker/quiz/:programId"
            element={
              <ProtectedRoute role="worker">
                <Quiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker/certificate/:programId"
            element={
              <ProtectedRoute role="worker">
                <Certificate />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/training"
            element={
              <ProtectedRoute role="admin">
                <ManageTraining />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/workers"
            element={
              <ProtectedRoute role="admin">
                <Workers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <Reports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;