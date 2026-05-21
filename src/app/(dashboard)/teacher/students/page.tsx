'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress,
    MenuItem, TextField, Avatar,
} from '@mui/material';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api/api';
import { Student } from '@/types';
import PageHeader from '@/components/ui/PageHeader';

interface TeacherAssignment {
    courseId: string;
    groupId: string;
    course: { nameUz: string };
    group: { id: string; name: string };
}

const AVATAR_COLORS = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#6366f1)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
];

export default function TeacherStudentsPage() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);

    const loadAssignments = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get<TeacherAssignment[]>('/admin/teacher-assignments', {
                params: { teacherUserId: user.id },
            });
            setAssignments(data);
        } catch { /* silent */ }
    }, [user]);

    const loadStudents = useCallback(async (groupId: string) => {
        setLoading(true);
        try {
            const { data } = await api.get('/students', { params: { groupId, limit: 100 } });
            setStudents(data.data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { void loadAssignments(); }, [loadAssignments]);
    useEffect(() => { if (selectedGroup) void loadStudents(selectedGroup); }, [selectedGroup, loadStudents]);

    const uniqueGroups = assignments.filter(
        (a, idx, arr) => arr.findIndex((b) => b.groupId === a.groupId) === idx,
    );

    return (
        <Box>
            <PageHeader title="Talabalar" subtitle="Guruh bo'yicha talabalar" />

            <Card sx={{ p: 2, mb: 2 }}>
                <TextField
                    select label="Guruh" size="small" sx={{ width: 280 }}
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                >
                    {uniqueGroups.map((a) => (
                        <MenuItem key={a.groupId} value={a.groupId}>{a.group.name}</MenuItem>
                    ))}
                </TextField>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Talaba</TableCell>
                                <TableCell>Talaba raqami</TableCell>
                                <TableCell>Guruh</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : !selectedGroup ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <i className="ti ti-users" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                    <Typography sx={{ color: '#475569', fontSize: 14 }}>Guruhni tanlang</Typography>
                                </TableCell></TableRow>
                            ) : students.length === 0 ? (
                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569' }}>Talabalar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : students.map((s, idx) => (
                                <TableRow key={s.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length], width: 32, height: 32, fontSize: 12, fontWeight: 600, color: '#e0e7ff' }}>
                                                {s.firstName[0]}{s.lastName[0]}
                                            </Avatar>
                                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
                                                {s.lastName} {s.firstName}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'inline-flex', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                            {s.studentNumber}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: 13, color: '#64748b' }}>{s.group?.name ?? '—'}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}