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
} from '@mui/material';
import { Grid } from '@mui/material';
import { Grade, EventAvailable, People, Book } from '@mui/icons-material';
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

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 3,
                            bgcolor: `${color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color,
                        }}
                    >
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data } = await api.get<TeacherAssignment[]>(
                '/admin/teacher-assignments',
                { params: { teacherUserId: user.id } },
            );
            setAssignments(data);
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

    const activeCourses = assignments.filter((a) => a.semester.isActive);
    const uniqueCourses = new Set(assignments.map((a) => a.courseId)).size;
    const uniqueGroups = new Set(assignments.map((a) => a.groupId)).size;

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Xush kelibsiz, {user?.email}
            </Typography>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Faol kurslar"
                        value={activeCourses.length}
                        icon={<Book />}
                        color="#2C3E50"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Jami kurslar"
                        value={uniqueCourses}
                        icon={<Grade />}
                        color="#27AE60"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Guruhlar"
                        value={uniqueGroups}
                        icon={<People />}
                        color="#E74C3C"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Jami tayinlashlar"
                        value={assignments.length}
                        icon={<EventAvailable />}
                        color="#F39C12"
                    />
                </Grid>
            </Grid>

            {/* Active courses */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Faol semestr kurslari
            </Typography>

            <Card>
                {activeCourses.length === 0 ? (
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">
                            Faol semestrada kurslar topilmadi
                        </Typography>
                    </CardContent>
                ) : (
                    <List disablePadding>
                        {activeCourses.map((a, idx) => (
                            <Box key={`${a.courseId}-${a.groupId}`}>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {a.course.nameUz}
                                                </Typography>
                                                <Chip
                                                    label={a.course.code}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                <Chip
                                                    label={a.group.name}
                                                    size="small"
                                                    sx={{ bgcolor: '#27AE6015', color: '#27AE60' }}
                                                />
                                                <Chip
                                                    label={a.semester.name}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {idx < activeCourses.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}
            </Card>
        </Box>
    );
}