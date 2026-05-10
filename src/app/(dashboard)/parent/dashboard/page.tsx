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
    Avatar,
    Grid
} from '@mui/material';
import { Grade, Person } from '@mui/icons-material';
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
    userId: string;
}

interface GradeItem {
    id: string;
    score: number;
    course: { nameUz: string; code: string };
    gradeType: { nameUz: string };
}

interface ChildData {
    profile: ChildProfile;
    gpa: { gpa100: number; gpa5: number } | null;
    recentGrades: GradeItem[];
    attendanceWarning: boolean;
}

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const [children, setChildren] = useState<ChildData[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Ota-onaga biriktirilgan talabalar
            const { data: studentLinks } = await api.get<{ student: ChildProfile }[]>(
                '/parent/children',
            );

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
                            const grades = await gradesApi.getAll({
                                studentId: profile.id,
                                semesterId: active.id,
                            });
                            recentGrades = grades.slice(0, 3) as GradeItem[];
                        } catch {
                            // silent
                        }
                    }

                    return {
                        profile,
                        gpa,
                        recentGrades,
                        attendanceWarning: false,
                    };
                }),
            );

            setChildren(childrenData);
        } catch {
            // silent
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

    const getGpaColor = (score: number) => {
        if (score >= 86) return '#27AE60';
        if (score >= 71) return '#F39C12';
        if (score >= 56) return '#E67E22';
        return '#E74C3C';
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Farzandlar
            </Typography>

            {children.length === 0 ? (
                <Alert severity="info">
                    Farzand biriktirilmagan. Administrator bilan bog&apos;laning.
                </Alert>
            ) : (
                children.map((child) => (
                    <Box key={child.profile.id} sx={{ mb: 4 }}>
                        {/* Child header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'primary.main',
                                    fontSize: 18,
                                }}
                            >
                                {child.profile.firstName[0]}{child.profile.lastName[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {child.profile.lastName} {child.profile.firstName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {child.profile.group?.name} — {child.profile.group?.faculty?.nameUz}
                                </Typography>
                            </Box>
                            <Chip
                                label={child.profile.studentNumber}
                                size="small"
                                variant="outlined"
                                sx={{ ml: 'auto' }}
                            />
                        </Box>

                        <Grid container spacing={2}>
                            {/* GPA */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Card
                                    sx={{
                                        bgcolor: child.gpa
                                            ? `${getGpaColor(child.gpa.gpa100)}10`
                                            : 'white',
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Grade fontSize="small" color="primary" />
                                            <Typography variant="body2" color="text.secondary">
                                                Semestr GPA
                                            </Typography>
                                        </Box>
                                        {child.gpa ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: getGpaColor(child.gpa.gpa100),
                                                    }}
                                                >
                                                    {child.gpa.gpa100}
                                                </Typography>
                                                <Chip
                                                    label={`${child.gpa.gpa5}/5`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getGpaColor(child.gpa.gpa100),
                                                        color: 'white',
                                                        fontWeight: 700,
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Typography color="text.secondary" variant="body2">
                                                Ma&apos;lumot yo&apos;q
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Recent grades */}
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Person fontSize="small" color="primary" />
                                            <Typography variant="body2" color="text.secondary">
                                                So&apos;nggi baholar
                                            </Typography>
                                        </Box>
                                        {child.recentGrades.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Baholar mavjud emas
                                            </Typography>
                                        ) : (
                                            <List disablePadding dense>
                                                {child.recentGrades.map((grade, idx) => {
                                                    const score = Number(grade.score);
                                                    return (
                                                        <Box key={grade.id}>
                                                            <ListItem disablePadding sx={{ py: 0.5 }}>
                                                                <ListItemText
                                                                    primary={grade.course?.nameUz}
                                                                    secondary={grade.gradeType?.nameUz}
                                                                    slotProps={{
                                                                        primary: { style: { fontSize: 13 } },
                                                                        secondary: { style: { fontSize: 11 } },
                                                                    }}
                                                                />
                                                                <Chip
                                                                    label={score}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: getGpaColor(score),
                                                                        color: 'white',
                                                                        fontWeight: 700,
                                                                        minWidth: 40,
                                                                    }}
                                                                />
                                                            </ListItem>
                                                            {idx < child.recentGrades.length - 1 && (
                                                                <Divider />
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </List>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                ))
            )}
        </Box>
    );
}