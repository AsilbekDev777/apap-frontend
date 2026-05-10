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
    IconButton,
    Tooltip,
    Grid,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import { gradesApi } from '@/lib/api/grades.api';
import api from '@/lib/api/api';
import { Grade, Semester } from '@/types';
import CreateGradeModal from '@/components/grades/CreateGradeModal';
import GpaCard from '@/components/grades/GpaCard';
import PageHeader from '@/components/ui/PageHeader';

interface TeacherAssignment {
    courseId: string;
    groupId: string;
    semesterId: string;
    course: { id: string; nameUz: string; code: string };
    group: { id: string; name: string };
    semester: { id: string; name: string; isActive: boolean };
}

interface StudentWithGroup {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
}

export default function TeacherGradesPage() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [students, setStudents] = useState<StudentWithGroup[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const [a, sem] = await Promise.all([
                api.get<TeacherAssignment[]>('/admin/teacher-assignments', {
                    params: { teacherUserId: user.id },
                }),
                api.get<Semester[]>('/admin/semesters'),
            ]);
            setAssignments(a.data);
            setSemesters(sem.data);
            const active = sem.data.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
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
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (selectedAssignment) {
            const a = assignments.find(
                (a) => `${a.courseId}-${a.groupId}` === selectedAssignment,
            );
            if (a) void loadStudents(a.groupId);
        }
    }, [selectedAssignment, assignments, loadStudents]);

    useEffect(() => {
        void loadGrades();
    }, [loadGrades]);

    return (
        <Box>
            <PageHeader
                title="Baholar"
                actions={[
                    {
                        label: 'Baho kiritish',
                        onClick: () => setCreateOpen(true),
                        icon: <Add />,
                    },
                ]}
            />

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            select
                            label="Kurs / Guruh"
                            fullWidth
                            size="small"
                            value={selectedAssignment}
                            onChange={(e) => setSelectedAssignment(e.target.value)}
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
                    <Grid size={{ xs: 12, sm: 4 }}>
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
                    <Grid size={{ xs: 12, sm: 4 }}>
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

            {/* GPA */}
            {selectedStudent && selectedSemester && (
                <Box sx={{ mb: 3 }}>
                    <GpaCard studentId={selectedStudent} semesterId={selectedSemester} />
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
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : !selectedStudent ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Kurs va talabani tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Baholar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                grades.map((grade) => {
                                    const score = Number(grade.score);
                                    return (
                                        <TableRow key={grade.id} hover>
                                            <TableCell>{grade.course?.nameUz ?? '—'}</TableCell>
                                            <TableCell>{grade.gradeType?.nameUz ?? '—'}</TableCell>
                                            <TableCell>
                                                <Typography
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
                                                    size="small"
                                                    color={
                                                        score >= 86
                                                            ? 'success'
                                                            : score >= 71
                                                                ? 'warning'
                                                                : score >= 56
                                                                    ? 'default'
                                                                    : 'error'
                                                    }
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