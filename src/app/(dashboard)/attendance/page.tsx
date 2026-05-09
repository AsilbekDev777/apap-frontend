'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    TextField,
    Chip,
    CircularProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import { attendanceApi } from '@/lib/api/attendance.api';
import { adminApi } from '@/lib/api/admin.api';
import { studentsApi } from '@/lib/api/students.api';
import { Attendance, Student, Course } from '@/types';
import BulkAttendanceModal from '@/components/attendance/BulkAttendanceModal';
import AttendanceStatsCard from '@/components/attendance/AttendanceStatsCard';
import { AttendanceStats } from '@/lib/api/attendance.api';

const STATUS_CONFIG = {
    present: { label: 'Keldi', color: 'success' as const },
    late: { label: 'Kech', color: 'warning' as const },
    absent: { label: 'Kelmadi', color: 'error' as const },
};

export default function AttendancePage() {
    const [records, setRecords] = useState<Attendance[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);

    const loadSelects = useCallback(async () => {
        try {
            const [s, c] = await Promise.all([
                studentsApi.getAll({ limit: 100 }),
                adminApi.getCourses(),
            ]);
            setStudents(s.data);
            setCourses(c);
        } catch {
            // silent
        }
    }, []);

    const loadAttendance = useCallback(async () => {
        if (!selectedStudent || !selectedCourse) return;
        setLoading(true);
        try {
            const data = await attendanceApi.getAll({
                studentId: selectedStudent,
                courseId: selectedCourse,
            });
            setRecords(data.records);
            setStats(data.stats);
        } finally {
            setLoading(false);
        }
    }, [selectedStudent, selectedCourse]);

    useEffect(() => {
        void loadSelects();
    }, [loadSelects]);

    useEffect(() => {
        void loadAttendance();
    }, [loadAttendance]);

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Davomat
                </Typography>
                <Button
                    startIcon={<Add />}
                    variant="contained"
                    onClick={() => setBulkOpen(true)}
                >
                    Davomat kiritish
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Talaba"
                            fullWidth
                            size="small"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                        >
                            {students.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.lastName} {s.firstName} — {s.studentNumber}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Kurs"
                            fullWidth
                            size="small"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {courses.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.nameUz}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            {/* Stats */}
            {stats && selectedStudent && selectedCourse && (
                <Box sx={{ mb: 3 }}>
                    <AttendanceStatsCard stats={stats} />
                </Box>
            )}

            {/* Table */}
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
                            ) : !selectedStudent || !selectedCourse ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Talaba va kursni tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Davomat ma`lumotlari topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => {
                                    const config = STATUS_CONFIG[record.status];
                                    return (
                                        <TableRow
                                            key={record.id}
                                            hover
                                            sx={{ '&:last-child td': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(record.lessonDate).toLocaleDateString('uz')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={config.label}
                                                    color={config.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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