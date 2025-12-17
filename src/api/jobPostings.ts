import { http } from "@/utils/http";

export type JobPostingResult = {
    success: boolean;
    data: {
        list: Array<any>;
        total: number;
        pageSize: number;
        currentPage: number;
    };
};

export const getJobPostingList = (params?: object) => {
    return http.request<JobPostingResult>("get", "/api/job-postings", { params });
};

export const createJobPosting = (data?: object) => {
    return http.request<JobPostingResult>("post", "/api/job-postings", { data });
};

export const updateJobPosting = (id: number, data?: object) => {
    return http.request<JobPostingResult>("put", `/api/job-postings/${id}`, { data });
};

export const deleteJobPosting = (id: number) => {
    return http.request<JobPostingResult>("delete", `/api/job-postings/${id}`);
};
