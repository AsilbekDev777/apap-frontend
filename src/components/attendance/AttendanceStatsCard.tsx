'use client';

import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Chip,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { AttendanceStats } from '@/lib/api/attendance.api';

interface Props {
    stats: AttendanceStats;
}

export default function AttendanceStatsCard({ stats }: Props) {
    const getColor = (percentage: number) => {
        if (percentage >= 90) return '#27AE60';
        if (percentage >= 75) return '#F39C12';
        return '#E74C3C';
    };

    const color = getColor(stats.percentage);

    return (
        <Card
            sx={{
                border: stats.warning ? '1px solid #E74C3C30' : '1px solid transparent',
                bgcolor: stats.warning ? '#E74C3C05' : 'white',
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Davomat statistikasi
                    </Typography>
                    {stats.warning && (
                        <Chip
                            icon={<Warning />}
                            label="75% dan past!"
                            color="error"
                            size="small"
                        />
                    )}
                </Box>

                {/* Percentage */}
                <Box sx={{ mb: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Davomat foizi
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color }}
                        >
                            {stats.percentage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={stats.percentage}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${color}20`,
                            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
                        }}
                    />
                </Box>

                {/* Counts */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#27AE60' }}>
                            {stats.present}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Kelgan
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#F39C12' }}>
                            {stats.late}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Kech
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#E74C3C' }}>
                            {stats.absent}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Kelmagan
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Jami
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}