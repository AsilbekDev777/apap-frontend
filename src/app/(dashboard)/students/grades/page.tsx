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
import { gradesApi } from '@/lib/api/grades.api';
import { adminApi } from '@/lib/api/admin.api';
import api from '@/lib/api/api';
import { Grade, Semester } from '@/types';
import GpaCard from '@/components/grades/GpaCard';
import PageHeader from '@/components/ui/PageHeader';

export default function StudentGradesPage() {
    const { user } = useAuthStore();
    const [studentId, setStudentId] = useState('');
    const [grades, setGrades] = useState<Grade[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState('');
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

    const loadSemesters = useCallback(async () => {
        try {
            const data = await adminApi.getSemesters();
            setSemesters(data);
            const active = data.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch {
            // silent
        }
    }, []);

    const loadGrades = useCallback(async () => {
        if (!studentId || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await gradesApi.getAll({
                studentId,
                semesterId: selectedSemester,
            });
            setGrades(data);
        } finally {
            setLoading(false);
        }
    }, [studentId, selectedSemester]);

    useEffect(() => {
        void loadProfile();
        void loadSemesters();
    }, [loadProfile, loadSemesters]);

    useEffect(() => {
        void loadGrades();
    }, [loadGrades]);

    return (
        <Box>
            <PageHeader title="Baholarim" />

            <Card sx={{ p: 2, mb: 3 }}>
                <TextField
                    select
                    label="Semestr"
                    size="small"
                    sx={{ width: 300 }}
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    {semesters.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name} {s.isActive && '✓'}
                        </MenuItem>
                    ))}
                </TextField>
            </Card>

            {studentId && selectedSemester && (
                <Box sx={{ mb: 3 }}>
                    <GpaCard studentId={studentId} semesterId={selectedSemester} />
                </Box>
            )}

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Fan</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Baho turi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ball</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Baho</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
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
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {grade.course?.nameUz}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {grade.course?.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{grade.gradeType?.nameUz}</TableCell>
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
                                                        score >= 86 ? 'A' : score >= 71 ? 'B' : score >= 56 ? 'C' : 'D'
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
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}