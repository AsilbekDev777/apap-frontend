'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert, MenuItem,
} from '@mui/material';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/lib/api/admin.api';
import { Group, Faculty } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import api from '@/lib/api/api';
import { useRouter } from "next/router";

const schema = z.object({
    facultyId: z.string().uuid('Fakultet tanlang'),
    name: z.string().min(1, 'Nom kiritish shart'),
    year: z.preprocess((v) => Number(v), z.number().min(2000).max(2100)),
});

type FormData = { facultyId: string; name: string; year: number };

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const router = useRouter();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<Group | null>(null);
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [g, f] = await Promise.all([adminApi.getGroups(), adminApi.getFaculties()]);
            setGroups(g); setFaculties(f);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const handleOpen = (item?: Group) => {
        setEditItem(item ?? null);
        reset(item ? { facultyId: item.facultyId, name: item.name, year: item.year } : { facultyId: '', name: '', year: new Date().getFullYear() });
        setError(''); setModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setError('');
        try {
            if (editItem) await api.put(`/admin/groups/${editItem.id}`, data);
            else await api.post('/admin/groups', data);
            setModalOpen(false); void load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await api.delete(`/admin/groups/${deleteId}`);
        setDeleteId(null); void load();
    };

    return (
        <Box>
            <PageHeader
                title="Guruhlar"
                subtitle={`Jami ${groups.length} ta guruh`}
                actions={[{ label: 'Yangi guruh', onClick: () => handleOpen(), icon: 'ti-plus' }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nomi</TableCell>
                                <TableCell>Yil</TableCell>
                                <TableCell>Fakultet</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : groups.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                    <Typography sx={{ color: '#475569' }}>Guruhlar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : groups.map((g) => (
                                <TableRow key={g.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell><Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{g.name}</Typography></TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'inline-flex', background: 'rgba(6,182,212,0.12)', color: '#67e8f9', fontSize: 12, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                            {g.year}
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography sx={{ fontSize: 13, color: '#64748b' }}>{g.faculty?.nameUz ?? '—'}</Typography></TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Tahrirlash">
                                            <IconButton size="small" onClick={() => handleOpen(g)}
                                                        sx={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', mr: 0.5, '&:hover': { background: 'rgba(99,102,241,0.2)' } }}>
                                                <i className="ti ti-edit" style={{ fontSize: 15 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="O'chirish">
                                            <IconButton size="small" onClick={() => setDeleteId(g.id)}
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
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>{editItem ? 'Guruhni tahrirlash' : 'Yangi guruh'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1, background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}
                    <Box component="form" id="group-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField {...register('facultyId')} select label="Fakultet" fullWidth margin="normal" error={!!errors.facultyId} helperText={errors.facultyId?.message} defaultValue="">
                            {faculties.map((f) => <MenuItem key={f.id} value={f.id}>{f.nameUz}</MenuItem>)}
                        </TextField>
                        <TextField {...register('name')} label="Guruh nomi" fullWidth margin="normal" error={!!errors.name} helperText={errors.name?.message} placeholder="IIT-21" />
                        <TextField {...register('year')} label="Yil" type="number" fullWidth margin="normal" error={!!errors.year} helperText={errors.year?.message} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setModalOpen(false)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="group-form" variant="contained" disabled={isSubmitting} sx={{ flex: 1 }}>
                        {isSubmitting ? <CircularProgress size={18} sx={{ color: '#e0e7ff' }} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={!!deleteId} title="Guruhni o'chirish" message="Bu guruhni o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
        </Box>
    );
}
