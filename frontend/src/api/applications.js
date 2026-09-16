import axiosInstance from '../utils/axios';

export const applicationsAPI = {
    apply: (data) =>
        axiosInstance.post('/applications/apply/', data),

    getMyApplications: () =>
        axiosInstance.get('/applications/my-applications/'),

    getApplication: (id) =>
        axiosInstance.get(`/applications/${id}/`),

    getJobApplicants: (jobId) =>
        axiosInstance.get(`/applications/job/${jobId}/applicants/`),

    updateStatus: (id, data) =>
        axiosInstance.patch(`/applications/${id}/status/`, data),

    withdraw: (id) =>
        axiosInstance.post(`/applications/${id}/withdraw/`),

    getSavedJobs: () =>
        axiosInstance.get('/applications/saved-jobs/'),

    saveJob: (jobId) =>
        axiosInstance.post('/applications/saved-jobs/', {
            job_id: jobId,
        }),

    removeSavedJob: (id) =>
        axiosInstance.delete(`/applications/saved-jobs/${id}/remove/`),
};