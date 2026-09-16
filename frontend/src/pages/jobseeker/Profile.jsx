import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../../api/auth';
import { aiAPI } from '../../api/ai';
import toast from 'react-hot-toast';
import { Upload, User } from 'lucide-react';

export default function JobSeekerProfile() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState(null);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['my-profile'],
        queryFn: () => authAPI.getMe().then(r => {
            setFormData(r.data.profile);
            return r.data;
        }),
    });

    const { data: analysis } = useQuery({
        queryKey: ['resume-analysis'],
        queryFn: () => aiAPI.getResumeAnalysis().then(r => r.data),
        retry: false
    });

    const updateMutation = useMutation({
        mutationFn: (data) => authAPI.updateJobSeekerProfile(data),
        onSuccess: () => {
            toast.success('Profile updated successfully');
            queryClient.invalidateQueries(['my-profile']);
        },
        onError: () => toast.error('Update failed')
    });

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fd = new FormData();
        fd.append('resume', file);

        try {
            await aiAPI.uploadResume(fd);
            toast.success('Resume uploaded! AI analysis started.');
            setTimeout(() => {
                queryClient.invalidateQueries(['resume-analysis']);
            }, 5000);
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    if (isLoading) return (
        <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '4rem'
        }}>
            Loading profile...
        </div>
    );

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#e2e8f0',
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '1rem'
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            <h1 style={{
                color: '#e2e8f0',
                fontSize: '1.8rem',
                fontWeight: '700',
                marginBottom: '2rem'
            }}>
                My Profile
            </h1>

            {/* Profile Form */}
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
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <User size={18} />
                    Personal Information
                </h2>

                <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    marginBottom: '4px'
                }}>
                    Bio
                </label>
                <textarea
                    value={formData?.bio || ''}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    style={{
                        ...inputStyle,
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                    placeholder="Tell recruiters about yourself..."
                />

                <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    marginBottom: '4px'
                }}>
                    Location
                </label>
                <input
                    value={formData?.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    style={inputStyle}
                    placeholder="Chennai, Tamil Nadu"
                />

                <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    marginBottom: '4px'
                }}>
                    Experience Years
                </label>
                <input
                    type="number"
                    value={formData?.experience_years || 0}
                    onChange={e => setFormData({
                        ...formData,
                        experience_years: parseInt(e.target.value)
                    })}
                    style={inputStyle}
                />

                <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    marginBottom: '4px'
                }}>
                    LinkedIn URL
                </label>
                <input
                    value={formData?.linkedin_url || ''}
                    onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                    style={inputStyle}
                    placeholder="https://linkedin.com/in/yourname"
                />

                <label style={{
                    display: 'block',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    marginBottom: '4px'
                }}>
                    GitHub URL
                </label>
                <input
                    value={formData?.github_url || ''}
                    onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                    style={inputStyle}
                    placeholder="https://github.com/yourname"
                />

                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    style={{
                        background: '#4ade80',
                        color: '#0f172a',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            {/* Resume Upload */}
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
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Upload size={18} />
                    Resume
                </h2>

                <label style={{
                    display: 'inline-block',
                    background: uploading ? '#334155' : '#0f172a',
                    border: '2px dashed #334155',
                    borderRadius: '8px',
                    padding: '2rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleResumeUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <Upload size={32} color="#4ade80" style={{ marginBottom: '8px' }} />
                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {uploading ? 'Uploading and analyzing...' : 'Click to upload resume'}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                        PDF or DOCX — Max 5MB
                    </p>
                </label>
            </div>

            {/* AI Analysis Results */}
            {analysis && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #4ade80'
                }}>
                    <h2 style={{
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '1rem'
                    }}>
                        AI Resume Analysis
                    </h2>

                    {analysis.summary && (
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            lineHeight: '1.7'
                        }}>
                            {analysis.summary}
                        </p>
                    )}

                    <p style={{
                        color: '#4ade80',
                        fontSize: '0.8rem',
                        marginBottom: '8px'
                    }}>
                        Skills detected ({analysis.skills?.length})
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                        marginBottom: '1rem'
                    }}>
                        {analysis.skills?.map(skill => (
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

                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Experience: {analysis.experience_years} years
                    </p>
                </div>
            )}
        </div>
    );
}