import axiosInstance from '../utils/axios';

export const jobsAPI = {
    getJobs: (params) => axiosInstance.get('/jobs/', { params }),

    getJob: (id) => axiosInstance.get(`/jobs/${id}/`),

    createJob: (data) => axiosInstance.post('/jobs/create/', data),

    updateJob: (id, data) =>
        axiosInstance.patch(`/jobs/${id}/update/`, data),

    deleteJob: (id) =>
        axiosInstance.delete(`/jobs/${id}/delete/`),

    getMyJobs: () =>
        axiosInstance.get('/jobs/my-jobs/'),

    toggleJob: (id) =>
        axiosInstance.post(`/jobs/${id}/toggle/`),

    getSkills: () =>
        axiosInstance.get('/skills/'),

    semanticSearch: (query) =>
        axiosInstance.get('/jobs/semantic-search/', {
            params: { q: query },
        }),
};