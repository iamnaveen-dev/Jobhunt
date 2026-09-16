import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authAPI.login(formData);
            const { user, tokens } = res.data;
            login(user, tokens);
            toast.success(`Welcome back ${user.username}!`);

            if (user.role === 'job_seeker') navigate('/jobseeker/dashboard');
            else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: '#1e293b',
                borderRadius: '16px',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <Briefcase size={32} color="#4ade80" />
                        <span style={{
                            fontSize: '1.8rem',
                            fontWeight: '700',
                            color: '#4ade80'
                        }}>
                            JobHunt
                        </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '6px'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            placeholder="naveen@gmail.com"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '6px'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: loading ? '#334155' : '#4ade80',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    marginTop: '1.5rem'
                }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#4ade80', textDecoration: 'none' }}>
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}