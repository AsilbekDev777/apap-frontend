'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert,
} from '@mui/material';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/lib/api/admin.api';
import { Faculty } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import api from '@/lib/api/api';

const schema = z.object({
    nameUz: z.string().min(2, 'Kamida 2 ta belgi'),
    nameRu: z.string().min(2, 'Kamida 2 ta belgi'),
    code: z.string().min(1, 'Kod kiritish shart'),
});

type FormData = { nameUz: string; nameRu: string; code: string };

export default function FacultiesPage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<Faculty | null>(null);
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

    const load = useCallback(async () => {
        setLoading(true);
        try { setFaculties(await adminApi.getFaculties()); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const handleOpen = (item?: Faculty) => {
        setEditItem(item ?? null);
        reset(item ? { nameUz: item.nameUz, nameRu: item.nameRu, code: item.code } : { nameUz: '', nameRu: '', code: '' });
        setError('');
        setModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setError('');
        try {
            if (editItem) await api.put(`/admin/faculties/${editItem.id}`, data);
            else await api.post('/admin/faculties', data);
            setModalOpen(false);
            void load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await api.delete(`/admin/faculties/${deleteId}`);
        setDeleteId(null);
        void load();
    };

    return (
        <Box>
            <PageHeader
                title="Fakultetlar"
                subtitle={`Jami ${faculties.length} ta fakultet`}
                actions={[{ label: 'Yangi fakultet', onClick: () => handleOpen(), icon: 'ti-plus' }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Kod</TableCell>
                                <TableCell>Nomi (UZ)</TableCell>
                                <TableCell>Nomi (RU)</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : faculties.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569' }}>Fakultetlar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : faculties.map((f) => (
                                <TableRow key={f.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'inline-flex', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '6px', border: '0.5px solid rgba(99,102,241,0.3)' }}>
                                            {f.code}
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography sx={{ fontSize: 13, color: '#e2e8f0' }}>{f.nameUz}</Typography></TableCell>
                                    <TableCell><Typography sx={{ fontSize: 13, color: '#64748b' }}>{f.nameRu}</Typography></TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Tahrirlash">
                                            <IconButton size="small" onClick={() => handleOpen(f)}
                                                        sx={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', mr: 0.5, '&:hover': { background: 'rgba(99,102,241,0.2)' } }}>
                                                <i className="ti ti-edit" style={{ fontSize: 15 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="O'chirish">
                                            <IconButton size="small" onClick={() => setDeleteId(f.id)}
                                                        sx={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', '&:hover': { background: 'rgba(239,68,68,0.2)' } }}>
                                                <i className="ti ti-trash" style={{ fontSize: 15 }} />
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
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                    {editItem ? 'Fakultetni tahrirlash' : 'Yangi fakultet'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '0.5px solid rgba(239,68,68,0.2)' }}>{error}</Alert>}
                    <Box component="form" id="faculty-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField {...register('code')} label="Kod" fullWidth margin="normal" error={!!errors.code} helperText={errors.code?.message} placeholder="IIT" />
                        <TextField {...register('nameUz')} label="Nomi (UZ)" fullWidth margin="normal" error={!!errors.nameUz} helperText={errors.nameUz?.message} />
                        <TextField {...register('nameRu')} label="Nomi (RU)" fullWidth margin="normal" error={!!errors.nameRu} helperText={errors.nameRu?.message} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setModalOpen(false)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="faculty-form" variant="contained" disabled={isSubmitting} sx={{ flex: 1 }}>
                        {isSubmitting ? <CircularProgress size={18} sx={{ color: '#e0e7ff' }} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={!!deleteId} title="Fakultetni o'chirish" message="Bu fakultetni o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
        </Box>
    );
}