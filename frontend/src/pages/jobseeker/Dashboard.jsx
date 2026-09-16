import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../api/analytics';
import { applicationsAPI } from '../../api/applications';
import useAuthStore from '../../store/authStore';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { Briefcase, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function JobSeekerDashboard() {
    const { user } = useAuthStore();

    const { data: dashboardData } = useQuery({
        queryKey: ['jobseeker-dashboard'],
        queryFn: () => analyticsAPI.getJobSeekerDashboard().then(r => r.data),
    });

    const { data: applicationsData } = useQuery({
        queryKey: ['my-applications'],
        queryFn: () => applicationsAPI.getMyApplications().then(r => r.data),
    });

    const statusColors = {
        applied: '#3b82f6',
        screening: '#f59e0b',
        interview: '#8b5cf6',
        offer: '#4ade80',
        rejected: '#ef4444',
        withdrawn: '#64748b'
    };

    const chartData = dashboardData ? [
        { name: 'Applied', value: dashboardData.status_breakdown.applied, color: '#3b82f6' },
        { name: 'Screening', value: dashboardData.status_breakdown.screening, color: '#f59e0b' },
        { name: 'Interview', value: dashboardData.status_breakdown.interview, color: '#8b5cf6' },
        { name: 'Offer', value: dashboardData.status_breakdown.offer, color: '#4ade80' },
        { name: 'Rejected', value: dashboardData.status_breakdown.rejected, color: '#ef4444' },
    ] : [];

    const statCard = (icon, label, value, color) => (
        <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #334155',
            flex: 1
        }}>
            <div style={{ color, marginBottom: '8px' }}>{icon}</div>
            <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#e2e8f0',
                marginBottom: '4px'
            }}>
                {value}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</div>
        </div>
    );

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            <h1 style={{
                color: '#e2e8f0',
                fontSize: '1.8rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
            }}>
                Welcome back, {user?.username}! 👋
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Here is your job search progress
            </p>

            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                {statCard(
                    <Briefcase size={24} />,
                    'Total Applications',
                    dashboardData?.overview.total_applications || 0,
                    '#3b82f6'
                )}
                {statCard(
                    <TrendingUp size={24} />,
                    'Avg Match Score',
                    `${dashboardData?.overview.average_match_score || 0}%`,
                    '#4ade80'
                )}
                {statCard(
                    <CheckCircle size={24} />,
                    'Success Rate',
                    `${dashboardData?.overview.success_rate_percent || 0}%`,
                    '#f59e0b'
                )}
                {statCard(
                    <XCircle size={24} />,
                    'Unread Notifications',
                    dashboardData?.overview.unread_notifications || 0,
                    '#8b5cf6'
                )}
            </div>

            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155',
                marginBottom: '2rem'
            }}>
                <h2 style={{
                    color: '#e2e8f0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                }}>
                    Application Pipeline
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <Link to="/jobs" style={{
                    flex: 1,
                    background: '#4ade80',
                    color: '#0f172a',
                    padding: '12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                }}>
                    Browse Jobs
                </Link>
                <Link to="/jobseeker/applications" style={{
                    flex: 1,
                    background: '#1e293b',
                    color: '#e2e8f0',
                    padding: '12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    border: '1px solid #334155'
                }}>
                    My Applications
                </Link>
                <Link to="/jobseeker/profile" style={{
                    flex: 1,
                    background: '#1e293b',
                    color: '#e2e8f0',
                    padding: '12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    border: '1px solid #334155'
                }}>
                    My Profile
                </Link>
            </div>

            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155'
            }}>
                <h2 style={{
                    color: '#e2e8f0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                }}>
                    Recent Applications
                </h2>

                {applicationsData?.applications?.slice(0, 5).map(app => (
                    <div key={app.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #334155'
                    }}>
                        <div>
                            <div style={{
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {app.job_title}
                            </div>
                            <div style={{
                                color: '#64748b',
                                fontSize: '0.8rem'
                            }}>
                                {app.company_name}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {app.ai_match_score && (
                                <span style={{
                                    color: '#4ade80',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    {app.ai_match_score}% match
                                </span>
                            )}
                            <span style={{
                                background: statusColors[app.status],
                                color: 'white',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {app.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}

                {(!applicationsData?.applications?.length) && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                        No applications yet.{' '}
                        <Link to="/jobs" style={{ color: '#4ade80' }}>
                            Browse jobs
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}