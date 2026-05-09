import { UserRole } from '@/types';

export interface NavItem {
    label: string;
    href: string;
    icon: string;
}

export const navItems: Record<UserRole, NavItem[]> = {
    [UserRole.ADMIN]: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
        { label: 'Talabalar', href: '/admin/students', icon: 'people' },
        { label: 'Baholar', href: '/admin/grades', icon: 'grade' },
        { label: 'Davomat', href: '/admin/attendance', icon: 'event_available' },
        { label: 'Reportlar', href: '/admin/reports', icon: 'assessment' },
        { label: 'Fakultetlar', href: '/admin/faculties', icon: 'account_balance' },
        { label: 'Guruhlar', href: '/admin/groups', icon: 'group_work' },
        { label: 'Kurslar', href: '/admin/courses', icon: 'book' },
        { label: 'Semestrlar', href: '/admin/semesters', icon: 'calendar_month' },
        { label: 'Foydalanuvchilar', href: '/admin/users', icon: 'manage_accounts' },
        { label: 'Audit log', href: '/admin/audit', icon: 'history' },
    ],
    [UserRole.TEACHER]: [
        { label: 'Dashboard', href: '/teacher/dashboard', icon: 'dashboard' },
        { label: 'Talabalar', href: '/teacher/students', icon: 'people' },
        { label: 'Baholar', href: '/teacher/grades', icon: 'grade' },
        { label: 'Davomat', href: '/teacher/attendance', icon: 'event_available' },
        { label: 'Reportlar', href: '/teacher/reports', icon: 'assessment' },
    ],
    [UserRole.STUDENT]: [
        { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
        { label: 'Baholarim', href: '/student/grades', icon: 'grade' },
        { label: 'Davomatim', href: '/student/attendance', icon: 'event_available' },
        { label: 'Reportlar', href: '/student/reports', icon: 'assessment' },
    ],
    [UserRole.PARENT]: [
        { label: 'Dashboard', href: '/parent/dashboard', icon: 'dashboard' },
        { label: 'Farzand baholar', href: '/parent/grades', icon: 'grade' },
        { label: 'Farzand davomat', href: '/parent/attendance', icon: 'event_available' },
    ],
};