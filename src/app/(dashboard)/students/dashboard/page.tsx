'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Alert,
    Grid
} from '@mui/material';
import { Grade, EventAvailable, School } from '@mui/icons-material';
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
            // Student profil
            const { data: students } = await api.get('/students', {
                params: { limit: 1 },
            });

            const studentData = students.data?.[0] as StudentProfile | undefined;
            if (!studentData) return;
            setProfile(studentData);

            // Faol semestr
            const semesters = await adminApi.getSemesters();
            const active = semesters.find((s) => s.isActive);
            if (active) {
                setActiveSemester(active);

                // GPA
                const gpaData = await gradesApi.getGpa(studentData.id, active.id);
                setGpa(gpaData);

                // So'nggi baholar
                const grades = await gradesApi.getAll({
                    studentId: studentData.id,
                    semesterId: active.id,
                });
                setRecentGrades(grades.slice(0, 5) as GradeItem[]);
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void load();
    }, [load]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Alert severity="warning">
                Talaba profili topilmadi. Administrator bilan bog&apos;laning.
            </Alert>
        );
    }

    const getGpaColor = (score: number) => {
        if (score >= 86) return '#27AE60';
        if (score >= 71) return '#F39C12';
        if (score >= 56) return '#E67E22';
        return '#E74C3C';
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Xush kelibsiz, {profile.firstName} {profile.lastName}!
            </Typography>

            {/* Profile + GPA */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Profile card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <School color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Profil
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Ism Familya
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {profile.lastName} {profile.firstName}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Talaba raqami
                                    </Typography>
                                    <Typography variant="body1">
                                        <Chip label={profile.studentNumber} size="small" />
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Guruh
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {profile.group?.name}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Fakultet
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {profile.group?.faculty?.nameUz}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* GPA card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card
                        sx={{
                            height: '100%',
                            background: gpa
                                ? `linear-gradient(135deg, ${getGpaColor(gpa.gpa100)}15, ${getGpaColor(gpa.gpa100)}05)`
                                : 'white',
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Grade color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Semestr GPA
                                </Typography>
                            </Box>
                            {gpa ? (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 700,
                                            color: getGpaColor(gpa.gpa100),
                                        }}
                                    >
                                        {gpa.gpa100}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        100 ballik tizim
                                    </Typography>
                                    <Chip
                                        label={`${gpa.gpa5} / 5 ball`}
                                        sx={{
                                            mt: 1,
                                            bgcolor: getGpaColor(gpa.gpa100),
                                            color: 'white',
                                            fontWeight: 700,
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                    Baholar mavjud emas
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Semester card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <EventAvailable color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Faol semestr
                                </Typography>
                            </Box>
                            {activeSemester ? (
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                        {activeSemester.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(activeSemester.startDate).toLocaleDateString('uz')} —{' '}
                                        {new Date(activeSemester.endDate).toLocaleDateString('uz')}
                                    </Typography>
                                    <Chip
                                        label="Faol"
                                        color="success"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            ) : (
                                <Typography color="text.secondary">
                                    Faol semestr topilmadi
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent grades */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                So&apos;nggi baholar
            </Typography>
            <Card>
                {recentGrades.length === 0 ? (
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">
                            Baholar mavjud emas
                        </Typography>
                    </CardContent>
                ) : (
                    <List disablePadding>
                        {recentGrades.map((grade, idx) => {
                            const score = Number(grade.score);
                            return (
                                <Box key={grade.id}>
                                    <ListItem sx={{ py: 1.5 }}>
                                        <ListItemText
                                            primary={grade.course?.nameUz}
                                            secondary={grade.gradeType?.nameUz}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    color: getGpaColor(score),
                                                    fontSize: 18,
                                                }}
                                            >
                                                {score}
                                            </Typography>
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
                                        </Box>
                                    </ListItem>
                                    {idx < recentGrades.length - 1 && <Divider />}
                                </Box>
                            );
                        })}
                    </List>
                )}
            </Card>
        </Box>
    );
}