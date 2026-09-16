import { useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { authAPI } from './api/auth';

import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import JobsList from './pages/shared/JobsList';
import JobDetail from './pages/shared/JobDetail';
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import Applications from './pages/jobseeker/Applications';
import JobSeekerProfile from './pages/jobseeker/Profile';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import MyJobs from './pages/recruiter/MyJobs';
import Applicants from './pages/recruiter/Applicants';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30000,
        }
    }
});

function AppContent() {
    const { setUser, setLoading, logout } = useAuthStore();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            authAPI.getMe()
                .then(res => setUser(res.data))
                .catch(() => {
                    logout();
                });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a' }}>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<Navigate to="/jobs" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/jobs" element={<JobsList />} />
                <Route path="/jobs/:id" element={<JobDetail />} />

                {/* Job Seeker */}
                <Route path="/jobseeker/dashboard" element={
                    <ProtectedRoute role="job_seeker">
                        <JobSeekerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/jobseeker/applications" element={
                    <ProtectedRoute role="job_seeker">
                        <Applications />
                    </ProtectedRoute>
                } />
                <Route path="/jobseeker/profile" element={
                    <ProtectedRoute role="job_seeker">
                        <JobSeekerProfile />
                    </ProtectedRoute>
                } />

                {/* Recruiter */}
                <Route path="/recruiter/dashboard" element={
                    <ProtectedRoute role="recruiter">
                        <RecruiterDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/recruiter/post-job" element={
                    <ProtectedRoute role="recruiter">
                        <PostJob />
                    </ProtectedRoute>
                } />
                <Route path="/recruiter/my-jobs" element={
                    <ProtectedRoute role="recruiter">
                        <MyJobs />
                    </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs/:jobId/applicants" element={
                    <ProtectedRoute role="recruiter">
                        <Applicants />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/jobs" replace />} />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppContent />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1e293b',
                            color: '#e2e8f0',
                            border: '1px solid #334155'
                        }
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    );
}