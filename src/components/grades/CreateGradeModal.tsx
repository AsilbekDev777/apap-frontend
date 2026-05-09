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
    Slider,
    Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { gradesApi, CreateGradeData, GradeType } from '@/lib/api/grades.api';
import { adminApi } from '@/lib/api/admin.api';
import { Course, Semester, Student } from '@/types';
import { studentsApi } from '@/lib/api/students.api';

const schema = z.object({
    studentId: z.string().uuid('Talaba tanlang'),
    courseId: z.string().uuid('Kurs tanlang'),
    semesterId: z.string().uuid('Semestr tanlang'),
    gradeTypeId: z.string().uuid('Baho turi tanlang'),
    score: z.number().min(0).max(100),
});

type FormData = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefilledStudentId?: string;
    prefilledSemesterId?: string;
}

export default function CreateGradeModal({
                                             open,
                                             onClose,
                                             onSuccess,
                                             prefilledStudentId,
                                             prefilledSemesterId,
                                         }: Props) {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [gradeTypes, setGradeTypes] = useState<GradeType[]>([]);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            studentId: prefilledStudentId ?? '',
            semesterId: prefilledSemesterId ?? '',
            score: 0,
        },
    });

    const score = watch('score');

    const loadData = useCallback(async () => {
        try {
            const [s, c, sem, gt] = await Promise.all([
                studentsApi.getAll({ limit: 100 }),
                adminApi.getCourses(),
                adminApi.getSemesters(),
                gradesApi.getGradeTypes(),
            ]);
            setStudents(s.data);
            setCourses(c);
            setSemesters(sem);
            setGradeTypes(gt);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (open) void loadData();
    }, [open, loadData]);

    const getScoreColor = (s: number) => {
        if (s >= 86) return '#27AE60';
        if (s >= 71) return '#F39C12';
        if (s >= 56) return '#E67E22';
        return '#E74C3C';
    };

    const onSubmit = async (data: FormData) => {
        setError('');
        try {
            await gradesApi.create(data as CreateGradeData);
            reset();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Xato yuz berdi';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleClose = () => {
        reset();
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Baho kiritish</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    component="form"
                    id="create-grade-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <TextField
                        {...register('studentId')}
                        select
                        label="Talaba"
                        fullWidth
                        margin="normal"
                        error={!!errors.studentId}
                        helperText={errors.studentId?.message}
                        defaultValue={prefilledStudentId ?? ''}
                    >
                        {students.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.lastName} {s.firstName} — {s.studentNumber}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        {...register('semesterId')}
                        select
                        label="Semestr"
                        fullWidth
                        margin="normal"
                        error={!!errors.semesterId}
                        helperText={errors.semesterId?.message}
                        defaultValue={prefilledSemesterId ?? ''}
                    >
                        {semesters.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name} {s.isActive && '(Faol)'}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        {...register('courseId')}
                        select
                        label="Kurs"
                        fullWidth
                        margin="normal"
                        error={!!errors.courseId}
                        helperText={errors.courseId?.message}
                        defaultValue=""
                    >
                        {courses.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.nameUz} ({c.code})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        {...register('gradeTypeId')}
                        select
                        label="Baho turi"
                        fullWidth
                        margin="normal"
                        error={!!errors.gradeTypeId}
                        helperText={errors.gradeTypeId?.message}
                        defaultValue=""
                    >
                        {gradeTypes.map((gt) => (
                            <MenuItem key={gt.id} value={gt.id}>
                                {gt.nameUz} ({gt.weightPercent}%)
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Score slider */}
                    <Box sx={{ mt: 2 }}>
                        <Box
                            sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Ball
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: getScoreColor(score) }}
                            >
                                {score} / 100
                            </Typography>
                        </Box>
                        <Controller
                            name="score"
                            control={control}
                            render={({ field }) => (
                                <Slider
                                    {...field}
                                    min={0}
                                    max={100}
                                    step={1}
                                    marks={[
                                        { value: 0, label: '0' },
                                        { value: 56, label: '56' },
                                        { value: 71, label: '71' },
                                        { value: 86, label: '86' },
                                        { value: 100, label: '100' },
                                    ]}
                                    sx={{ color: getScoreColor(score) }}
                                />
                            )}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Bekor qilish
                </Button>
                <Button
                    type="submit"
                    form="create-grade-form"
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        'Saqlash'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}