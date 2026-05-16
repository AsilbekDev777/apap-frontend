'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress,
    MenuItem, TextField, Avatar, LinearProgress, Collapse,
} from '@mui/material';
import api from '@/lib/api/api';
import { adminApi } from '@/lib/api/admin.api';
import { Course } from '@/types';
import PageHeader from '@/components/ui/PageHeader';

interface StudentAttendance {
    student: {
        id: string;
        firstName: string;
        lastName: string;
        studentNumber: string;
    };
    stats: {
        total: number;
        present: number;
        late: number;
        absent: number;
        percentage: number;
        warning: boolean;
    };
    records: {
        id: string;
        lessonDate: string;
        status: 'present' | 'late' | 'absent';
    }[];
}

const STATUS_CONFIG = {
    present: { label: 'Keldi', bg: 'rgba(134,239,172,0.12)', color: '#86efac' },
    late: { label: 'Kech', bg: 'rgba(252,211,77,0.12)', color: '#fcd34d' },
    absent: { label: 'Kelmadi', bg: 'rgba(252,165,165,0.12)', color: '#fca5a5' },
};

const AVATAR_COLORS = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#6366f1)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
];

export default function GroupAttendancePage() {
    const { groupId } = useParams<{ groupId: string }>();
    const [data, setData] = useState<StudentAttendance[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    const loadCourses = useCallback(async () => {
        try { setCourses(await adminApi.getCourses()); }
        catch { /* silent */ }
    }, []);

    const loadData = useCallback(async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const { data: result } = await api.get<StudentAttendance[]>(
                `/admin/groups/${groupId}/attendance`,
                { params: { courseId: selectedCourse } },
            );
            setData(result);
        } finally { setLoading(false); }
    }, [groupId, selectedCourse]);

    useEffect(() => { void loadCourses(); }, [loadCourses]);
    useEffect(() => { void loadData(); }, [loadData]);

    const getBarColor = (pct: number) => {
        if (pct >= 90) return { bar: 'linear-gradient(90deg,#6366f1,#818cf8)', text: '#a5b4fc' };
        if (pct >= 75) return { bar: 'linear-gradient(90deg,#10b981,#34d399)', text: '#86efac' };
        if (pct >= 60) return { bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)', text: '#fcd34d' };
        return { bar: 'linear-gradient(90deg,#ef4444,#f87171)', text: '#fca5a5' };
    };

    return (
        <Box>
            <PageHeader
                title="Guruh davomat"
                subtitle="Barcha talabalar davomati"
            />

            <Card sx={{ p: 2, mb: 2 }}>
                <TextField
                    select label="Kurs" size="small" sx={{ width: 280 }}
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.nameUz}</MenuItem>
                    ))}
                </TextField>
            </Card>

            {!selectedCourse ? (
                <Card sx={{ p: 6, textAlign: 'center' }}>
                    <i className="ti ti-calendar-search" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                    <Typography sx={{ color: '#475569' }}>Kursni tanlang</Typography>
                </Card>
            ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress sx={{ color: '#6366f1' }} />
                </Box>
            ) : data.length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center' }}>
                    <Typography sx={{ color: '#475569' }}>Ma&apos;lumotlar topilmadi</Typography>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.map((item, idx) => {
                        const barColor = getBarColor(item.stats.percentage);
                        return (
                            <Card key={item.student.id}>
                                {/* Student header */}
                                <Box
                                    sx={{
                                        px: 2, py: 1.5,
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        cursor: 'pointer',
                                        borderBottom: expandedStudent === item.student.id ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
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

                                    {/* Stats */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                            {[
                                                { label: 'Keldi', value: item.stats.present, color: '#86efac' },
                                                { label: 'Kech', value: item.stats.late, color: '#fcd34d' },
                                                { label: 'Kelmadi', value: item.stats.absent, color: '#fca5a5' },
                                            ].map((s) => (
                                                <Box key={s.label} sx={{ textAlign: 'center' }}>
                                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</Typography>
                                                    <Typography sx={{ fontSize: 9, color: '#475569' }}>{s.label}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        <Box sx={{ width: 80 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography sx={{ fontSize: 10, color: '#64748b' }}>Foiz</Typography>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: barColor.text }}>{item.stats.percentage}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={item.stats.percentage}
                                                sx={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { background: barColor.bar, borderRadius: 2 } }}
                                            />
                                        </Box>
                                        {item.stats.warning && (
                                            <Box sx={{ display: 'inline-flex', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: 10, fontWeight: 500, px: 1, py: 0.25, borderRadius: '5px' }}>
                                                75% ↓
                                            </Box>
                                        )}
                                    </Box>

                                    <i
                                        className={`ti ${expandedStudent === item.student.id ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                                        style={{ fontSize: 16, color: '#64748b' }}
                                    />
                                </Box>

                                {/* Records */}
                                <Collapse in={expandedStudent === item.student.id}>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Sana</TableCell>
                                                    <TableCell>Holat</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {item.records.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                                            <Typography sx={{ fontSize: 13, color: '#475569' }}>Davomat topilmadi</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : item.records.map((record) => {
                                                    const cfg = STATUS_CONFIG[record.status];
                                                    return (
                                                        <TableRow key={record.id} sx={{ '&:last-child td': { border: 0 } }}>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: 12, color: '#e2e8f0' }}>
                                                                    {new Date(record.lessonDate).toLocaleDateString('uz')}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'inline-flex', background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 500, px: 1.5, py: 0.25, borderRadius: '5px' }}>
                                                                    {cfg.label}
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Collapse>
                            </Card>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}