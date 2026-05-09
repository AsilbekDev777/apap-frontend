import api from '@/lib/api/api';
import { Student, PaginatedResponse } from '@/types';

export interface CreateStudentData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    groupId: string;
}

export interface UpdateStudentData {
    firstName?: string;
    lastName?: string;
    studentNumber?: string;
    groupId?: string;
}

export interface StudentQuery {
    search?: string;
    groupId?: string;
    facultyId?: string;
    page?: number;
    limit?: number;
}

export const studentsApi = {
    getAll: async (query: StudentQuery = {}): Promise<PaginatedResponse<Student>> => {
        const { data } = await api.get<PaginatedResponse<Student>>('/students', {
            params: query,
        });
        return data;
    },

    getOne: async (id: string): Promise<Student> => {
        const { data } = await api.get<Student>(`/students/${id}`);
        return data;
    },

    create: async (dto: CreateStudentData): Promise<Student> => {
        const { data } = await api.post<Student>('/students', dto);
        return data;
    },

    update: async (id: string, dto: UpdateStudentData): Promise<Student> => {
        const { data } = await api.put<Student>(`/students/${id}`, dto);
        return data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/students/${id}`);
    },

    importCsv: async (file: File): Promise<{ success: number; failed: number; errors: string[] }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/students/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};