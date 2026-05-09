import api from '@/lib/api/api';
import { Grade } from '@/types';

export interface CreateGradeData {
    studentId: string;
    courseId: string;
    semesterId: string;
    gradeTypeId: string;
    score: number;
}

export interface GradeQuery {
    studentId?: string;
    semesterId?: string;
    courseId?: string;
}

export interface GpaResult {
    gpa100: number;
    gpa5: number;
}

export interface GradeType {
    id: string;
    nameUz: string;
    nameRu: string;
    weightPercent: number;
}

export const gradesApi = {
    getAll: async (query: GradeQuery = {}): Promise<Grade[]> => {
        const { data } = await api.get<Grade[]>('/grades', { params: query });
        return data;
    },

    create: async (dto: CreateGradeData): Promise<Grade & GpaResult> => {
        const { data } = await api.post<Grade & GpaResult>('/grades', dto);
        return data;
    },

    update: async (id: string, score: number): Promise<Grade> => {
        const { data } = await api.put<Grade>(`/grades/${id}`, { score });
        return data;
    },

    getGpa: async (studentId: string, semesterId: string): Promise<GpaResult> => {
        const { data } = await api.get<GpaResult>(
            `/grades/gpa/${studentId}/${semesterId}`,
        );
        return data;
    },

    getGradeTypes: async (): Promise<GradeType[]> => {
        const { data } = await api.get<GradeType[]>('/admin/grade-types');
        return data;
    },
};