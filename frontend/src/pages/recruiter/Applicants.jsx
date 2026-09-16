import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsAPI } from '../../api/applications';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';

export default function Applicants() {
    const { jobId } = useParams();
    const queryClient = useQueryClient();
    const [selectedApp, setSelectedApp] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [note, setNote] = useState('');

    const { data: job } = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => jobsAPI.getJob(jobId).then(r => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['applicants', jobId],
        queryFn: () => applicationsAPI.getJobApplicants(jobId).then(r => r.data),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => applicationsAPI.updateStatus(id, data),
        onSuccess: () => {
            toast.success('Status updated successfully');
            queryClient.invalidateQueries(['applicants', jobId]);
            setSelectedApp(null);
            setNewStatus('');
            setNote('');
        },
        onError: (err) => {
            toast.error(err.response?.data?.status?.[0] || 'Update failed');
        }
    });

    const statusColors = {
        applied: '#3b82f6',
        screening: '#f59e0b',
        interview: '#8b5cf6',
        offer: '#4ade80',
        rejected: '#ef4444',
        withdrawn: '#64748b'
    };

    const validTransitions = {
        applied: ['screening', 'rejected'],
        screening: ['interview', 'rejected'],
        interview: ['offer', 'rejected'],
        offer: ['rejected'],
        rejected: [],
        withdrawn: []
    };

    if (isLoading) return (
        <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '4rem'
        }}>
            Loading applicants...
        </div>
    );

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            <h1 style={{
                color: '#e2e8f0',
                fontSize: '1.8rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
            }}>
                Applicants
            </h1>
            <p style={{
                color: '#4ade80',
                marginBottom: '0.5rem'
            }}>
                {job?.title}
            </p>
            <p style={{
                color: '#64748b',
                marginBottom: '2rem'
            }}>
                {data?.total || 0} applicants — sorted by AI match score
            </p>

            {/* Status Update Panel */}
            {selectedApp && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #4ade80'
                }}>
                    <h3 style={{
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginBottom: '1rem'
                    }}>
                        Update Status for {selectedApp.applicant_name}
                    </h3>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                        {validTransitions[selectedApp.status]?.map(status => (
                            <button
                                key={status}
                                onClick={() => setNewStatus(status)}
                                style={{
                                    background: newStatus === status
                                        ? statusColors[status]
                                        : '#0f172a',
                                    color: newStatus === status ? 'white' : '#94a3b8',
                                    border: `1px solid ${statusColors[status]}`,
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <input
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)"
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            marginBottom: '1rem'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => updateMutation.mutate({
                                id: selectedApp.id,
                                data: { status: newStatus, note }
                            })}
                            disabled={!newStatus || updateMutation.isPending}
                            style={{
                                background: newStatus ? '#4ade80' : '#334155',
                                color: '#0f172a',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                cursor: newStatus ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update Status'}
                        </button>
                        <button
                            onClick={() => setSelectedApp(null)}
                            style={{
                                background: 'none',
                                color: '#64748b',
                                border: '1px solid #334155',
                                padding: '8px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Applicants List */}
            {data?.applications?.map((app, index) => (
                <div key={app.id} style={{
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: '#0f172a',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#4ade80',
                                fontWeight: '700',
                                fontSize: '0.9rem'
                            }}>
                                #{index + 1}
                            </div>
                            <div>
                                <h3 style={{
                                    color: '#e2e8f0',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}>
                                    {app.applicant_name}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.8rem'
                                }}>
                                    {app.applicant_email}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            {app.ai_match_score !== null && (
                                <div style={{
                                    textAlign: 'center',
                                    background: '#0f172a',
                                    padding: '6px 12px',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: app.ai_match_score >= 70
                                            ? '#4ade80'
                                            : app.ai_match_score >= 50
                                                ? '#f59e0b'
                                                : '#ef4444'
                                    }}>
                                        {app.ai_match_score}%
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: '#64748b'
                                    }}>
                                        AI Match
                                    </div>
                                </div>
                            )}

                            <span style={{
                                background: statusColors[app.status],
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {app.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{
                            color: '#64748b',
                            fontSize: '0.75rem'
                        }}>
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                        </span>

                        {validTransitions[app.status]?.length > 0 && (
                            <button
                                onClick={() => {
                                    setSelectedApp(app);
                                    setNewStatus('');
                                    setNote('');
                                }}
                                style={{
                                    background: '#0f172a',
                                    color: '#4ade80',
                                    border: '1px solid #4ade80',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Move Pipeline
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {data?.applications?.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#64748b'
                }}>
                    No applicants yet for this job
                </div>
            )}
        </div>
    );
}