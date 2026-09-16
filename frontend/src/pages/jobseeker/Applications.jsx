import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../../api/applications';
import { aiAPI } from '../../api/ai';
import toast from 'react-hot-toast';
import { BookOpen, XCircle } from 'lucide-react';

export default function Applications() {
    const queryClient = useQueryClient();
    const [selectedApp, setSelectedApp] = useState(null);
    const [interviewQuestions, setInterviewQuestions] = useState(null);
    const [loadingInterview, setLoadingInterview] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['my-applications'],
        queryFn: () => applicationsAPI.getMyApplications().then(r => r.data),
    });

    const withdrawMutation = useMutation({
        mutationFn: (id) => applicationsAPI.withdraw(id),
        onSuccess: () => {
            toast.success('Application withdrawn');
            queryClient.invalidateQueries(['my-applications']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Cannot withdraw');
        }
    });

    const handleInterviewPrep = async (applicationId) => {
        setLoadingInterview(true);
        try {
            const res = await aiAPI.getInterviewPrep(applicationId);
            setInterviewQuestions(res.data);
            setSelectedApp(applicationId);
        } catch (err) {
            toast.error('Upload your resume first to get interview questions');
        } finally {
            setLoadingInterview(false);
        }
    };

    const statusColors = {
        applied: '#3b82f6',
        screening: '#f59e0b',
        interview: '#8b5cf6',
        offer: '#4ade80',
        rejected: '#ef4444',
        withdrawn: '#64748b'
    };

    if (isLoading) return (
        <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '4rem'
        }}>
            Loading applications...
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
                My Applications
            </h1>
            <p style={{
                color: '#64748b',
                marginBottom: '2rem'
            }}>
                {data?.total || 0} total applications
            </p>

            {/* Interview Questions Panel */}
            {interviewQuestions && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #8b5cf6'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                    }}>
                        <h2 style={{
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}>
                            Interview Prep — {interviewQuestions.job_title}
                        </h2>
                        <button
                            onClick={() => setInterviewQuestions(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer'
                            }}
                        >
                            <XCircle size={18} />
                        </button>
                    </div>

                    <p style={{
                        color: '#8b5cf6',
                        fontSize: '0.8rem',
                        marginBottom: '1rem'
                    }}>
                        Technical Questions
                    </p>
                    {interviewQuestions.technical_questions?.map((q, i) => (
                        <div key={i} style={{
                            background: '#0f172a',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px'
                        }}>
                            <p style={{
                                color: '#e2e8f0',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}>
                                {i + 1}. {q.question}
                            </p>
                            <p style={{
                                color: '#64748b',
                                fontSize: '0.75rem'
                            }}>
                                {q.why_asked}
                            </p>
                        </div>
                    ))}

                    <p style={{
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        margin: '1rem 0 0.5rem'
                    }}>
                        Behavioral Questions
                    </p>
                    {interviewQuestions.behavioral_questions?.map((q, i) => (
                        <div key={i} style={{
                            background: '#0f172a',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px'
                        }}>
                            <p style={{
                                color: '#e2e8f0',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                marginBottom: '4px'
                            }}>
                                {i + 1}. {q.question}
                            </p>
                            <p style={{
                                color: '#64748b',
                                fontSize: '0.75rem'
                            }}>
                                {q.why_asked}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Applications List */}
            {data?.applications?.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#64748b'
                }}>
                    <p style={{ marginBottom: '1rem' }}>
                        No applications yet
                    </p>
                    <Link to="/jobs" style={{
                        background: '#4ade80',
                        color: '#0f172a',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '700'
                    }}>
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                data?.applications?.map(app => (
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
                            <div>
                                <h3 style={{
                                    color: '#e2e8f0',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    marginBottom: '4px'
                                }}>
                                    {app.job_title}
                                </h3>
                                <p style={{
                                    color: '#4ade80',
                                    fontSize: '0.85rem'
                                }}>
                                    {app.company_name}
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                {app.ai_match_score && (
                                    <span style={{
                                        color: '#4ade80',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        {app.ai_match_score}% match
                                    </span>
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

                        <p style={{
                            color: '#64748b',
                            fontSize: '0.8rem',
                            marginBottom: '12px'
                        }}>
                            Applied on {new Date(app.applied_at).toLocaleDateString()}
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleInterviewPrep(app.id)}
                                disabled={loadingInterview}
                                style={{
                                    background: '#0f172a',
                                    color: '#8b5cf6',
                                    border: '1px solid #8b5cf6',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <BookOpen size={12} />
                                Interview Prep
                            </button>

                            {!['rejected', 'withdrawn', 'offer'].includes(app.status) && (
                                <button
                                    onClick={() => withdrawMutation.mutate(app.id)}
                                    style={{
                                        background: 'none',
                                        color: '#ef4444',
                                        border: '1px solid #ef4444',
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Withdraw
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}