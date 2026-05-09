'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import { People, Book, School, CalendarMonth } from '@mui/icons-material';
import api from '@/lib/api/api';

interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    activeSemester: { name: string } | null;
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
                            color: color,
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

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            const { data } = await api.get<DashboardStats>('/admin/dashboard');
            setStats(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Talabalar"
                        value={stats?.totalStudents ?? 0}
                        icon={<People />}
                        color="#2C3E50"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="O'qituvchilar"
                        value={stats?.totalTeachers ?? 0}
                        icon={<School />}
                        color="#27AE60"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Kurslar"
                        value={stats?.totalCourses ?? 0}
                        icon={<Book />}
                        color="#E74C3C"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Faol semestr"
                        value={stats?.activeSemester?.name ?? "Yo'q"}
                        icon={<CalendarMonth />}
                        color="#F39C12"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}