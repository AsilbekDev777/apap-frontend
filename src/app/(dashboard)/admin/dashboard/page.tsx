'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Chip,
    Divider,
    Grid
} from '@mui/material';
import api from '@/lib/api/api';

interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    activeSemester: { name: string } | null;
}

const STAT_CARDS = [
    {
        key: 'totalStudents',
        label: 'Jami talabalar',
        icon: 'ti-users',
        color: '#6366f1',
        gradient: 'linear-gradient(90deg, #6366f1, #818cf8)',
        change: '+12 bu oy',
        changeColor: '#86efac',
    },
    {
        key: 'totalTeachers',
        label: "O'qituvchilar",
        icon: 'ti-chalkboard',
        color: '#8b5cf6',
        gradient: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
        change: 'Faol',
        changeColor: '#94a3b8',
    },
    {
        key: 'totalCourses',
        label: 'Kurslar',
        icon: 'ti-book',
        color: '#06b6d4',
        gradient: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
        change: '2024-2025',
        changeColor: '#94a3b8',
    },
    {
        key: 'activeSemester',
        label: 'Faol semestr',
        icon: 'ti-calendar',
        color: '#f59e0b',
        gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
        change: 'Joriy',
        changeColor: '#86efac',
    },
];

const MOCK_STUDENTS = [
    { initials: 'AK', name: 'Karimov Alibek', group: 'IIT-21 · CS101', score: 92, color: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { initials: 'NR', name: 'Rahimova Nodira', group: 'IIT-22 · MATH101', score: 74, color: 'linear-gradient(135deg,#06b6d4,#6366f1)' },
    { initials: 'JT', name: 'Toshmatov Jasur', group: 'ENG-21 · PHY201', score: 51, color: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { initials: 'ZM', name: 'Mirzayeva Zulfiya', group: 'IIT-23 · CS102', score: 88, color: 'linear-gradient(135deg,#10b981,#06b6d4)' },
];

const MOCK_ATTENDANCE = [
    { group: 'IIT-21', pct: 92, color: 'linear-gradient(90deg,#6366f1,#818cf8)', textColor: '#a5b4fc' },
    { group: 'IIT-22', pct: 87, color: 'linear-gradient(90deg,#10b981,#34d399)', textColor: '#86efac' },
    { group: 'ENG-21', pct: 71, color: 'linear-gradient(90deg,#f59e0b,#fbbf24)', textColor: '#fcd34d' },
    { group: 'IIT-23', pct: 64, color: 'linear-gradient(90deg,#ef4444,#f87171)', textColor: '#fca5a5' },
    { group: 'ENG-22', pct: 95, color: 'linear-gradient(90deg,#06b6d4,#22d3ee)', textColor: '#67e8f9' },
];

function getScoreColor(score: number) {
    if (score >= 86) return { bg: 'rgba(134,239,172,0.12)', text: '#86efac' };
    if (score >= 71) return { bg: 'rgba(252,211,77,0.12)', text: '#fcd34d' };
    if (score >= 56) return { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8' };
    return { bg: 'rgba(252,165,165,0.12)', text: '#fca5a5' };
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

    const getStatValue = (key: string) => {
        if (!stats) return '—';
        if (key === 'activeSemester') return stats.activeSemester?.name ?? "Yo'q";
        return String(stats[key as keyof DashboardStats] ?? 0);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page header */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>
                    Dashboard
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>
                    {new Date().toLocaleDateString('uz-UZ', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Typography>
            </Box>

            {/* Stat cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {STAT_CARDS.map((card) => (
                    <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent sx={{ p: '14px !important' }}>
                                {/* Top color bar */}
                                <Box
                                    sx={{
                                        height: 2,
                                        borderRadius: 1,
                                        background: card.gradient,
                                        mb: 1.5,
                                        mx: -1.75,
                                        mt: -1.75,
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '9px',
                                            background: `${card.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`ti ${card.icon}`} style={{ fontSize: 18, color: card.color }} />
                                    </Box>
                                    <Typography sx={{ fontSize: 11, color: card.changeColor }}>
                                        {card.change}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9' }}>
                                    {getStatValue(card.key)}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 0.3 }}>
                                    {card.label}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Bottom grid */}
            <Grid container spacing={2}>
                {/* Recent grades */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card>
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                                So&apos;nggi baholar
                            </Typography>
                            <Chip
                                label="Yangi"
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: 10,
                                    background: 'rgba(99,102,241,0.2)',
                                    color: '#a5b4fc',
                                    border: '0.5px solid rgba(99,102,241,0.3)',
                                }}
                            />
                        </Box>
                        <List disablePadding>
                            {MOCK_STUDENTS.map((s, idx) => {
                                const scoreColor = getScoreColor(s.score);
                                return (
                                    <Box key={idx}>
                                        <ListItem sx={{ px: 2, py: 1 }}>
                                            <Avatar
                                                sx={{
                                                    background: s.color,
                                                    width: 30,
                                                    height: 30,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: '#e0e7ff',
                                                    mr: 1.5,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {s.initials}
                                            </Avatar>
                                            <ListItemText
                                                primary={s.name}
                                                secondary={s.group}
                                                slotProps={{
                                                    primary: { style: { fontSize: 13, color: '#e2e8f0', fontWeight: 500 } },
                                                    secondary: { style: { fontSize: 11, color: '#64748b' } },
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    background: scoreColor.bg,
                                                    color: scoreColor.text,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: '6px',
                                                    minWidth: 36,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {s.score}
                                            </Box>
                                        </ListItem>
                                        {idx < MOCK_STUDENTS.length - 1 && (
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', mx: 2 }} />
                                        )}
                                    </Box>
                                );
                            })}
                        </List>
                    </Card>
                </Grid>

                {/* Attendance */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ height: '100%' }}>
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                                Davomat holati
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {MOCK_ATTENDANCE.map((a, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                        <Typography sx={{ fontSize: 12, color: '#cbd5e1' }}>{a.group}</Typography>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: a.textColor }}>
                                            {a.pct}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={a.pct}
                                        sx={{
                                            height: 5,
                                            borderRadius: 3,
                                            background: 'rgba(255,255,255,0.06)',
                                            '& .MuiLinearProgress-bar': {
                                                background: a.color,
                                                borderRadius: 3,
                                            },
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}