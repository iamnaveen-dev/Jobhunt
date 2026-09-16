import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobsAPI } from '../../api/jobs';
import { applicationsAPI } from '../../api/applications';
import { aiAPI } from '../../api/ai';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import {
    MapPin, Briefcase, DollarSign,
    Clock, Users, Zap, BookOpen
} from 'lucide-react';

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [coverLetter, setCoverLetter] = useState('');
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [generatingCL, setGeneratingCL] = useState(false);

    const { data: job, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: () => jobsAPI.getJob(id).then(r => r.data),
    });

    const { data: matchScore } = useQuery({
        queryKey: ['match-score', id],
        queryFn: () => aiAPI.getMatchScore(id).then(r => r.data),
        enabled: isAuthenticated && user?.role === 'job_seeker',
    });

    const applyMutation = useMutation({
        mutationFn: (data) => applicationsAPI.apply(data),
        onSuccess: () => {
            toast.success('Application submitted successfully!');
            setShowApplyForm(false);
            navigate('/jobseeker/applications');
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Application failed');
        }
    });

    const handleGenerateCoverLetter = async () => {
        setGeneratingCL(true);
        try {
            const res = await aiAPI.generateCoverLetter(id);
            setCoverLetter(res.data.cover_letter);
            toast.success('Cover letter generated!');
        } catch (err) {
            toast.error('Could not generate cover letter. Upload your resume first.');
        } finally {
            setGeneratingCL(false);
        }
    };

    const handleApply = () => {
        applyMutation.mutate({
            job: parseInt(id),
            cover_letter: coverLetter
        });
    };

    if (isLoading) return (
        <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '4rem'
        }}>
            Loading job details...
        </div>
    );

    if (!job) return null;

    const scoreColor = matchScore?.match_score >= 70
        ? '#4ade80'
        : matchScore?.match_score >= 50
            ? '#f59e0b'
            : '#ef4444';

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            {/* Job Header */}
            <div style={{
                background: '#1e293b',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
                border: '1px solid #334155'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <h1 style={{
                            color: '#e2e8f0',
                            fontSize: '1.6rem',
                            fontWeight: '700',
                            marginBottom: '4px'
                        }}>
                            {job.title}
                        </h1>
                        <p style={{
                            color: '#4ade80',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}>
                            {job.company_name || job.recruiter_name}
                        </p>
                    </div>

                    {/* AI Match Score */}
                    {matchScore && (
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '12px',
                            padding: '1rem 1.5rem',
                            textAlign: 'center',
                            border: `2px solid ${scoreColor}`
                        }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: scoreColor
                            }}>
                                {matchScore.match_score}%
                            </div>
                            <div style={{
                                color: '#64748b',
                                fontSize: '0.75rem'
                            }}>
                                AI Match
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} />
                        {job.location} {job.is_remote && '• Remote'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={14} />
                        {job.experience_level}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {job.job_type?.replace('_', ' ')}
                    </span>
                    {job.salary_min && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} />
                            ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}
                        </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} />
                        {job.applications_count} applicants
                    </span>
                </div>

                {/* Skills */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem'
                }}>
                    {job.skills_required?.map(skill => (
                        <span key={skill.id} style={{
                            background: '#0f172a',
                            color: '#94a3b8',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem'
                        }}>
                            {skill.name}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                {isAuthenticated && user?.role === 'job_seeker' && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowApplyForm(!showApplyForm)}
                            style={{
                                background: '#4ade80',
                                color: '#0f172a',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {showApplyForm ? 'Cancel' : 'Apply Now'}
                        </button>

                        <button
                            onClick={handleGenerateCoverLetter}
                            disabled={generatingCL}
                            style={{
                                background: '#1e293b',
                                color: '#e2e8f0',
                                border: '1px solid #334155',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Zap size={14} />
                            {generatingCL ? 'Generating...' : 'AI Cover Letter'}
                        </button>
                    </div>
                )}
            </div>

            {/* AI Match Details */}
            {matchScore && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #334155'
                }}>
                    <h2 style={{
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '1rem'
                    }}>
                        AI Skills Analysis
                    </h2>

                    <p style={{
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        marginBottom: '1rem'
                    }}>
                        {matchScore.recommendation}
                    </p>

                    {matchScore.matched_skills?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                            <p style={{
                                color: '#4ade80',
                                fontSize: '0.8rem',
                                marginBottom: '6px'
                            }}>
                                ✓ Skills you have
                            </p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {matchScore.matched_skills.map(skill => (
                                    <span key={skill} style={{
                                        background: '#0f2d1a',
                                        color: '#4ade80',
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {matchScore.missing_skills?.length > 0 && (
                        <div>
                            <p style={{
                                color: '#ef4444',
                                fontSize: '0.8rem',
                                marginBottom: '6px'
                            }}>
                                ✗ Skills to learn
                            </p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {matchScore.missing_skills.map(skill => (
                                    <span key={skill} style={{
                                        background: '#2d0f0f',
                                        color: '#ef4444',
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Apply Form */}
            {showApplyForm && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #4ade80'
                }}>
                    <h2 style={{
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '1rem'
                    }}>
                        Apply for {job.title}
                    </h2>

                    <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        marginBottom: '6px'
                    }}>
                        Cover Letter (optional)
                    </label>
                    <textarea
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        rows={6}
                        placeholder="Write your cover letter here or use AI to generate one..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: '0.85rem',
                            outline: 'none',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                            marginBottom: '1rem'
                        }}
                    />

                    <button
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                        style={{
                            background: '#4ade80',
                            color: '#0f172a',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            )}

            {/* Job Description */}
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #334155'
            }}>
                <h2 style={{
                    color: '#e2e8f0',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                }}>
                    Job Description
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap'
                }}>
                    {job.description}
                </p>

                {job.deadline && (
                    <p style={{
                        color: '#64748b',
                        fontSize: '0.8rem',
                        marginTop: '1rem'
                    }}>
                        Application deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
}