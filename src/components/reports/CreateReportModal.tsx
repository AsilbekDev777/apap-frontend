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
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { PictureAsPdf, TableChart } from '@mui/icons-material';
import { reportsApi, CreateReportData, ReportType, ReportFormat } from '@/lib/api/reports.api';
import { adminApi } from '@/lib/api/admin.api';
import { studentsApi } from '@/lib/api/students.api';
import { Student, Group, Semester } from '@/types';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateReportModal({ open, onClose, onSuccess }: Props) {
    const [type, setType] = useState<ReportType>('student_card');
    const [format, setFormat] = useState<ReportFormat>('pdf');
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        try {
            const [s, g, sem] = await Promise.all([
                studentsApi.getAll({ limit: 100 }),
                adminApi.getGroups(),
                adminApi.getSemesters(),
            ]);
            setStudents(s.data);
            setGroups(g);
            setSemesters(sem);
            const active = sem.find((s) => s.isActive);
            if (active) setSelectedSemester(active.id);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (open) void loadData();
    }, [open, loadData]);

    // Type o'zgarganda format reset
    useEffect(() => {
        if (type === 'student_card') setFormat('pdf');
        else setFormat('excel');
    }, [type]);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            const dto: CreateReportData = {
                type,
                format,
                semesterId: selectedSemester || undefined,
                studentId: type === 'student_card' ? selectedStudent : undefined,
                groupId: type === 'group_report' ? selectedGroup : undefined,
            };

            await reportsApi.create(dto);
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
        setError('');
        setSelectedStudent('');
        setSelectedGroup('');
        onClose();
    };

    const isValid =
        selectedSemester &&
        (type === 'student_card' ? selectedStudent : selectedGroup);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Yangi report</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Report type */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
                    Report turi
                </Typography>
                <ToggleButtonGroup
                    value={type}
                    exclusive
                    fullWidth
                    onChange={(_, val) => { if (val) setType(val as ReportType); }}
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="student_card">
                        Talaba kartochkasi
                    </ToggleButton>
                    <ToggleButton value="group_report">
                        Guruh hisoboti
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Format */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Format
                </Typography>
                <ToggleButtonGroup
                    value={format}
                    exclusive
                    fullWidth
                    onChange={(_, val) => { if (val) setFormat(val as ReportFormat); }}
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="pdf">
                        <PictureAsPdf sx={{ mr: 1, fontSize: 18 }} />
                        PDF
                    </ToggleButton>
                    <ToggleButton value="excel">
                        <TableChart sx={{ mr: 1, fontSize: 18 }} />
                        Excel
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Semestr */}
                <TextField
                    select
                    label="Semestr"
                    fullWidth
                    margin="normal"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    {semesters.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name} {s.isActive && '(Faol)'}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Talaba yoki Guruh */}
                {type === 'student_card' ? (
                    <TextField
                        select
                        label="Talaba"
                        fullWidth
                        margin="normal"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        {students.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.lastName} {s.firstName} — {s.studentNumber}
                            </MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <TextField
                        select
                        label="Guruh"
                        fullWidth
                        margin="normal"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        {groups.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                                {g.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Bekor qilish
                </Button>
                <Button
                    variant="contained"
                    disabled={loading || !isValid}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        'Yaratish'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}