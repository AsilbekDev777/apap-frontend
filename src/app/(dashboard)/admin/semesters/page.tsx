'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert, Switch, FormControlLabel,
} from '@mui/material';
import { useForm, SubmitHandler, Resolver, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/lib/api/admin.api';
import { Semester } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import api from '@/lib/api/api';

const schema = z.object({
    name: z.string().min(1, 'Nom kiritish shart'),
    startDate: z.string().min(1, 'Sana shart'),
    endDate: z.string().min(1, 'Sana shart'),
    isActive: z.boolean().optional(),
});

type FormData = { name: string; startDate: string; endDate: string; isActive?: boolean };

export default function SemestersPage() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Semester | null>(null);
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

    const load = useCallback(async () => {
        setLoading(true);
        try { setSemesters(await adminApi.getSemesters()); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const handleOpen = (item?: Semester) => {
        setEditItem(item ?? null);
        reset(item ? { name: item.name, startDate: item.startDate, endDate: item.endDate, isActive: item.isActive } : { name: '', startDate: '', endDate: '', isActive: false });
        setError(''); setModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setError('');
        try {
            if (editItem) await api.put(`/admin/semesters/${editItem.id}`, data);
            else await api.post('/admin/semesters', data);
            setModalOpen(false); void load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    const handleActivate = async (id: string) => {
        await api.put(`/admin/semesters/${id}/activate`);
        void load();
    };

    return (
        <Box>
            <PageHeader
                title="Semestrlar"
                subtitle={`Jami ${semesters.length} ta semestr`}
                actions={[{ label: 'Yangi semestr', onClick: () => handleOpen(), icon: 'ti-plus' }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nomi</TableCell>
                                <TableCell>Boshlanish</TableCell>
                                <TableCell>Tugash</TableCell>
                                <TableCell>Holat</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : semesters.map((s) => (
                                <TableRow key={s.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell><Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{s.name}</Typography></TableCell>
                                    <TableCell><Typography sx={{ fontSize: 13, color: '#94a3b8' }}>{new Date(s.startDate).toLocaleDateString('uz')}</Typography></TableCell>
                                    <TableCell><Typography sx={{ fontSize: 13, color: '#94a3b8' }}>{new Date(s.endDate).toLocaleDateString('uz')}</Typography></TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'inline-flex', background: s.isActive ? 'rgba(134,239,172,0.12)' : 'rgba(100,116,139,0.12)', color: s.isActive ? '#86efac' : '#64748b', fontSize: 12, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                            {s.isActive ? 'Faol' : 'Faol emas'}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        {!s.isActive && (
                                            <Tooltip title="Faollashtirish">
                                                <IconButton size="small" onClick={() => handleActivate(s.id)}
                                                            sx={{ background: 'rgba(134,239,172,0.1)', color: '#86efac', mr: 0.5, '&:hover': { background: 'rgba(134,239,172,0.2)' } }}>
                                                    <i className="ti ti-circle-check" style={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Tahrirlash">
                                            <IconButton size="small" onClick={() => handleOpen(s)}
                                                        sx={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', '&:hover': { background: 'rgba(99,102,241,0.2)' } }}>
                                                <i className="ti ti-edit" style={{ fontSize: 15 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>{editItem ? 'Semesterni tahrirlash' : 'Yangi semestr'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1, background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}
                    <Box component="form" id="semester-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField {...register('name')} label="Nomi" fullWidth margin="normal" error={!!errors.name} helperText={errors.name?.message} placeholder="2024-2025 I-semestr" />
                        <TextField {...register('startDate')} label="Boshlanish" type="date" fullWidth margin="normal" error={!!errors.startDate} helperText={errors.startDate?.message} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField {...register('endDate')} label="Tugash" type="date" fullWidth margin="normal" error={!!errors.endDate} helperText={errors.endDate?.message} slotProps={{ inputLabel: { shrink: true } }} />
                        <Controller name="isActive" control={control} render={({ field }) => (
                            <FormControlLabel
                                control={<Switch checked={field.value ?? false} onChange={field.onChange} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366f1' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { background: '#6366f1' } }} />}
                                label={<Typography sx={{ fontSize: 13, color: '#94a3b8' }}>Faol semestr</Typography>}
                                sx={{ mt: 1 }}
                            />
                        )} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setModalOpen(false)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="semester-form" variant="contained" disabled={isSubmitting} sx={{ flex: 1 }}>
                        {isSubmitting ? <CircularProgress size={18} sx={{ color: '#e0e7ff' }} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}