import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Briefcase, Home } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../api/auth';
import { notificationsAPI } from '../../api/notifications';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();

            const token = localStorage.getItem('access_token');

            const ws = new WebSocket(
                `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
            );

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'notification') {
                    setUnreadCount((prev) => prev + 1);
                    setNotifications((prev) => [data, ...prev]);
                    toast(data.title, { icon: '🔔' });
                }
            };

            return () => ws.close();
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsAPI.getNotifications();
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unread_count);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            await authAPI.logout(refresh);
        } catch (err) {
            console.error(err);
        } finally {
            logout();
            navigate('/login');
            toast.success('Logged out successfully');
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            );

            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const getDashboardLink = () => {
        if (!user) return '/';

        if (user.role === 'job_seeker') {
            return '/jobseeker/dashboard';
        }

        if (user.role === 'recruiter') {
            return '/recruiter/dashboard';
        }

        return '/';
    };

    return (
        <nav
            style={{
                background: '#1a1a2e',
                padding: '0 2rem',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
        >
            <Link
                to="/"
                style={{
                    color: '#4ade80',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <Briefcase size={24} />
                JobHunt
            </Link>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Link
                            to={getDashboardLink()}
                            style={{
                                color: '#e2e8f0',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.9rem',
                            }}
                        >
                            <Home size={16} />
                            Dashboard
                        </Link>

                        <Link
                            to="/jobs"
                            style={{
                                color: '#e2e8f0',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                            }}
                        >
                            Jobs
                        </Link>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#e2e8f0',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: '4px',
                                }}
                            >
                                <Bell size={20} />

                                {unreadCount > 0 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            background: '#ef4444',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '16px',
                                            height: '16px',
                                            fontSize: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '40px',
                                        width: '320px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        boxShadow:
                                            '0 10px 30px rgba(0,0,0,0.3)',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom:
                                                '1px solid #334155',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: '#e2e8f0',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Notifications
                                        </span>

                                        {unreadCount > 0 && (
                                            <button
                                                onClick={async () => {
                                                    await notificationsAPI.markAllRead();
                                                    setUnreadCount(0);
                                                    fetchNotifications();
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#4ade80',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {notifications.length === 0 ? (
                                        <div
                                            style={{
                                                padding: '20px',
                                                textAlign: 'center',
                                                color: '#64748b',
                                            }}
                                        >
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications
                                            .slice(0, 10)
                                            .map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() =>
                                                        handleMarkRead(
                                                            notif.id
                                                        )
                                                    }
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderBottom:
                                                            '1px solid #1e293b',
                                                        cursor: 'pointer',
                                                        background:
                                                            notif.is_read
                                                                ? 'transparent'
                                                                : '#0f172a',
                                                        transition:
                                                            'background 0.2s',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: '#e2e8f0',
                                                            fontSize: '0.85rem',
                                                            fontWeight:
                                                                notif.is_read
                                                                    ? '400'
                                                                    : '600',
                                                        }}
                                                    >
                                                        {notif.title}
                                                    </div>

                                                    <div
                                                        style={{
                                                            color: '#64748b',
                                                            fontSize: '0.75rem',
                                                            marginTop: '4px',
                                                        }}
                                                    >
                                                        {notif.message}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <span
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                }}
                            >
                                {user?.username}
                            </span>

                            <button
                                onClick={handleLogout}
                                style={{
                                    background: '#ef4444',
                                    border: 'none',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            style={{
                                color: '#e2e8f0',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                            }}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            style={{
                                background: '#4ade80',
                                color: '#0f172a',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                            }}
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}