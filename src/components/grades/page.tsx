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
    Grid,
    IconButton,
    Tooltip,
} from '@mui/material';
import { gradesApi } from '@/lib/api/grades.api';
import { adminApi } from '@/lib/api/admin.api';
import { studentsApi } from '@/lib/api/students.api';
import { Grade, Student, Semester } from '@/types';
import CreateGradeModal from '@/components/grades/CreateGradeModal';
import GpaCard from '@/components/grades/GpaCard';
import PageHeader from '@/components/ui/PageHeader';

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
            const active = sem.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch { /* silent */ }
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

    useEffect(() => { void loadSelects(); }, [loadSelects]);
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
                subtitle="Talabalar baholari va GPA"
                actions={[{ label: 'Baho kiritish', onClick: () => setCreateOpen(true), icon: 'ti-plus' }]}
            />

            <Card sx={{ p: 2, mb: 2 }}>
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
                                <TableCell>Og'irlik</TableCell>
                                <TableCell>Ball</TableCell>
                                <TableCell>Baho</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : !selectedStudent ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <i className="ti ti-user-search" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                        <Typography sx={{ color: '#475569', fontSize: 14 }}>
                                            Talabani tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <i className="ti ti-certificate-off" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                        <Typography sx={{ color: '#475569', fontSize: 14 }}>
                                            Baholar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                grades.map((grade) => {
                                    const score = Number(grade.score);
                                    const style = getScoreStyle(score);
                                    return (
                                        <TableRow key={grade.id} sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
                                                    {grade.course?.nameUz ?? '—'}
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: '#475569' }}>
                                                    {grade.course?.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 13, color: '#e2e8f0' }}>
                                                    {grade.gradeType?.nameUz ?? '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                                                    {grade.gradeType?.weightPercent}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: style.color }}>
                                                    {score}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'inline-flex', background: style.bg, color: style.color, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                                    {style.label}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Tahrirlash">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', '&:hover': { background: 'rgba(99,102,241,0.2)' } }}
                                                    >
                                                        <i className="ti ti-edit" style={{ fontSize: 15 }} />
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