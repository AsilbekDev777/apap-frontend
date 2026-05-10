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
    Grid,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import { attendanceApi } from '@/lib/api/attendance.api';
import api from '@/lib/api/api';
import { Attendance } from '@/types';
import BulkAttendanceModal from '@/components/attendance/BulkAttendanceModal';
import AttendanceStatsCard from '@/components/attendance/AttendanceStatsCard';
import PageHeader from '@/components/ui/PageHeader';
import { AttendanceStats } from '@/lib/api/attendance.api';

interface TeacherAssignment {
    courseId: string;
    groupId: string;
    course: { id: string; nameUz: string };
    group: { id: string; name: string };
}

interface StudentItem {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
}

const STATUS_CONFIG = {
    present: { label: 'Keldi', color: 'success' as const },
    late: { label: 'Kech', color: 'warning' as const },
    absent: { label: 'Kelmadi', color: 'error' as const },
};

export default function TeacherAttendancePage() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [records, setRecords] = useState<Attendance[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);

    const loadAssignments = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get<TeacherAssignment[]>(
                '/admin/teacher-assignments',
                { params: { teacherUserId: user.id } },
            );
            setAssignments(data);
        } catch {
            // silent
        }
    }, [user]);

    const loadStudents = useCallback(async (groupId: string) => {
        try {
            const { data } = await api.get('/students', {
                params: { groupId, limit: 100 },
            });
            setStudents(data.data);
        } catch {
            // silent
        }
    }, []);

    const loadAttendance = useCallback(async () => {
        if (!selectedStudent || !selectedAssignment) return;
        const assignment = assignments.find(
            (a) => `${a.courseId}-${a.groupId}` === selectedAssignment,
        );
        if (!assignment) return;

        setLoading(true);
        try {
            const data = await attendanceApi.getAll({
                studentId: selectedStudent,
                courseId: assignment.courseId,
            });
            setRecords(data.records);
            setStats(data.stats);
        } finally {
            setLoading(false);
        }
    }, [selectedStudent, selectedAssignment, assignments]);

    useEffect(() => {
        void loadAssignments();
    }, [loadAssignments]);

    useEffect(() => {
        if (selectedAssignment) {
            const a = assignments.find(
                (a) => `${a.courseId}-${a.groupId}` === selectedAssignment,
            );
            if (a) void loadStudents(a.groupId);
        }
    }, [selectedAssignment, assignments, loadStudents]);

    useEffect(() => {
        void loadAttendance();
    }, [loadAttendance]);

    return (
        <Box>
            <PageHeader
                title="Davomat"
                actions={[
                    {
                        label: 'Davomat kiritish',
                        onClick: () => setBulkOpen(true),
                        icon: <Add />,
                    },
                ]}
            />

            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Kurs / Guruh"
                            fullWidth
                            size="small"
                            value={selectedAssignment}
                            onChange={(e) => {
                                setSelectedAssignment(e.target.value);
                                setSelectedStudent('');
                            }}
                        >
                            {assignments.map((a) => (
                                <MenuItem
                                    key={`${a.courseId}-${a.groupId}`}
                                    value={`${a.courseId}-${a.groupId}`}
                                >
                                    {a.course.nameUz} — {a.group.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Talaba"
                            fullWidth
                            size="small"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            disabled={!selectedAssignment}
                        >
                            {students.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.lastName} {s.firstName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            {stats && <Box sx={{ mb: 3 }}><AttendanceStatsCard stats={stats} /></Box>}

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
                            ) : !selectedStudent ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Kurs va talabani tanlang
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

            <BulkAttendanceModal
                open={bulkOpen}
                onClose={() => setBulkOpen(false)}
                onSuccess={loadAttendance}
            />
        </Box>
    );
}