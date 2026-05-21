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
    LinearProgress,
    Grid
} from '@mui/material';
import { attendanceApi, AttendanceStats } from '@/lib/api/attendance.api';
import { adminApi } from '@/lib/api/admin.api';
import { studentsApi } from '@/lib/api/students.api';
import { Attendance, Course, Student } from '@/types';
import BulkAttendanceModal from '@/components/attendance/BulkAttendanceModal';
import PageHeader from '@/components/ui/PageHeader';

const STATUS_CONFIG = {
    present: { label: 'Keldi', bg: 'rgba(134,239,172,0.12)', color: '#86efac' },
    late: { label: 'Kech', bg: 'rgba(252,211,77,0.12)', color: '#fcd34d' },
    absent: { label: 'Kelmadi', bg: 'rgba(252,165,165,0.12)', color: '#fca5a5' },
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
        } catch { /* silent */ }
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

    useEffect(() => { void loadSelects(); }, [loadSelects]);
    useEffect(() => { void loadAttendance(); }, [loadAttendance]);

    const getBarColor = (pct: number) => {
        if (pct >= 90) return { bar: 'linear-gradient(90deg,#6366f1,#818cf8)', text: '#a5b4fc' };
        if (pct >= 75) return { bar: 'linear-gradient(90deg,#10b981,#34d399)', text: '#86efac' };
        if (pct >= 60) return { bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)', text: '#fcd34d' };
        return { bar: 'linear-gradient(90deg,#ef4444,#f87171)', text: '#fca5a5' };
    };

    return (
        <Box>
            <PageHeader
                title="Davomat"
                subtitle="Talabalar davomati va statistika"
                actions={[{ label: 'Davomat kiritish', onClick: () => setBulkOpen(true), icon: 'ti-plus' }]}
            />

            <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select label="Talaba" fullWidth size="small"
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
                            select label="Kurs" fullWidth size="small"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {courses.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.nameUz}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            {stats && selectedStudent && selectedCourse && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[
                        { label: 'Keldi', value: stats.present, color: '#86efac', bg: 'rgba(134,239,172,0.08)', icon: 'ti-circle-check' },
                        { label: 'Kech', value: stats.late, color: '#fcd34d', bg: 'rgba(252,211,77,0.08)', icon: 'ti-clock' },
                        { label: 'Kelmadi', value: stats.absent, color: '#fca5a5', bg: 'rgba(252,165,165,0.08)', icon: 'ti-circle-x' },
                        { label: 'Jami', value: stats.total, color: '#a5b4fc', bg: 'rgba(165,180,252,0.08)', icon: 'ti-calendar' },
                    ].map((item) => (
                        <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
                            <Card sx={{ p: 2, background: item.bg, border: `0.5px solid ${item.color}20` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: item.color }} />
                                    <Typography sx={{ fontSize: 11, color: '#64748b' }}>{item.label}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 24, fontWeight: 700, color: item.color }}>
                                    {item.value}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}

                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontSize: 13, color: '#cbd5e1' }}>Davomat foizi</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: getBarColor(stats.percentage).text }}>
                                    {stats.percentage}%
                                    {stats.warning && (
                                        <Chip
                                            label="75% dan past!"
                                            size="small"
                                            sx={{ ml: 1, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: 10 }}
                                        />
                                    )}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={stats.percentage}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    background: 'rgba(255,255,255,0.06)',
                                    '& .MuiLinearProgress-bar': {
                                        background: getBarColor(stats.percentage).bar,
                                        borderRadius: 4,
                                    },
                                }}
                            />
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sana</TableCell>
                                <TableCell>Holat</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : !selectedStudent || !selectedCourse ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                                        <i className="ti ti-calendar-search" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                        <Typography sx={{ color: '#475569', fontSize: 14 }}>
                                            Talaba va kursni tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                                        <Typography sx={{ color: '#475569', fontSize: 14 }}>
                                            Davomat ma&apos;lumotlari topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => {
                                    const cfg = STATUS_CONFIG[record.status];
                                    return (
                                        <TableRow key={record.id} sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 13, color: '#e2e8f0' }}>
                                                    {new Date(record.lessonDate).toLocaleDateString('uz')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'inline-flex', background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                                    {cfg.label}
                                                </Box>
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