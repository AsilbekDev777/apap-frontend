export enum UserRole {
    ADMIN = 'admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
    PARENT = 'parent',
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    lang: 'uz' | 'ru';
}

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    groupId: string;
    userId: string;
    group?: Group;
    user?: { email: string };
}

export interface Group {
    id: string;
    name: string;
    year: number;
    facultyId: string;
    faculty?: Faculty;
}

export interface Faculty {
    id: string;
    nameUz: string;
    nameRu: string;
    code: string;
}

export interface Grade {
    id: string;
    studentId: string;
    courseId: string;
    semesterId: string;
    gradeTypeId: string;
    score: number;
    course?: Course;
    gradeType?: GradeType;
}

export interface Course {
    id: string;
    nameUz: string;
    nameRu: string;
    code: string;
    creditHours: number;
}

export interface GradeType {
    id: string;
    nameUz: string;
    nameRu: string;
    weightPercent: number;
}

export interface Semester {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface Attendance {
    id: string;
    studentId: string;
    courseId: string;
    lessonDate: string;
    status: 'present' | 'absent' | 'late';
}

export interface Notification {
    id: string;
    type: string;
    titleUz: string;
    titleRu: string;
    isRead: boolean;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}