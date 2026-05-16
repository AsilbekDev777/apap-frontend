'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress,
    MenuItem, TextField, Avatar,
} from '@mui/material';
import api from '@/lib/api/api';
import { adminApi } from '@/lib/api/admin.api';
import { Semester } from '@/types';
import PageHeader from '@/components/ui/PageHeader';

interface StudentGrade {
    student: {
        id: string;
        firstName: string;
        lastName: string;
        studentNumber: string;
    };
    grades: {
        id: string;
        score: number;
        course: { nameUz: string; code: string };
        gradeType: { nameUz: string };
    }[];
    gpa100: number;
    gpa5: number;
}

const AVATAR_COLORS = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#6366f1)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
];

export default function GroupGradesPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const [data, setData] = useState<StudentGrade[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    const loadSemesters = useCallback(async () => {
        try {
            const sems = await adminApi.getSemesters();
            setSemesters(sems);
            const active = sems.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch { /* silent */ }
    }, []);

    const loadData = useCallback(async () => {
        if (!selectedSemester) return;
        setLoading(true);
        try {
            const { data: result } = await api.get<StudentGrade[]>(
                `/admin/groups/${groupId}/grades`,
                { params: { semesterId: selectedSemester } },
            );
            setData(result);
        } finally { setLoading(false); }
    }, [groupId, selectedSemester]);

    useEffect(() => { void loadSemesters(); }, [loadSemesters]);
    useEffect(() => { void loadData(); }, [loadData]);

    const getGpaColor = (score: number) => {
        if (score >= 86) return '#86efac';
        if (score >= 71) return '#fcd34d';
        if (score >= 56) return '#94a3b8';
        return '#fca5a5';
    };

    const getScoreStyle = (score: number) => {
        if (score >= 86) return { bg: 'rgba(134,239,172,0.12)', color: '#86efac', label: 'A' };
        if (score >= 71) return { bg: 'rgba(252,211,77,0.12)', color: '#fcd34d', label: 'B' };
        if (score >= 56) return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'C' };
        return { bg: 'rgba(252,165,165,0.12)', color: '#fca5a5', label: 'D' };
    };

    return (
        <Box>
            <PageHeader
                title="Guruh baholar"
                subtitle="Barcha talabalar baholari va GPA"
            />

            <Card sx={{ p: 2, mb: 2 }}>
                <TextField
                    select label="Semestr" size="small" sx={{ width: 280 }}
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    {semesters.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name} {s.isActive && '✓'}</MenuItem>
                    ))}
                </TextField>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress sx={{ color: '#6366f1' }} />
                </Box>
            ) : data.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center' }}>
                    <i className="ti ti-users-off" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                    <Typography sx={{ color: '#475569' }}>Ma&apos;lumotlar topilmadi</Typography>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.map((item, idx) => (
                        <Card key={item.student.id}>
                            {/* Student header */}
                            <Box
                                sx={{
                                    px: 2, py: 1.5,
                                    display: 'flex', alignItems: 'center', gap: 2,
                                    borderBottom: expandedStudent === item.student.id ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                                    cursor: 'pointer',
                                    '&:hover': { background: 'rgba(255,255,255,0.02)' },
                                }}
                                onClick={() => setExpandedStudent(
                                    expandedStudent === item.student.id ? null : item.student.id
                                )}
                            >
                                <Avatar sx={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length], width: 34, height: 34, fontSize: 12, fontWeight: 600, color: '#e0e7ff', flexShrink: 0 }}>
                                    {item.student.firstName[0]}{item.student.lastName[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                                        {item.student.lastName} {item.student.firstName}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#64748b' }}>
                                        {item.student.studentNumber}
                                    </Typography>
                                </Box>

                                {/* GPA */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: 10, color: '#475569', mb: 0.3 }}>GPA (100)</Typography>
                                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: getGpaColor(item.gpa100) }}>
                                            {item.gpa100}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'inline-flex', background: `${getGpaColor(item.gpa100)}15`, color: getGpaColor(item.gpa100), fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                        {item.gpa5} / 5
                                    </Box>
                                </Box>

                                <i
                                    className={`ti ${expandedStudent === item.student.id ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                                    style={{ fontSize: 16, color: '#64748b' }}
                                />
                            </Box>

                            {/* Grades table */}
                            {expandedStudent === item.student.id && (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Fan</TableCell>
                                                <TableCell>Baho turi</TableCell>
                                                <TableCell>Ball</TableCell>
                                                <TableCell>Baho</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {item.grades.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                        <Typography sx={{ fontSize: 13, color: '#475569' }}>Baholar topilmadi</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : item.grades.map((grade) => {
                                                const score = Number(grade.score);
                                                const style = getScoreStyle(score);
                                                return (
                                                    <TableRow key={grade.id} sx={{ '&:last-child td': { border: 0 } }}>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0' }}>{grade.course?.nameUz}</Typography>
                                                            <Typography sx={{ fontSize: 10, color: '#475569' }}>{grade.course?.code}</Typography>
                                                        </TableCell>
                                                        <TableCell><Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{grade.gradeType?.nameUz}</Typography></TableCell>
                                                        <TableCell><Typography sx={{ fontSize: 13, fontWeight: 700, color: style.color }}>{score}</Typography></TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'inline-flex', background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, px: 1.5, py: 0.25, borderRadius: '5px' }}>{style.label}</Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}