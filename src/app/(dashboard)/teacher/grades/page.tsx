'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress,
    MenuItem, TextField, IconButton, Tooltip,Grid
} from '@mui/material';
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
    course: { id: string; nameUz: string; code: string };
    group: { id: string; name: string };
    semester: { id: string; name: string; isActive: boolean };
}

interface StudentItem {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
}

export default function TeacherGradesPage() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [students, setStudents] = useState<StudentItem[]>([]);
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
                api.get<TeacherAssignment[]>('/admin/teacher-assignments', { params: { teacherUserId: user.id } }),
                api.get<Semester[]>('/admin/semesters'),
            ]);
            setAssignments(a.data);
            setSemesters(sem.data);
            const active = sem.data.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch { /* silent */ }
    }, [user]);

    const loadStudents = useCallback(async (groupId: string) => {
        try {
            const { data } = await api.get('/students', { params: { groupId, limit: 100 } });
            setStudents(data.data);
        } catch { /* silent */ }
    }, []);

    const loadGrades = useCallback(async () => {
        if (!selectedStudent || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await gradesApi.getAll({ studentId: selectedStudent, semesterId: selectedSemester });
            setGrades(data);
        } finally { setLoading(false); }
    }, [selectedStudent, selectedSemester]);

    useEffect(() => { void loadData(); }, [loadData]);
    useEffect(() => {
        if (selectedAssignment) {
            const a = assignments.find((a) => `${a.courseId}-${a.groupId}` === selectedAssignment);
            if (a) void loadStudents(a.groupId);
        }
    }, [selectedAssignment, assignments, loadStudents]);
    useEffect(() => { void loadGrades(); }, [loadGrades]);

    const getScoreStyle = (score: number) => {
        if (score >= 86) return { bg: 'rgba(134,239,172,0.12)', color: '#86efac', label: 'A' };
        if (score >= 71) return { bg: 'rgba(252,211,77,0.12)', color: '#fcd34d', label: 'B' };
        if (score >= 56) return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'C' };
        return { bg: 'rgba(252,165,165,0.12)', color: '#fca5a5', label: 'D' };
    };

    return (
        <Box>
            <PageHeader
                title="Baholar"
                actions={[{ label: 'Baho kiritish', onClick: () => setCreateOpen(true), icon: 'ti-plus' }]}
            />

            <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField select label="Kurs / Guruh" fullWidth size="small" value={selectedAssignment}
                                   onChange={(e) => setSelectedAssignment(e.target.value)}>
                            {assignments.map((a) => (
                                <MenuItem key={`${a.courseId}-${a.groupId}`} value={`${a.courseId}-${a.groupId}`}>
                                    {a.course.nameUz} — {a.group.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField select label="Talaba" fullWidth size="small" value={selectedStudent}
                                   disabled={!selectedAssignment}
                                   onChange={(e) => setSelectedStudent(e.target.value)}>
                            {students.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.lastName} {s.firstName}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField select label="Semestr" fullWidth size="small" value={selectedSemester}
                                   onChange={(e) => setSelectedSemester(e.target.value)}>
                            {semesters.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name} {s.isActive && '✓'}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Card>

            {selectedStudent && selectedSemester && (
                <Box sx={{ mb: 2 }}>
                    <GpaCard studentId={selectedStudent} semesterId={selectedSemester} />
                </Box>
            )}

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fan</TableCell>
                                <TableCell>Baho turi</TableCell>
                                <TableCell>Ball</TableCell>
                                <TableCell>Baho</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : !selectedStudent ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <i className="ti ti-user-search" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                    <Typography sx={{ color: '#475569', fontSize: 14 }}>Kurs va talabani tanlang</Typography>
                                </TableCell></TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569' }}>Baholar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : grades.map((grade) => {
                                const score = Number(grade.score);
                                const style = getScoreStyle(score);
                                return (
                                    <TableRow key={grade.id} sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{grade.course?.nameUz ?? '—'}</Typography>
                                            <Typography sx={{ fontSize: 11, color: '#475569' }}>{grade.course?.code}</Typography>
                                        </TableCell>
                                        <TableCell><Typography sx={{ fontSize: 13, color: '#e2e8f0' }}>{grade.gradeType?.nameUz ?? '—'}</Typography></TableCell>
                                        <TableCell><Typography sx={{ fontSize: 14, fontWeight: 700, color: style.color }}>{score}</Typography></TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'inline-flex', background: style.bg, color: style.color, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '6px' }}>{style.label}</Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Tahrirlash">
                                                <IconButton size="small" sx={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', '&:hover': { background: 'rgba(99,102,241,0.2)' } }}>
                                                    <i className="ti ti-edit" style={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <CreateGradeModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={loadGrades}
                              prefilledStudentId={selectedStudent} prefilledSemesterId={selectedSemester} />
        </Box>
    );
}