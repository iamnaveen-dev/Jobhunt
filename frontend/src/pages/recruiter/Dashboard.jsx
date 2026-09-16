import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../api/analytics';
import { jobsAPI } from '../../api/jobs';
import useAuthStore from '../../store/authStore';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { Plus, Users, Briefcase, TrendingUp } from 'lucide-react';

export default function RecruiterDashboard() {
    const { user } = useAuthStore();

    const { data: dashboardData } = useQuery({
        queryKey: ['recruiter-dashboard'],
        queryFn: () => analyticsAPI.getRecruiterDashboard().then(r => r.data),
    });

    const { data: myJobsData } = useQuery({
        queryKey: ['my-jobs'],
        queryFn: () => jobsAPI.getMyJobs().then(r => r.data),
    });

    const funnelData = dashboardData ? [
        { name: 'Applied', value: dashboardData.funnel.applied, color: '#3b82f6' },
        { name: 'Screening', value: dashboardData.funnel.screening, color: '#f59e0b' },
        { name: 'Interview', value: dashboardData.funnel.interview, color: '#8b5cf6' },
        { name: 'Offer', value: dashboardData.funnel.offer, color: '#4ade80' },
        { name: 'Rejected', value: dashboardData.funnel.rejected, color: '#ef4444' },
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{
                        color: '#e2e8f0',
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem'
                    }}>
                        Recruiter Dashboard
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        Welcome back, {user?.username}
                    </p>
                </div>
                <Link to="/recruiter/post-job" style={{
                    background: '#4ade80',
                    color: '#0f172a',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Plus size={16} />
                    Post a Job
                </Link>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                {statCard(
                    <Briefcase size={24} />,
                    'Total Jobs Posted',
                    dashboardData?.overview.total_jobs || 0,
                    '#3b82f6'
                )}
                {statCard(
                    <Users size={24} />,
                    'Total Applications',
                    dashboardData?.overview.total_applications || 0,
                    '#4ade80'
                )}
                {statCard(
                    <TrendingUp size={24} />,
                    'Active Jobs',
                    dashboardData?.overview.active_jobs || 0,
                    '#f59e0b'
                )}
                {statCard(
                    <Users size={24} />,
                    'This Month',
                    dashboardData?.overview.recent_applications_30d || 0,
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
                    Hiring Funnel
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={funnelData}>
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
                            {funnelData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{
                        color: '#e2e8f0',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                    }}>
                        My Job Postings
                    </h2>
                    <Link to="/recruiter/my-jobs" style={{
                        color: '#4ade80',
                        fontSize: '0.85rem',
                        textDecoration: 'none'
                    }}>
                        View all
                    </Link>
                </div>

                {myJobsData?.jobs?.slice(0, 5).map(job => (
                    <div key={job.id} style={{
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
                                {job.title}
                            </div>
                            <div style={{
                                color: '#64748b',
                                fontSize: '0.8rem'
                            }}>
                                {job.applications_count} applicants
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                                background: job.is_active ? '#0f172a' : '#334155',
                                color: job.is_active ? '#4ade80' : '#64748b',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem'
                            }}>
                                {job.is_active ? 'Active' : 'Paused'}
                            </span>
                            <Link to={`/recruiter/jobs/${job.id}/applicants`} style={{
                                background: '#334155',
                                color: '#e2e8f0',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                textDecoration: 'none'
                            }}>
                                View
                            </Link>
                        </div>
                    </div>
                ))}

                {(!myJobsData?.jobs?.length) && (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                        No jobs posted yet.{' '}
                        <Link to="/recruiter/post-job" style={{ color: '#4ade80' }}>
                            Post your first job
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}