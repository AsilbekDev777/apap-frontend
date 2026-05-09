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
    IconButton,
    Tooltip,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { gradesApi } from '@/lib/api/grades.api';
import { adminApi } from '@/lib/api/admin.api';
import { studentsApi } from '@/lib/api/students.api';
import { Grade, Student, Semester } from '@/types';
import CreateGradeModal from '@/components/grades/CreateGradeModal';
import GpaCard from '@/components/grades/GpaCard';

export default function GradesPage() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const loadSelects = useCallback(async () => {
        try {
            const [s, sem] = await Promise.all([
                studentsApi.getAll({ limit: 100 }),
                adminApi.getSemesters(),
            ]);
            setStudents(s.data);
            setSemesters(sem);

            // Faol semesterni avtomatik tanlash
            const active = sem.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch {
            // silent
        }
    }, []);

    const loadGrades = useCallback(async () => {
        if (!selectedStudent || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await gradesApi.getAll({
                studentId: selectedStudent,
                semesterId: selectedSemester,
            });
            setGrades(data);
        } finally {
            setLoading(false);
        }
    }, [selectedStudent, selectedSemester]);

    useEffect(() => {
        void loadSelects();
    }, [loadSelects]);

    useEffect(() => {
        void loadGrades();
    }, [loadGrades]);

    const getScoreColor = (score: number) => {
        if (score >= 86) return 'success';
        if (score >= 71) return 'warning';
        if (score >= 56) return 'default';
        return 'error';
    };

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
                    Baholar
                </Typography>
                <Button
                    startIcon={<Add />}
                    variant="contained"
                    onClick={() => setCreateOpen(true)}
                >
                    Baho kiritish
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
                            label="Semestr"
                            fullWidth
                            size="small"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            {semesters.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name} {s.isActive && '✓'}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            {/* GPA Card */}
            {selectedStudent && selectedSemester && (
                <Box sx={{ mb: 3 }}>
                    <GpaCard
                        studentId={selectedStudent}
                        semesterId={selectedSemester}
                    />
                </Box>
            )}

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Fan</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Baho turi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Og`irlik</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ball</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Baho</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    Amallar
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : !selectedStudent ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Talabani tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Baholar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                grades.map((grade) => {
                                    const score = Number(grade.score);
                                    return (
                                        <TableRow
                                            key={grade.id}
                                            hover
                                            sx={{ '&:last-child td': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {grade.course?.nameUz ?? '—'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {grade.course?.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {grade.gradeType?.nameUz ?? '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {grade.gradeType?.weightPercent}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color:
                                                            score >= 86
                                                                ? '#27AE60'
                                                                : score >= 71
                                                                    ? '#F39C12'
                                                                    : score >= 56
                                                                        ? '#E67E22'
                                                                        : '#E74C3C',
                                                    }}
                                                >
                                                    {score}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        score >= 86
                                                            ? 'A'
                                                            : score >= 71
                                                                ? 'B'
                                                                : score >= 56
                                                                    ? 'C'
                                                                    : 'D'
                                                    }
                                                    color={getScoreColor(score) as 'success' | 'warning' | 'default' | 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Tahrirlash">
                                                    <IconButton size="small" color="primary">
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <CreateGradeModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={loadGrades}
                prefilledStudentId={selectedStudent}
                prefilledSemesterId={selectedSemester}
            />
        </Box>
    );
}