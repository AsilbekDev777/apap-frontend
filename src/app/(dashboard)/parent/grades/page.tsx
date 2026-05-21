'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress, MenuItem, TextField,
} from '@mui/material';
import { gradesApi } from '@/lib/api/grades.api';
import { adminApi } from '@/lib/api/admin.api';
import api from '@/lib/api/api';
import { Grade, Semester } from '@/types';
import GpaCard from '@/components/grades/GpaCard';
import PageHeader from '@/components/ui/PageHeader';

interface ChildProfile {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
}

export default function ParentGradesPage() {
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [links, sems] = await Promise.all([
                api.get<{ student: ChildProfile }[]>('/parent/children'),
                adminApi.getSemesters(),
            ]);
            setChildren(links.data.map((l) => l.student));
            setSemesters(sems);
            const active = sems.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch { /* silent */ }
    }, []);

    const loadGrades = useCallback(async () => {
        if (!selectedChild || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await gradesApi.getAll({ studentId: selectedChild, semesterId: selectedSemester });
            setGrades(data);
        } finally { setLoading(false); }
    }, [selectedChild, selectedSemester]);

    useEffect(() => { void loadData(); }, [loadData]);
    useEffect(() => { void loadGrades(); }, [loadGrades]);

    const getScoreStyle = (score: number) => {
        if (score >= 86) return { bg: 'rgba(134,239,172,0.12)', color: '#86efac', label: 'A' };
        if (score >= 71) return { bg: 'rgba(252,211,77,0.12)', color: '#fcd34d', label: 'B' };
        if (score >= 56) return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'C' };
        return { bg: 'rgba(252,165,165,0.12)', color: '#fca5a5', label: 'D' };
    };

    return (
        <Box>
            <PageHeader title="Farzand baholar" />
            <Card sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField select label="Farzand" size="small" sx={{ width: 220 }} value={selectedChild}
                               onChange={(e) => setSelectedChild(e.target.value)}>
                        {children.map((c) => <MenuItem key={c.id} value={c.id}>{c.lastName} {c.firstName}</MenuItem>)}
                    </TextField>
                    <TextField select label="Semestr" size="small" sx={{ width: 220 }} value={selectedSemester}
                               onChange={(e) => setSelectedSemester(e.target.value)}>
                        {semesters.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} {s.isActive && '✓'}</MenuItem>)}
                    </TextField>
                </Box>
            </Card>

            {selectedChild && selectedSemester && <Box sx={{ mb: 2 }}><GpaCard studentId={selectedChild} semesterId={selectedSemester} /></Box>}

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
                            ) : !selectedChild ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569', fontSize: 14 }}>Farzandni tanlang</Typography>
                                </TableCell></TableRow>
                            ) : grades.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569' }}>Baholar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : grades.map((grade) => {
                                const score = Number(grade.score);
                                const style = getScoreStyle(score);
                                return (
                                    <TableRow key={grade.id} sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell><Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{grade.course?.nameUz}</Typography></TableCell>
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