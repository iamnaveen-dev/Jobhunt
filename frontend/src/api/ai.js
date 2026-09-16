import axiosInstance from '../utils/axios';

export const aiAPI = {
    uploadResume: (formData) =>
        axiosInstance.post('/ai/resume/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getResumeAnalysis: () =>
        axiosInstance.get('/ai/resume/analysis/'),

    getMatchScore: (jobId) =>
        axiosInstance.get(`/ai/match/${jobId}/`),

    getInterviewPrep: (applicationId) =>
        axiosInstance.get(`/ai/interview-prep/${applicationId}/`),

    generateCoverLetter: (jobId) =>
        axiosInstance.post(`/ai/cover-letter/${jobId}/`),
};