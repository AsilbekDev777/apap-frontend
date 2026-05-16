'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress, MenuItem, TextField,
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
        } catch { /* silent */ }
    }, [user]);

    const loadSemesters = useCallback(async () => {
        try {
            const data = await adminApi.getSemesters();
            setSemesters(data);
            const active = data.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch { /* silent */ }
    }, []);

    const loadGrades = useCallback(async () => {
        if (!studentId || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await gradesApi.getAll({ studentId, semesterId: selectedSemester });
            setGrades(data);
        } finally { setLoading(false); }
    }, [studentId, selectedSemester]);

    useEffect(() => { void loadProfile(); void loadSemesters(); }, [loadProfile, loadSemesters]);
    useEffect(() => { void loadGrades(); }, [loadGrades]);

    const getScoreStyle = (score: number) => {
        if (score >= 86) return { bg: 'rgba(134,239,172,0.12)', color: '#86efac', label: 'A' };
        if (score >= 71) return { bg: 'rgba(252,211,77,0.12)', color: '#fcd34d', label: 'B' };
        if (score >= 56) return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'C' };
        return { bg: 'rgba(252,165,165,0.12)', color: '#fca5a5', label: 'D' };
    };

    return (
        <Box>
            <PageHeader title="Baholarim" />
            <Card sx={{ p: 2, mb: 2 }}>
                <TextField select label="Semestr" size="small" sx={{ width: 280 }} value={selectedSemester}
                           onChange={(e) => setSelectedSemester(e.target.value)}>
                    {semesters.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} {s.isActive && '✓'}</MenuItem>)}
                </TextField>
            </Card>

            {studentId && selectedSemester && <Box sx={{ mb: 2 }}><GpaCard studentId={studentId} semesterId={selectedSemester} /></Box>}

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fan</TableCell>
                                <TableCell>Baho turi</TableCell>
                                <TableCell>Ball</TableCell>
                                <TableCell>Baho</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><CircularProgress size={32} sx={{ color: '#6366f1' }} /></TableCell></TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569' }}>Baholar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : grades.map((grade) => {
                                const score = Number(grade.score);
                                const style = getScoreStyle(score);
                                return (
                                    <TableRow key={grade.id} sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{grade.course?.nameUz}</Typography>
                                            <Typography sx={{ fontSize: 11, color: '#475569' }}>{grade.course?.code}</Typography>
                                        </TableCell>
                                        <TableCell><Typography sx={{ fontSize: 13, color: '#e2e8f0' }}>{grade.gradeType?.nameUz}</Typography></TableCell>
                                        <TableCell><Typography sx={{ fontSize: 14, fontWeight: 700, color: style.color }}>{score}</Typography></TableCell>
                                        <TableCell><Box sx={{ display: 'inline-flex', background: style.bg, color: style.color, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '6px' }}>{style.label}</Box></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}