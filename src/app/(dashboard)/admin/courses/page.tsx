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
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Chip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import {SubmitHandler, useForm, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/lib/api/admin.api';
import { Course } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import api from '@/lib/api/api';

const schema = z.object({
    nameUz: z.string().min(1, 'Nom kiritish shart'),
    nameRu: z.string().min(1, 'Nom kiritish shart'),
    code: z.string().min(1, 'Kod kiritish shart'),
    creditHours: z.preprocess(
        (val) => Number(val),
        z.number().min(1).max(10),
    ),
});

type FormData = {
    nameUz: string;
    nameRu: string;
    code: string;
    creditHours: number;
};

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<Course | null>(null);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema) as Resolver<FormData>,
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getCourses();
            setCourses(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handleOpen = (item?: Course) => {
        setEditItem(item ?? null);
        if (item) {
            reset({
                nameUz: item.nameUz,
                nameRu: item.nameRu,
                code: item.code,
                creditHours: item.creditHours,
            });
        } else {
            reset({ nameUz: '', nameRu: '', code: '', creditHours: 3 });
        }
        setError('');
        setModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setError('');
        try {
            if (editItem) {
                await api.put(`/admin/courses/${editItem.id}`, data);
            } else {
                await api.post('/admin/courses', data);
            }
            setModalOpen(false);
            void load();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Xato yuz berdi';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/courses/${deleteId}`);
            setDeleteId(null);
            void load();
        } catch {
            // silent
        }
    };

    return (
        <Box>
            <PageHeader
                title="Kurslar"
                actions={[{ label: 'Yangi kurs', onClick: () => handleOpen() }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Kod</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Nomi (UZ)</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Nomi (RU)</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Kredit soat</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">Kurslar topilmadi</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((c) => (
                                    <TableRow key={c.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Chip label={c.code} size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{c.nameUz}</TableCell>
                                        <TableCell color="text.secondary">{c.nameRu}</TableCell>
                                        <TableCell>
                                            <Chip label={`${c.creditHours} soat`} size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Tahrirlash">
                                                <IconButton size="small" color="primary" onClick={() => handleOpen(c)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="O'chirish">
                                                <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editItem ? 'Kursni tahrirlash' : 'Yangi kurs'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
                    <Box component="form" id="course-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            {...register('code')}
                            label="Kod"
                            fullWidth
                            margin="normal"
                            error={!!errors.code}
                            helperText={errors.code?.message}
                            placeholder="CS101"
                        />
                        <TextField
                            {...register('nameUz')}
                            label="Nomi (UZ)"
                            fullWidth
                            margin="normal"
                            error={!!errors.nameUz}
                            helperText={errors.nameUz?.message}
                        />
                        <TextField
                            {...register('nameRu')}
                            label="Nomi (RU)"
                            fullWidth
                            margin="normal"
                            error={!!errors.nameRu}
                            helperText={errors.nameRu?.message}
                        />
                        <TextField
                            {...register('creditHours')}
                            label="Kredit soat"
                            type="number"
                            fullWidth
                            margin="normal"
                            error={!!errors.creditHours}
                            helperText={errors.creditHours?.message}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setModalOpen(false)} color="inherit">Bekor qilish</Button>
                    <Button type="submit" form="course-form" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                title="Kursni o'chirish"
                message="Bu kursni o'chirishni tasdiqlaysizmi?"
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
            />
        </Box>
    );
}