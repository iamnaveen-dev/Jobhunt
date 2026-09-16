import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';

export default function PostJob() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        is_remote: false,
        job_type: 'full_time',
        experience_level: 'entry',
        salary_min: '',
        salary_max: '',
        skills_required: [],
        is_active: true,
        deadline: ''
    });

    const { data: skillsData } = useQuery({
        queryKey: ['skills'],
        queryFn: () => jobsAPI.getSkills().then(r => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (data) => jobsAPI.createJob(data),
        onSuccess: () => {
            toast.success('Job posted successfully!');
            navigate('/recruiter/my-jobs');
        },
        onError: (err) => {
            const errors = err.response?.data;
            if (errors) {
                Object.values(errors).forEach(msg => toast.error(msg));
            } else {
                toast.error('Failed to post job');
            }
        }
    });

    const handleSkillToggle = (skillId) => {
        setFormData(prev => ({
            ...prev,
            skills_required: prev.skills_required.includes(skillId)
                ? prev.skills_required.filter(id => id !== skillId)
                : [...prev.skills_required, skillId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
            salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        });
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
        boxSizing: 'border-box',
        marginBottom: '1rem',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        color: '#94a3b8',
        fontSize: '0.8rem',
        marginBottom: '4px'
    };

    return (
        <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            <h1 style={{
                color: '#e2e8f0',
                fontSize: '1.8rem',
                fontWeight: '700',
                marginBottom: '2rem'
            }}>
                Post a New Job
            </h1>

            <form onSubmit={handleSubmit}>
                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #334155',
                    marginBottom: '1rem'
                }}>
                    <label style={labelStyle}>Job Title *</label>
                    <input
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                        style={inputStyle}
                        placeholder="Django Backend Developer"
                    />

                    <label style={labelStyle}>Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={6}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="Describe the role, responsibilities, and requirements..."
                    />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Location *</label>
                            <input
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                required
                                style={inputStyle}
                                placeholder="Chennai"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Job Type</label>
                            <select
                                value={formData.job_type}
                                onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Experience Level</label>
                            <select
                                value={formData.experience_level}
                                onChange={e => setFormData({
                                    ...formData,
                                    experience_level: e.target.value
                                })}
                                style={inputStyle}
                            >
                                <option value="entry">Entry</option>
                                <option value="mid">Mid</option>
                                <option value="senior">Senior</option>
                                <option value="lead">Lead</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Min Salary (₹)</label>
                            <input
                                type="number"
                                value={formData.salary_min}
                                onChange={e => setFormData({ ...formData, salary_min: e.target.value })}
                                style={inputStyle}
                                placeholder="30000"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Max Salary (₹)</label>
                            <input
                                type="number"
                                value={formData.salary_max}
                                onChange={e => setFormData({ ...formData, salary_max: e.target.value })}
                                style={inputStyle}
                                placeholder="60000"
                            />
                        </div>
                    </div>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}>
                        <input
                            type="checkbox"
                            checked={formData.is_remote}
                            onChange={e => setFormData({ ...formData, is_remote: e.target.checked })}
                        />
                        Remote position
                    </label>

                    {/* Skills Selection */}
                    <label style={labelStyle}>Required Skills</label>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '1rem'
                    }}>
                        {skillsData?.skills?.map(skill => (
                            <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleSkillToggle(skill.id)}
                                style={{
                                    background: formData.skills_required.includes(skill.id)
                                        ? '#4ade80'
                                        : '#0f172a',
                                    color: formData.skills_required.includes(skill.id)
                                        ? '#0f172a'
                                        : '#94a3b8',
                                    border: '1px solid #334155',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {skill.name}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={createMutation.isPending}
                    style={{
                        width: '100%',
                        background: createMutation.isPending ? '#334155' : '#4ade80',
                        color: '#0f172a',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        cursor: createMutation.isPending ? 'not-allowed' : 'pointer'
                    }}
                >
                    {createMutation.isPending ? 'Posting...' : 'Post Job'}
                </button>
            </form>
        </div>
    );
}