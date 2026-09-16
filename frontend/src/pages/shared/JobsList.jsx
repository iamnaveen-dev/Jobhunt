import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { MapPin, Clock, DollarSign, Search, Briefcase } from 'lucide-react';

export default function JobsList() {
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        job_type: '',
        experience_level: '',
        is_remote: ''
    });
    const [searchMode, setSearchMode] = useState('keyword');

    const { data, isLoading } = useQuery({
        queryKey: ['jobs', filters],
        queryFn: () => jobsAPI.getJobs(filters).then(r => r.data),
    });

    const cardStyle = {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer'
    };

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
                marginBottom: '1.5rem'
            }}>
                Find Your Dream Job
            </h1>

            {/* Search Bar */}
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #334155'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b'
                        }} />
                        <input
                            placeholder="Search jobs..."
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 14px 10px 36px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <input
                        placeholder="Location"
                        value={filters.location}
                        onChange={e => setFilters({ ...filters, location: e.target.value })}
                        style={{
                            padding: '10px 14px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            outline: 'none',
                            width: '180px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={filters.job_type}
                        onChange={e => setFilters({ ...filters, job_type: e.target.value })}
                        style={{
                            padding: '8px 12px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            outline: 'none'
                        }}
                    >
                        <option value="">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>

                    <select
                        value={filters.experience_level}
                        onChange={e => setFilters({ ...filters, experience_level: e.target.value })}
                        style={{
                            padding: '8px 12px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            outline: 'none'
                        }}
                    >
                        <option value="">All Levels</option>
                        <option value="entry">Entry</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                    </select>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={filters.is_remote === 'true'}
                            onChange={e => setFilters({
                                ...filters,
                                is_remote: e.target.checked ? 'true' : ''
                            })}
                        />
                        Remote Only
                    </label>
                </div>
            </div>

            {/* Results */}
            {isLoading ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                    Loading jobs...
                </div>
            ) : (
                <>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {data?.total || 0} jobs found
                    </p>

                    {data?.jobs?.map(job => (
                        <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={cardStyle}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <div>
                                        <h3 style={{
                                            color: '#e2e8f0',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            marginBottom: '4px'
                                        }}>
                                            {job.title}
                                        </h3>
                                        <p style={{ color: '#4ade80', fontSize: '0.85rem' }}>
                                            {job.company_name || job.recruiter_name}
                                        </p>
                                    </div>
                                    <span style={{
                                        background: '#0f172a',
                                        color: '#4ade80',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {job.job_type?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    color: '#64748b',
                                    fontSize: '0.8rem',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} />
                                        {job.location} {job.is_remote && '• Remote'}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Briefcase size={12} />
                                        {job.experience_level}
                                    </span>
                                    {job.salary_min && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <DollarSign size={12} />
                                            ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {job.skills_required?.slice(0, 5).map(skill => (
                                        <span
                                            key={skill.id}
                                            style={{
                                                background: '#0f172a',
                                                color: '#94a3b8',
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '12px'
                                }}>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        {job.applications_count} applicants
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </>
            )}
        </div>
    );
}