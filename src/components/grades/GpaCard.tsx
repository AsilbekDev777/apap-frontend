'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Chip } from '@mui/material';
import { gradesApi } from '@/lib/api/grades.api';

interface Props {
    studentId: string;
    semesterId: string;
}

export default function GpaCard({ studentId, semesterId }: Props) {
    const [gpa, setGpa] = useState<{ gpa100: number; gpa5: number } | null>(null);
    const [loading, setLoading] = useState(true);

    const loadGpa = useCallback(async () => {
        if (!studentId || !semesterId) return;
        setLoading(true);
        try {
            const data = await gradesApi.getGpa(studentId, semesterId);
            setGpa(data);
        } finally {
            setLoading(false);
        }
    }, [studentId, semesterId]);

    useEffect(() => {
        void loadGpa();
    }, [loadGpa]);

    const getColor = (score: number) => {
        if (score >= 86) return '#27AE60';
        if (score >= 71) return '#F39C12';
        if (score >= 56) return '#E67E22';
        return '#E74C3C';
    };

    const getGrade = (score: number) => {
        if (score >= 86) return 'A';
        if (score >= 71) return 'B';
        if (score >= 56) return 'C';
        return 'D';
    };

    if (loading) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                </CardContent>
            </Card>
        );
    }

    if (!gpa) return null;

    const color = getColor(gpa.gpa100);

    return (
        <Card
            sx={{
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                border: `1px solid ${color}30`,
            }}
        >
            <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Semestr GPA
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 20,
                        }}
                    >
                        {getGrade(gpa.gpa100)}
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                            {gpa.gpa100}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            100 ballik tizim
                        </Typography>
                    </Box>
                    <Chip
                        label={`${gpa.gpa5} / 5`}
                        sx={{ bgcolor: color, color: 'white', fontWeight: 700 }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}