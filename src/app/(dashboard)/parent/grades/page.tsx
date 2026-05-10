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
        } catch {
            // silent
        }
    }, []);

    const loadGrades = useCallback(async () => {
        if (!selectedChild || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await gradesApi.getAll({
                studentId: selectedChild,
                semesterId: selectedSemester,
            });
            setGrades(data);
        } finally {
            setLoading(false);
        }
    }, [selectedChild, selectedSemester]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        void loadGrades();
    }, [loadGrades]);

    return (
        <Box>
            <PageHeader title="Farzand baholar" />

            <Card sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        label="Farzand"
                        size="small"
                        sx={{ width: 250 }}
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                    >
                        {children.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.lastName} {c.firstName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Semestr"
                        size="small"
                        sx={{ width: 250 }}
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                        {semesters.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name} {s.isActive && '✓'}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Card>

            {selectedChild && selectedSemester && (
                <Box sx={{ mb: 3 }}>
                    <GpaCard studentId={selectedChild} semesterId={selectedSemester} />
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
                            ) : !selectedChild ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Farzandni tanlang
                                        </Typography>
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