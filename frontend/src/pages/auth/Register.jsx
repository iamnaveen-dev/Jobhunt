import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        role: 'job_seeker',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);

        try {
            const res = await authAPI.register(formData);
            const { user, tokens } = res.data;
            login(user, tokens);
            toast.success('Account created successfully!');

            if (user.role === 'job_seeker') navigate('/jobseeker/dashboard');
            else navigate('/recruiter/dashboard');
        } catch (err) {
            const errors = err.response?.data;
            if (errors) {
                Object.values(errors).forEach(msg => toast.error(msg));
            } else {
                toast.error('Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#e2e8f0',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        color: '#94a3b8',
        fontSize: '0.85rem',
        marginBottom: '6px'
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
                maxWidth: '480px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                        Create your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={labelStyle}>I am a</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'job_seeker' })}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: formData.role === 'job_seeker' ? '#4ade80' : '#0f172a',
                                    color: formData.role === 'job_seeker' ? '#0f172a' : '#94a3b8',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Job Seeker
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: formData.role === 'recruiter' ? '#4ade80' : '#0f172a',
                                    color: formData.role === 'recruiter' ? '#0f172a' : '#94a3b8',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Recruiter
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={labelStyle}>Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                            style={inputStyle}
                            placeholder="naveen123"
                        />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={inputStyle}
                            placeholder="naveen@gmail.com"
                        />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={labelStyle}>Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            style={inputStyle}
                            placeholder="9876543210"
                        />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                            style={inputStyle}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Confirm Password</label>
                        <input
                            type="password"
                            value={formData.password2}
                            onChange={e => setFormData({ ...formData, password2: e.target.value })}
                            required
                            style={inputStyle}
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
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    marginTop: '1.5rem'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#4ade80', textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}