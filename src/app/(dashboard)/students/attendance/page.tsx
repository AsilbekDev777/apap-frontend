'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    MenuItem,
    TextField,
    Chip,
} from '@mui/material';
import { useAuthStore } from '@/store/auth.store';
import { attendanceApi, AttendanceStats } from '@/lib/api/attendance.api';
import { adminApi } from '@/lib/api/admin.api';
import api from '@/lib/api/api';
import { Attendance, Course } from '@/types';
import AttendanceStatsCard from '@/components/attendance/AttendanceStatsCard';
import PageHeader from '@/components/ui/PageHeader';

const STATUS_CONFIG = {
    present: { label: 'Keldi', color: 'success' as const },
    late: { label: 'Kech', color: 'warning' as const },
    absent: { label: 'Kelmadi', color: 'error' as const },
};

export default function StudentAttendancePage() {
    const { user } = useAuthStore();
    const [studentId, setStudentId] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [records, setRecords] = useState<Attendance[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/students', { params: { limit: 1 } });
            const student = data.data?.[0];
            if (student) setStudentId(student.id as string);
        } catch {
            // silent
        }
    }, [user]);

    const loadCourses = useCallback(async () => {
        try {
            const data = await adminApi.getCourses();
            setCourses(data);
        } catch {
            // silent
        }
    }, []);

    const loadAttendance = useCallback(async () => {
        if (!studentId || !selectedCourse) return;
        setLoading(true);
        try {
            const data = await attendanceApi.getAll({
                studentId,
                courseId: selectedCourse,
            });
            setRecords(data.records);
            setStats(data.stats);
        } finally {
            setLoading(false);
        }
    }, [studentId, selectedCourse]);

    useEffect(() => {
        void loadProfile();
        void loadCourses();
    }, [loadProfile, loadCourses]);

    useEffect(() => {
        void loadAttendance();
    }, [loadAttendance]);

    return (
        <Box>
            <PageHeader title="Davomatim" />

            <Card sx={{ p: 2, mb: 3 }}>
                <TextField
                    select
                    label="Kurs"
                    size="small"
                    sx={{ width: 300 }}
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            {c.nameUz}
                        </MenuItem>
                    ))}
                </TextField>
            </Card>

            {stats && (
                <Box sx={{ mb: 3 }}>
                    <AttendanceStatsCard stats={stats} />
                </Box>
            )}

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Sana</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Holat</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : !selectedCourse ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Kursni tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Davomat ma&apos;lumotlari topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => (
                                    <TableRow key={record.id} hover>
                                        <TableCell>
                                            {new Date(record.lessonDate).toLocaleDateString('uz')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={STATUS_CONFIG[record.status].label}
                                                color={STATUS_CONFIG[record.status].color}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}