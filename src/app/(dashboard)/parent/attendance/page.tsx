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
import { attendanceApi, AttendanceStats } from '@/lib/api/attendance.api';
import { adminApi } from '@/lib/api/admin.api';
import api from '@/lib/api/api';
import { Attendance, Course } from '@/types';
import AttendanceStatsCard from '@/components/attendance/AttendanceStatsCard';
import PageHeader from '@/components/ui/PageHeader';

interface ChildProfile {
    id: string;
    firstName: string;
    lastName: string;
}

const STATUS_CONFIG = {
    present: { label: 'Keldi', color: 'success' as const },
    late: { label: 'Kech', color: 'warning' as const },
    absent: { label: 'Kelmadi', color: 'error' as const },
};

export default function ParentAttendancePage() {
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [records, setRecords] = useState<Attendance[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [selectedChild, setSelectedChild] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [links, c] = await Promise.all([
                api.get<{ student: ChildProfile }[]>('/parent/children'),
                adminApi.getCourses(),
            ]);
            setChildren(links.data.map((l) => l.student));
            setCourses(c);
        } catch {
            // silent
        }
    }, []);

    const loadAttendance = useCallback(async () => {
        if (!selectedChild || !selectedCourse) return;
        setLoading(true);
        try {
            const data = await attendanceApi.getAll({
                studentId: selectedChild,
                courseId: selectedCourse,
            });
            setRecords(data.records);
            setStats(data.stats);
        } finally {
            setLoading(false);
        }
    }, [selectedChild, selectedCourse]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        void loadAttendance();
    }, [loadAttendance]);

    return (
        <Box>
            <PageHeader title="Farzand davomat" />

            <Card sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        label="Farzand"
                        size="small"
                        sx={{ width: 250 }}
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                    >
                        {children.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.lastName} {c.firstName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Kurs"
                        size="small"
                        sx={{ width: 250 }}
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        {courses.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.nameUz}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
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
                            ) : !selectedChild || !selectedCourse ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Farzand va kursni tanlang
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