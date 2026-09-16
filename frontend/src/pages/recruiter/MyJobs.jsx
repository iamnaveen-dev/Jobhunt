import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import { Plus, Users, Pause, Play, Trash2 } from 'lucide-react';

export default function MyJobs() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['my-jobs'],
        queryFn: () => jobsAPI.getMyJobs().then(r => r.data),
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => jobsAPI.toggleJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-jobs']);
            toast.success('Job status updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => jobsAPI.deleteJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-jobs']);
            toast.success('Job deleted');
        }
    });

    if (isLoading) return (
        <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '4rem'
        }}>
            Loading jobs...
        </div>
    );

    return (
        <div style={{
            maxWidth: '900px',
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
                        fontWeight: '700'
                    }}>
                        My Jobs
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>
                        {data?.total || 0} jobs posted
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
                    Post New Job
                </Link>
            </div>

            {data?.jobs?.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#64748b'
                }}>
                    <p style={{ marginBottom: '1rem' }}>
                        No jobs posted yet
                    </p>
                    <Link to="/recruiter/post-job" style={{
                        background: '#4ade80',
                        color: '#0f172a',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '700'
                    }}>
                        Post Your First Job
                    </Link>
                </div>
            ) : (
                data?.jobs?.map(job => (
                    <div key={job.id} style={{
                        background: '#1e293b',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        border: '1px solid #334155'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <h3 style={{
                                    color: '#e2e8f0',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    marginBottom: '4px'
                                }}>
                                    {job.title}
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    color: '#64748b',
                                    fontSize: '0.8rem'
                                }}>
                                    <span>{job.location}</span>
                                    <span>{job.job_type?.replace('_', ' ')}</span>
                                    <span>{job.experience_level}</span>
                                </div>
                            </div>
                            <span style={{
                                background: job.is_active ? '#0f2d1a' : '#1a1a1a',
                                color: job.is_active ? '#4ade80' : '#64748b',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {job.is_active ? 'Active' : 'Paused'}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            marginBottom: '12px'
                        }}>
                            {job.skills_required?.slice(0, 4).map(skill => (
                                <span key={skill.id} style={{
                                    background: '#0f172a',
                                    color: '#94a3b8',
                                    padding: '2px 8px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem'
                                }}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                color: '#64748b',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Users size={12} />
                                {job.applications_count} applicants
                            </span>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link
                                    to={`/recruiter/jobs/${job.id}/applicants`}
                                    style={{
                                        background: '#0f172a',
                                        color: '#e2e8f0',
                                        border: '1px solid #334155',
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Users size={12} />
                                    Applicants
                                </Link>

                                <button
                                    onClick={() => toggleMutation.mutate(job.id)}
                                    style={{
                                        background: 'none',
                                        border: '1px solid #334155',
                                        color: job.is_active ? '#f59e0b' : '#4ade80',
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {job.is_active
                                        ? <><Pause size={12} /> Pause</>
                                        : <><Play size={12} /> Activate</>
                                    }
                                </button>

                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this job?')) {
                                            deleteMutation.mutate(job.id);
                                        }
                                    }}
                                    style={{
                                        background: 'none',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}