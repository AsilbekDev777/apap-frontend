'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Chip,
} from '@mui/material';
import { adminApi } from '@/lib/api/admin.api';
import { attendanceApi, AttendanceRecord } from '@/lib/api/attendance.api';
import { Course, Group, Student } from '@/types';
import { studentsApi } from '@/lib/api/students.api';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STATUS_LABELS = {
    present: { label: 'Keldi', color: '#27AE60' },
    late: { label: 'Kech', color: '#F39C12' },
    absent: { label: 'Kelmadi', color: '#E74C3C' },
};

export default function BulkAttendanceModal({ open, onClose, onSuccess }: Props) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [lessonDate, setLessonDate] = useState(
        new Date().toISOString().split('T')[0],
    );
    const [records, setRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        try {
            const [g, c] = await Promise.all([
                adminApi.getGroups(),
                adminApi.getCourses(),
            ]);
            setGroups(g);
            setCourses(c);
        } catch {
            // silent
        }
    }, []);

    const loadStudents = useCallback(async (groupId: string) => {
        try {
            const data = await studentsApi.getAll({ groupId, limit: 100 });
            setStudents(data.data);
            // Default: hammasi present
            const defaultRecords: Record<string, 'present' | 'absent' | 'late'> = {};
            data.data.forEach((s) => {
                defaultRecords[s.id] = 'present';
            });
            setRecords(defaultRecords);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (open) void loadData();
    }, [open, loadData]);

    useEffect(() => {
        if (selectedGroup) void loadStudents(selectedGroup);
    }, [selectedGroup, loadStudents]);

    const handleStatusChange = (
        studentId: string,
        status: 'present' | 'absent' | 'late',
    ) => {
        setRecords((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
        const newRecords: Record<string, 'present' | 'absent' | 'late'> = {};
        students.forEach((s) => {
            newRecords[s.id] = status;
        });
        setRecords(newRecords);
    };

    const handleSubmit = async () => {
        if (!selectedCourse || students.length === 0) return;
        setLoading(true);
        setError('');

        try {
            const attendanceRecords: AttendanceRecord[] = students.map((s) => ({
                studentId: s.id,
                status: records[s.id] ?? 'present',
            }));

            await attendanceApi.bulkCreate({
                courseId: selectedCourse,
                lessonDate,
                records: attendanceRecords,
            });

            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Xato yuz berdi';
            setError(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedGroup('');
        setSelectedCourse('');
        setStudents([]);
        setRecords({});
        setError('');
        onClose();
    };

    const counts = {
        present: Object.values(records).filter((s) => s === 'present').length,
        late: Object.values(records).filter((s) => s === 'late').length,
        absent: Object.values(records).filter((s) => s === 'absent').length,
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Davomat kiritish</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        select
                        label="Guruh"
                        size="small"
                        sx={{ flex: 1 }}
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        {groups.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                                {g.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Kurs"
                        size="small"
                        sx={{ flex: 1 }}
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        {courses.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.nameUz}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Sana"
                        type="date"
                        size="small"
                        value={lessonDate}
                        onChange={(e) => setLessonDate(e.target.value)}
                        sx={{ width: 160 }}
                    />
                </Box>

                {students.length > 0 && (
                    <>
                        {/* Counts + Mark all */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                    label={`Keldi: ${counts.present}`}
                                    size="small"
                                    sx={{ bgcolor: '#27AE6020', color: '#27AE60' }}
                                />
                                <Chip
                                    label={`Kech: ${counts.late}`}
                                    size="small"
                                    sx={{ bgcolor: '#F39C1220', color: '#F39C12' }}
                                />
                                <Chip
                                    label={`Kelmadi: ${counts.absent}`}
                                    size="small"
                                    sx={{ bgcolor: '#E74C3C20', color: '#E74C3C' }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    sx={{ color: '#27AE60' }}
                                    onClick={() => handleMarkAll('present')}
                                >
                                    Hammasi keldi
                                </Button>
                                <Button
                                    size="small"
                                    sx={{ color: '#E74C3C' }}
                                    onClick={() => handleMarkAll('absent')}
                                >
                                    Hammasi kelmadi
                                </Button>
                            </Box>
                        </Box>

                        {/* Students table */}
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Talaba</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Raqam</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Holat</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => {
                                        const status = records[student.id] ?? 'present';
                                        return (
                                            <TableRow key={student.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {student.lastName} {student.firstName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {student.studentNumber}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <ToggleButtonGroup
                                                        value={status}
                                                        exclusive
                                                        size="small"
                                                        onChange={(_, val) => {
                                                            if (val) handleStatusChange(student.id, val);
                                                        }}
                                                    >
                                                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                                                            <ToggleButton
                                                                key={key}
                                                                value={key}
                                                                sx={{
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    fontSize: 12,
                                                                    '&.Mui-selected': {
                                                                        bgcolor: `${val.color}20`,
                                                                        color: val.color,
                                                                        borderColor: val.color,
                                                                    },
                                                                }}
                                                            >
                                                                {val.label}
                                                            </ToggleButton>
                                                        ))}
                                                    </ToggleButtonGroup>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {selectedGroup && students.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                            Bu guruhda talabalar topilmadi
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Bekor qilish
                </Button>
                <Button
                    variant="contained"
                    disabled={loading || students.length === 0 || !selectedCourse}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        `${students.length} ta talaba uchun saqlash`
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}