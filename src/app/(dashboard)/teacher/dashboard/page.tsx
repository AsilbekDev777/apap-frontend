'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, CircularProgress,
    List, ListItem, ListItemText, Grid, Divider,
} from '@mui/material';
import api from '@/lib/api/api';
import { useAuthStore } from '@/store/auth.store';

interface TeacherAssignment {
    courseId: string;
    groupId: string;
    semesterId: string;
    course: { nameUz: string; code: string };
    group: { name: string };
    semester: { name: string; isActive: boolean };
}

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data } = await api.get<TeacherAssignment[]>('/admin/teacher-assignments', {
                params: { teacherUserId: user.id },
            });
            setAssignments(data);
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { void load(); }, [load]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
    );

    const activeCourses = assignments.filter((a) => a.semester.isActive);
    const uniqueCourses = new Set(assignments.map((a) => a.courseId)).size;
    const uniqueGroups = new Set(assignments.map((a) => a.groupId)).size;

    const stats = [
        { label: 'Faol kurslar', value: activeCourses.length, icon: 'ti-book', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', gradient: 'linear-gradient(90deg,#6366f1,#818cf8)' },
        { label: 'Jami kurslar', value: uniqueCourses, icon: 'ti-certificate', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', gradient: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' },
        { label: 'Guruhlar', value: uniqueGroups, icon: 'ti-users', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', gradient: 'linear-gradient(90deg,#06b6d4,#22d3ee)' },
        { label: 'Tayinlashlar', value: assignments.length, icon: 'ti-calendar-check', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', gradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>
                    Xush kelibsiz!
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>
                    {user?.email}
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {stats.map((s) => (
                    <Grid key={s.label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ p: '14px !important' }}>
                                <Box sx={{ height: 2, borderRadius: 1, background: s.gradient, mb: 1.5, mx: -1.75, mt: -1.75 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }} />
                                    </Box>
                                </Box>
                                <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9' }}>{s.value}</Typography>
                                <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 0.3 }}>{s.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', mb: 2 }}>
                Faol semestr kurslari
            </Typography>

            <Card>
                {activeCourses.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <i className="ti ti-book-off" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                        <Typography sx={{ color: '#475569', fontSize: 14 }}>
                            Faol semestrada kurslar topilmadi
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {activeCourses.map((a, idx) => (
                            <Box key={`${a.courseId}-${a.groupId}`}>
                                <ListItem sx={{ py: 2, px: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, flexShrink: 0 }}>
                                        <i className="ti ti-book" style={{ fontSize: 18, color: '#a5b4fc' }} />
                                    </Box>
                                    <ListItemText
                                        primary={a.course.nameUz}
                                        secondary={a.semester.name}
                                        slotProps={{
                                            primary: { style: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' } },
                                            secondary: { style: { fontSize: 11, color: '#64748b' } },
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box sx={{ display: 'inline-flex', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontSize: 11, fontWeight: 600, px: 1.5, py: 0.5, borderRadius: '6px', border: '0.5px solid rgba(99,102,241,0.2)' }}>
                                            {a.course.code}
                                        </Box>
                                        <Box sx={{ display: 'inline-flex', background: 'rgba(16,185,129,0.12)', color: '#86efac', fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                            {a.group.name}
                                        </Box>
                                    </Box>
                                </ListItem>
                                {idx < activeCourses.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                            </Box>
                        ))}
                    </List>
                )}
            </Card>
        </Box>
    );
}