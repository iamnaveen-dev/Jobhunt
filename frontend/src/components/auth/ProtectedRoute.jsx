import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ade80'
            }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && user?.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}