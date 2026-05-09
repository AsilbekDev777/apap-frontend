import api from '@/lib/api/api';

export type ReportType = 'student_card' | 'group_report';
export type ReportFormat = 'pdf' | 'excel';
export type ReportStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface ReportJob {
    id: string;
    type: ReportType;
    format: ReportFormat;
    status: ReportStatus;
    fileKey: string | null;
    error: string | null;
    createdAt: string;
}

export interface CreateReportData {
    type: ReportType;
    format: ReportFormat;
    studentId?: string;
    groupId?: string;
    semesterId?: string;
}

export const reportsApi = {
    create: async (dto: CreateReportData): Promise<{ reportJobId: string; status: string }> => {
        const { data } = await api.post('/reports', dto);
        return data;
    },

    getAll: async (): Promise<ReportJob[]> => {
        const { data } = await api.get<ReportJob[]>('/reports');
        return data;
    },

    getStatus: async (id: string): Promise<ReportJob> => {
        const { data } = await api.get<ReportJob>(`/reports/${id}/status`);
        return data;
    },

    download: async (id: string): Promise<Blob> => {
        const { data } = await api.get(`/reports/${id}/download`, {
            responseType: 'blob',
        });
        return data;
    },
};