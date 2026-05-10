'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    MenuItem,
    TextField,
    Avatar,
    Chip,
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

export default function TeacherStudentsPage() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);

    const loadAssignments = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get<TeacherAssignment[]>(
                '/admin/teacher-assignments',
                { params: { teacherUserId: user.id } },
            );
            setAssignments(data);
        } catch {
            // silent
        }
    }, [user]);

    const loadStudents = useCallback(async (groupId: string) => {
        setLoading(true);
        try {
            const { data } = await api.get('/students', {
                params: { groupId, limit: 100 },
            });
            setStudents(data.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAssignments();
    }, [loadAssignments]);

    useEffect(() => {
        if (selectedGroup) void loadStudents(selectedGroup);
    }, [selectedGroup, loadStudents]);

    // Unique groups
    const uniqueGroups = assignments.filter(
        (a, idx, arr) => arr.findIndex((b) => b.groupId === a.groupId) === idx,
    );

    return (
        <Box>
            <PageHeader title="Talabalar" />

            <Card sx={{ p: 2, mb: 3 }}>
                <TextField
                    select
                    label="Guruh"
                    size="small"
                    sx={{ width: 300 }}
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                >
                    {uniqueGroups.map((a) => (
                        <MenuItem key={a.groupId} value={a.groupId}>
                            {a.group.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Talaba</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Talaba raqami</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Guruh</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : !selectedGroup ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Guruhni tanlang
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Talabalar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((s) => (
                                    <TableRow key={s.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar
                                                    sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13 }}
                                                >
                                                    {s.firstName[0]}{s.lastName[0]}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {s.lastName} {s.firstName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={s.studentNumber} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {s.group?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}