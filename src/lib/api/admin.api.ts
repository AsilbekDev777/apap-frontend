import api from '@/lib/api/api';
import { Faculty, Group, Semester, Course } from '@/types';

export const adminApi = {
    getFaculties: async (): Promise<Faculty[]> => {
        const { data } = await api.get<Faculty[]>('/admin/faculties');
        return data;
    },

    getGroups: async (facultyId?: string): Promise<Group[]> => {
        const { data } = await api.get<Group[]>('/admin/groups', {
            params: facultyId ? { facultyId } : {},
        });
        return data;
    },

    getSemesters: async (): Promise<Semester[]> => {
        const { data } = await api.get<Semester[]>('/admin/semesters');
        return data;
    },

    getCourses: async (): Promise<Course[]> => {
        const { data } = await api.get<Course[]>('/admin/courses');
        return data;
    },
};