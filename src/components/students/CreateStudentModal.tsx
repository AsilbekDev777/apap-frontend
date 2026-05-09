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
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentsApi, CreateStudentData } from '@/lib/api/students.api';
import { adminApi } from '@/lib/api/admin.api';
import { Group, Faculty } from '@/types';

const schema = z.object({
    email: z.string().email('Email noto\'g\'ri'),
    password: z.string().min(6, 'Kamida 6 ta belgi'),
    firstName: z.string().min(1, 'Ism kiritish shart'),
    lastName: z.string().min(1, 'Familya kiritish shart'),
    studentNumber: z.string().min(1, 'Talaba raqami shart'),
    groupId: z.string().uuid('Guruh tanlang'),
});

type FormData = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStudentModal({ open, onClose, onSuccess }: Props) {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const loadFaculties = useCallback(async () => {
        try {
            const data = await adminApi.getFaculties();
            setFaculties(data);
        } catch {
            // silent
        }
    }, []);

    const loadGroups = useCallback(async (facultyId: string) => {
        try {
            const data = await adminApi.getGroups(facultyId);
            setGroups(data);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (open) void loadFaculties();
    }, [open, loadFaculties]);

    useEffect(() => {
        if (selectedFaculty) void loadGroups(selectedFaculty);
    }, [selectedFaculty, loadGroups]);

    const onSubmit = async (data: FormData) => {
        setError('');
        try {
            await studentsApi.create(data as CreateStudentData);
            reset();
            setSelectedFaculty('');
            setGroups([]);
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
        setSelectedFaculty('');
        setGroups([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Yangi talaba</DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    component="form"
                    id="create-student-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                            {...register('firstName')}
                            label="Ism"
                            fullWidth
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                        />
                        <TextField
                            {...register('lastName')}
                            label="Familya"
                            fullWidth
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                        />
                    </Box>

                    <TextField
                        {...register('email')}
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />

                    <TextField
                        {...register('password')}
                        label="Parol"
                        type="password"
                        fullWidth
                        margin="normal"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />

                    <TextField
                        {...register('studentNumber')}
                        label="Talaba raqami"
                        fullWidth
                        margin="normal"
                        error={!!errors.studentNumber}
                        helperText={errors.studentNumber?.message}
                    />

                    <TextField
                        select
                        label="Fakultet"
                        fullWidth
                        margin="normal"
                        value={selectedFaculty}
                        onChange={(e) => {
                            setSelectedFaculty(e.target.value);
                            setValue('groupId', '');
                            setGroups([]);
                        }}
                    >
                        {faculties.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                                {f.nameUz}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        {...register('groupId')}
                        select
                        label="Guruh"
                        fullWidth
                        margin="normal"
                        error={!!errors.groupId}
                        helperText={errors.groupId?.message}
                        disabled={!selectedFaculty}
                        defaultValue=""
                    >
                        {groups.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                                {g.name} ({g.year})
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Bekor qilish
                </Button>
                <Button
                    type="submit"
                    form="create-student-form"
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Saqlash'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}