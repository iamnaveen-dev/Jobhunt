import axiosInstance from '../utils/axios';

export const authAPI = {
    register: (data) => axiosInstance.post('/auth/register/', data),
    login: (data) => axiosInstance.post('/auth/login/', data),
    logout: (refresh) => axiosInstance.post('/auth/logout/', { refresh }),
    getMe: () => axiosInstance.get('/auth/me/'),
    updateJobSeekerProfile: (data) =>
        axiosInstance.patch('/auth/profile/jobseeker/', data),
    updateRecruiterProfile: (data) =>
        axiosInstance.patch('/auth/profile/recruiter/', data),
    changePassword: (data) =>
        axiosInstance.post('/auth/change-password/', data),
};