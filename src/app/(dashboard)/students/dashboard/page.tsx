'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, CircularProgress,
    List, ListItem, ListItemText, Grid, Divider, Alert,
} from '@mui/material';
import api from '@/lib/api/api';
import { useAuthStore } from '@/store/auth.store';
import { adminApi } from '@/lib/api/admin.api';
import { gradesApi } from '@/lib/api/grades.api';
import { Semester } from '@/types';

interface StudentProfile {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    group: { name: string; faculty: { nameUz: string } };
}

interface GradeItem {
    id: string;
    score: number;
    course: { nameUz: string; code: string };
    gradeType: { nameUz: string };
}

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [recentGrades, setRecentGrades] = useState<GradeItem[]>([]);
    const [gpa, setGpa] = useState<{ gpa100: number; gpa5: number } | null>(null);
    const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: students } = await api.get('/students', { params: { limit: 1 } });
            const studentData = students.data?.[0] as StudentProfile | undefined;
            if (!studentData) return;
            setProfile(studentData);

            const semesters = await adminApi.getSemesters();
            const active = semesters.find((s) => s.isActive);
            if (active) {
                setActiveSemester(active);
                const [gpaData, grades] = await Promise.all([
                    gradesApi.getGpa(studentData.id, active.id),
                    gradesApi.getAll({ studentId: studentData.id, semesterId: active.id }),
                ]);
                setGpa(gpaData);
                setRecentGrades(grades.slice(0, 5) as GradeItem[]);
            }
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { void load(); }, [load]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#6366f1' }} /></Box>;
    if (!profile) return <Alert severity="warning" sx={{ background: 'rgba(245,158,11,0.1)', color: '#fcd34d' }}>Talaba profili topilmadi.</Alert>;

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
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>
                    Xush kelibsiz, {profile.firstName}!
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>
                    {profile.group?.name} · {profile.group?.faculty?.nameUz}
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Profile */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <i className="ti ti-user" style={{ fontSize: 16, color: '#6366f1' }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Profil</Typography>
                            </Box>
                            {[
                                { label: 'Ism Familya', value: `${profile.lastName} ${profile.firstName}` },
                                { label: 'Talaba raqami', value: profile.studentNumber },
                                { label: 'Guruh', value: profile.group?.name },
                                { label: 'Fakultet', value: profile.group?.faculty?.nameUz },
                            ].map((item) => (
                                <Box key={item.label} sx={{ mb: 1.5 }}>
                                    <Typography sx={{ fontSize: 10, color: '#475569', mb: 0.3 }}>{item.label}</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{item.value}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* GPA */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', background: gpa ? `rgba(${gpa.gpa100 >= 86 ? '134,239,172' : gpa.gpa100 >= 71 ? '252,211,77' : '252,165,165'},0.05)` : 'rgba(255,255,255,0.03)' }}>
                        <CardContent sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <i className="ti ti-certificate" style={{ fontSize: 16, color: '#6366f1' }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Semestr GPA</Typography>
                            </Box>
                            {gpa ? (
                                <>
                                    <Typography sx={{ fontSize: 48, fontWeight: 700, color: getGpaColor(gpa.gpa100), lineHeight: 1 }}>
                                        {gpa.gpa100}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#64748b', mt: 0.5, mb: 1.5 }}>100 ballik tizim</Typography>
                                    <Box sx={{ display: 'inline-flex', background: `${getGpaColor(gpa.gpa100)}20`, color: getGpaColor(gpa.gpa100), fontSize: 13, fontWeight: 700, px: 2, py: 0.75, borderRadius: '8px' }}>
                                        {gpa.gpa5} / 5 ball
                                    </Box>
                                </>
                            ) : (
                                <Typography sx={{ color: '#475569', fontSize: 13 }}>Baholar mavjud emas</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Semester */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <i className="ti ti-calendar" style={{ fontSize: 16, color: '#6366f1' }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Faol semestr</Typography>
                            </Box>
                            {activeSemester ? (
                                <>
                                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', mb: 1 }}>{activeSemester.name}</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1.5 }}>
                                        {new Date(activeSemester.startDate).toLocaleDateString('uz')} — {new Date(activeSemester.endDate).toLocaleDateString('uz')}
                                    </Typography>
                                    <Box sx={{ display: 'inline-flex', background: 'rgba(134,239,172,0.12)', color: '#86efac', fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                        Faol
                                    </Box>
                                </>
                            ) : (
                                <Typography sx={{ color: '#475569', fontSize: 13 }}>Faol semestr topilmadi</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', mb: 2 }}>
                So&apos;nggi baholar
            </Typography>
            <Card>
                {recentGrades.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <i className="ti ti-certificate-off" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                        <Typography sx={{ color: '#475569', fontSize: 14 }}>Baholar mavjud emas</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {recentGrades.map((grade, idx) => {
                            const score = Number(grade.score);
                            const style = getScoreStyle(score);
                            return (
                                <Box key={grade.id}>
                                    <ListItem sx={{ py: 1.5, px: 2 }}>
                                        <ListItemText
                                            primary={grade.course?.nameUz}
                                            secondary={grade.gradeType?.nameUz}
                                            slotProps={{
                                                primary: { style: { fontSize: 13, color: '#e2e8f0', fontWeight: 500 } },
                                                secondary: { style: { fontSize: 11, color: '#64748b' } },
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: 18, fontWeight: 700, color: style.color }}>{score}</Typography>
                                            <Box sx={{ display: 'inline-flex', background: style.bg, color: style.color, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '6px' }}>{style.label}</Box>
                                        </Box>
                                    </ListItem>
                                    {idx < recentGrades.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', mx: 2 }} />}
                                </Box>
                            );
                        })}
                    </List>
                )}
            </Card>
        </Box>
    );
}