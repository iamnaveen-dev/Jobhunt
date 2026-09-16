import axiosInstance from '../utils/axios';

export const analyticsAPI = {
    getRecruiterDashboard: () => axiosInstance.get('/analytics/recruiter/'),
    getJobSeekerDashboard: () => axiosInstance.get('/analytics/jobseeker/'),
};