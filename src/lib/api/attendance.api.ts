import api from '@/lib/api/api';
import { Attendance } from '@/types';

export interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent' | 'late';
}

export interface BulkAttendanceData {
    courseId: string;
    lessonDate: string;
    records: AttendanceRecord[];
}

export interface AttendanceStats {
    courseId: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
    warning: boolean;
}

export const attendanceApi = {
    getAll: async (query: {
        studentId?: string;
        courseId?: string;
    }): Promise<{ records: Attendance[]; stats: AttendanceStats }> => {
        const { data } = await api.get('/attendance', { params: query });
        return data;
    },

    bulkCreate: async (dto: BulkAttendanceData) => {
        const { data } = await api.post('/attendance/bulk', dto);
        return data;
    },

    getStats: async (
        studentId: string,
        courseId: string,
    ): Promise<AttendanceStats> => {
        const { data } = await api.get<AttendanceStats>(
            `/attendance/stats/${studentId}/${courseId}`,
        );
        return data;
    },
};