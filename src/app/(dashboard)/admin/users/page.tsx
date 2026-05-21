'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert, MenuItem, Avatar,
} from '@mui/material';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserRole } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import api from '@/lib/api/api';

const schema = z.object({
    email: z.string().email("Email noto'g'ri"),
    password: z.string().min(6, 'Kamida 6 ta belgi'),
    role: z.enum(['admin', 'teacher', 'student', 'parent']),
    lang: z.enum(['uz', 'ru']),
});

type FormData = { email: string; password: string; role: 'admin' | 'teacher' | 'student' | 'parent'; lang: 'uz' | 'ru' };

const ROLE_CONFIG: { [key in UserRole]: { label: string; bg: string; color: string } } = {
    admin: { label: 'Admin', bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
    teacher: { label: "O'qituvchi", bg: 'rgba(6,182,212,0.15)', color: '#67e8f9' },
    student: { label: 'Talaba', bg: 'rgba(16,185,129,0.15)', color: '#86efac' },
    parent: { label: 'Ota-ona', bg: 'rgba(245,158,11,0.15)', color: '#fcd34d' },
};

const AVATAR_COLORS: { [key in UserRole]: string } = {
    admin: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    teacher: 'linear-gradient(135deg,#06b6d4,#6366f1)',
    student: 'linear-gradient(135deg,#10b981,#06b6d4)',
    parent: 'linear-gradient(135deg,#f59e0b,#ef4444)',
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [toggleActive, setToggleActive] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

    const load = useCallback(async () => {
        setLoading(true);
        try { const { data } = await api.get<User[]>('/admin/users'); setUsers(data); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setError('');
        try {
            await api.post('/admin/users', data);
            setModalOpen(false); void load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    const handleToggle = async () => {
        if (!toggleId) return;
        await api.put(`/admin/users/${toggleId}/toggle-status`);
        setToggleId(null); void load();
    };

    const handleOpen = () => {
        reset({ email: '', password: '', role: 'teacher', lang: 'uz' });
        setError(''); setModalOpen(true);
    };

    return (
        <Box>
            <PageHeader
                title="Foydalanuvchilar"
                subtitle={`Jami ${users.length} ta foydalanuvchi`}
                actions={[{ label: 'Yangi foydalanuvchi', onClick: handleOpen, icon: 'ti-plus' }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Foydalanuvchi</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell>Til</TableCell>
                                <TableCell>Holat</TableCell>
                                <TableCell>So`nggi kirish</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : users.map((user) => {
                                const roleConfig = ROLE_CONFIG[user.role];
                                return (
                                    <TableRow key={user.id} sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ background: AVATAR_COLORS[user.role], width: 32, height: 32, fontSize: 12, fontWeight: 600, color: '#e0e7ff' }}>
                                                    {user.email[0].toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{user.email}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'inline-flex', background: roleConfig.bg, color: roleConfig.color, fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                                {roleConfig.label}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'inline-flex', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                                {user.lang.toUpperCase()}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'inline-flex', background: user.isActive ? 'rgba(134,239,172,0.12)' : 'rgba(252,165,165,0.12)', color: user.isActive ? '#86efac' : '#fca5a5', fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                                {user.isActive ? 'Faol' : 'Bloklangan'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12, color: '#475569' }}>
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString('uz') : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title={user.isActive ? 'Bloklash' : 'Faollashtirish'}>
                                                <IconButton size="small"
                                                            onClick={() => { setToggleId(user.id); setToggleActive(user.isActive); }}
                                                            sx={{ background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(134,239,172,0.1)', color: user.isActive ? '#fca5a5' : '#86efac', '&:hover': { background: user.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(134,239,172,0.2)' } }}>
                                                    <i className={`ti ${user.isActive ? 'ti-lock' : 'ti-lock-open'}`} style={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>Yangi foydalanuvchi</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1, background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}
                    <Box component="form" id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField {...register('email')} label="Email" type="email" fullWidth margin="normal" error={!!errors.email} helperText={errors.email?.message} />
                        <TextField {...register('password')} label="Parol" type="password" fullWidth margin="normal" error={!!errors.password} helperText={errors.password?.message} />
                        <TextField {...register('role')} select label="Rol" fullWidth margin="normal" defaultValue="teacher">
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="teacher">O&apos;qituvchi</MenuItem>
                            <MenuItem value="student">Talaba</MenuItem>
                            <MenuItem value="parent">Ota-ona</MenuItem>
                        </TextField>
                        <TextField {...register('lang')} select label="Til" fullWidth margin="normal" defaultValue="uz">
                            <MenuItem value="uz">O&apos;zbek</MenuItem>
                            <MenuItem value="ru">Русский</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setModalOpen(false)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="user-form" variant="contained" disabled={isSubmitting} sx={{ flex: 1 }}>
                        {isSubmitting ? <CircularProgress size={18} sx={{ color: '#e0e7ff' }} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={!!toggleId}
                title={toggleActive ? 'Foydalanuvchini bloklash' : 'Faollashtirish'}
                message={toggleActive ? 'Bu foydalanuvchini bloklashni tasdiqlaysizmi?' : 'Bu foydalanuvchini faollashtirishni tasdiqlaysizmi?'}
                onConfirm={handleToggle}
                onClose={() => setToggleId(null)}
            />
        </Box>
    );
}