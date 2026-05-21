'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, CircularProgress,
    List, ListItem, ListItemText, Divider, Alert, Avatar,Grid
} from '@mui/material';
import api from '@/lib/api/api';
import { useAuthStore } from '@/store/auth.store';
import { adminApi } from '@/lib/api/admin.api';
import { gradesApi } from '@/lib/api/grades.api';

interface ChildProfile {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    group: { name: string; faculty: { nameUz: string } };
}

interface GradeItem {
    id: string;
    score: number;
    course: { nameUz: string };
    gradeType: { nameUz: string };
}

interface ChildData {
    profile: ChildProfile;
    gpa: { gpa100: number; gpa5: number } | null;
    recentGrades: GradeItem[];
}

const AVATAR_COLORS = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#6366f1)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
];

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const [children, setChildren] = useState<ChildData[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: studentLinks } = await api.get<{ student: ChildProfile }[]>('/parent/children');
            const semesters = await adminApi.getSemesters();
            const active = semesters.find((s) => s.isActive);

            const childrenData: ChildData[] = await Promise.all(
                studentLinks.map(async (link) => {
                    const profile = link.student;
                    let gpa = null;
                    let recentGrades: GradeItem[] = [];
                    if (active) {
                        try {
                            gpa = await gradesApi.getGpa(profile.id, active.id);
                            const grades = await gradesApi.getAll({ studentId: profile.id, semesterId: active.id });
                            recentGrades = grades.slice(0, 3) as GradeItem[];
                        } catch { /* silent */ }
                    }
                    return { profile, gpa, recentGrades };
                }),
            );
            setChildren(childrenData);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { void load(); }, [load]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#6366f1' }} /></Box>;

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
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>Farzandlar</Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>Akademik ko&apos;rsatkichlar</Typography>
            </Box>

            {children.length === 0 ? (
                <Alert severity="info" sx={{ background: 'rgba(6,182,212,0.1)', color: '#67e8f9', border: '0.5px solid rgba(6,182,212,0.2)' }}>
                    Farzand biriktirilmagan. Administrator bilan bog&apos;laning.
                </Alert>
            ) : children.map((child, cidx) => (
                <Box key={child.profile.id} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ background: AVATAR_COLORS[cidx % AVATAR_COLORS.length], width: 44, height: 44, fontSize: 16, fontWeight: 600, color: '#e0e7ff' }}>
                            {child.profile.firstName[0]}{child.profile.lastName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
                                {child.profile.lastName} {child.profile.firstName}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                                {child.profile.group?.name} · {child.profile.group?.faculty?.nameUz}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'inline-flex', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontSize: 12, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                            {child.profile.studentNumber}
                        </Box>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{ p: 2, background: child.gpa ? `rgba(${child.gpa.gpa100 >= 86 ? '134,239,172' : '252,211,77'},0.05)` : 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 11, color: '#64748b', mb: 1 }}>Semestr GPA</Typography>
                                {child.gpa ? (
                                    <>
                                        <Typography sx={{ fontSize: 36, fontWeight: 700, color: getGpaColor(child.gpa.gpa100), lineHeight: 1 }}>{child.gpa.gpa100}</Typography>
                                        <Box sx={{ display: 'inline-flex', mt: 1, background: `${getGpaColor(child.gpa.gpa100)}20`, color: getGpaColor(child.gpa.gpa100), fontSize: 12, fontWeight: 600, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                            {child.gpa.gpa5} / 5
                                        </Box>
                                    </>
                                ) : (
                                    <Typography sx={{ color: '#475569', fontSize: 13 }}>Ma&apos;lumot yo&apos;q</Typography>
                                )}
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <Card>
                                <Box sx={{ px: 2, py: 1.5, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>So&apos;nggi baholar</Typography>
                                </Box>
                                {child.recentGrades.length === 0 ? (
                                    <Box sx={{ p: 2 }}><Typography sx={{ fontSize: 13, color: '#475569' }}>Baholar mavjud emas</Typography></Box>
                                ) : (
                                    <List disablePadding dense>
                                        {child.recentGrades.map((grade, idx) => {
                                            const score = Number(grade.score);
                                            const style = getScoreStyle(score);
                                            return (
                                                <Box key={grade.id}>
                                                    <ListItem sx={{ py: 1, px: 2 }}>
                                                        <ListItemText
                                                            primary={grade.course?.nameUz}
                                                            secondary={grade.gradeType?.nameUz}
                                                            slotProps={{
                                                                primary: { style: { fontSize: 12, color: '#e2e8f0', fontWeight: 500 } },
                                                                secondary: { style: { fontSize: 11, color: '#64748b' } },
                                                            }}
                                                        />
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: style.color }}>{score}</Typography>
                                                            <Box sx={{ display: 'inline-flex', background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, px: 1, py: 0.25, borderRadius: '5px' }}>{style.label}</Box>
                                                        </Box>
                                                    </ListItem>
                                                    {idx < child.recentGrades.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', mx: 2 }} />}
                                                </Box>
                                            );
                                        })}
                                    </List>
                                )}
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            ))}
        </Box>
    );
}