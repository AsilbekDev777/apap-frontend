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
    Switch,
    FormControlLabel,
} from '@mui/material';
import { Edit, CheckCircle } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/lib/api/admin.api';
import { Semester } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import api from '@/lib/api/api';

const schema = z.object({
    name: z.string().min(1, 'Nom kiritish shart'),
    startDate: z.string().min(1, 'Boshlanish sanasi shart'),
    endDate: z.string().min(1, 'Tugash sanasi shart'),
    isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SemestersPage() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Semester | null>(null);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getSemesters();
            setSemesters(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handleOpen = (item?: Semester) => {
        setEditItem(item ?? null);
        if (item) {
            reset({
                name: item.name,
                startDate: item.startDate,
                endDate: item.endDate,
                isActive: item.isActive,
            });
        } else {
            reset({ name: '', startDate: '', endDate: '', isActive: false });
        }
        setError('');
        setModalOpen(true);
    };

    const onSubmit = async (data: FormData) => {
        setError('');
        try {
            if (editItem) {
                await api.put(`/admin/semesters/${editItem.id}`, data);
            } else {
                await api.post('/admin/semesters', data);
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

    const handleActivate = async (id: string) => {
        try {
            await api.put(`/admin/semesters/${id}/activate`);
            void load();
        } catch {
            // silent
        }
    };

    return (
        <Box>
            <PageHeader
                title="Semestrlar"
                actions={[{ label: 'Yangi semestr', onClick: () => handleOpen() }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Nomi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Boshlanish</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Tugash</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Holat</TableCell>
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
                            ) : semesters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">Semestrlar topilmadi</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                semesters.map((s) => (
                                    <TableRow key={s.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {s.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(s.startDate).toLocaleDateString('uz')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(s.endDate).toLocaleDateString('uz')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {s.isActive ? (
                                                <Chip label="Faol" color="success" size="small" />
                                            ) : (
                                                <Chip label="Faol emas" size="small" variant="outlined" />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {!s.isActive && (
                                                <Tooltip title="Faollashtirish">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleActivate(s.id)}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Tahrirlash">
                                                <IconButton size="small" color="primary" onClick={() => handleOpen(s)}>
                                                    <Edit fontSize="small" />
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
                    {editItem ? 'Semesterni tahrirlash' : 'Yangi semestr'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
                    <Box component="form" id="semester-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            {...register('name')}
                            label="Nomi"
                            fullWidth
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            placeholder="2024-2025 I-semestr"
                        />
                        <TextField
                            {...register('startDate')}
                            label="Boshlanish sanasi"
                            type="date"
                            fullWidth
                            margin="normal"
                            error={!!errors.startDate}
                            helperText={errors.startDate?.message}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            {...register('endDate')}
                            label="Tugash sanasi"
                            type="date"
                            fullWidth
                            margin="normal"
                            error={!!errors.endDate}
                            helperText={errors.endDate?.message}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={field.value ?? false}
                                            onChange={field.onChange}
                                        />
                                    }
                                    label="Faol semestr"
                                    sx={{ mt: 1 }}
                                />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setModalOpen(false)} color="inherit">Bekor qilish</Button>
                    <Button type="submit" form="semester-form" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}