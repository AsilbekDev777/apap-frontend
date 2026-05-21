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

// ─── Schemas ──────────────────────────────────────────────────────────────────
const createSchema = z.object({
    email: z.string().email("Email noto'g'ri"),
    password: z.string().min(6, 'Kamida 6 ta belgi'),
    role: z.enum(['admin', 'teacher', 'student', 'parent']),
    lang: z.enum(['uz', 'ru']),
});

const editSchema = z.object({
    email: z.string().email("Email noto'g'ri"),
    role: z.enum(['admin', 'teacher', 'student', 'parent']),
    lang: z.enum(['uz', 'ru']),
});

const passwordSchema = z.object({
    newPassword: z.string().min(6, 'Kamida 6 ta belgi'),
    confirmPassword: z.string().min(6, 'Kamida 6 ta belgi'),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Parollar mos kelmaydi',
    path: ['confirmPassword'],
});

type CreateFormData = {
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    lang: 'uz' | 'ru';
};

type EditFormData = {
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    lang: 'uz' | 'ru';
};

type PasswordFormData = {
    newPassword: string;
    confirmPassword: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [passwordUser, setPasswordUser] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [toggleActive, setToggleActive] = useState(false);

    const [error, setError] = useState('');

    // ─── Forms ────────────────────────────────────────────────────────────────
    const createForm = useForm<CreateFormData>({
        resolver: zodResolver(createSchema) as Resolver<CreateFormData>,
    });

    const editForm = useForm<EditFormData>({
        resolver: zodResolver(editSchema) as Resolver<EditFormData>,
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema) as Resolver<PasswordFormData>,
    });

    // ─── Load ─────────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<User[]>('/admin/users');
            setUsers(data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    // ─── Create ───────────────────────────────────────────────────────────────
    const handleCreate: SubmitHandler<CreateFormData> = async (data) => {
        setError('');
        try {
            await api.post('/admin/users', data);
            setCreateOpen(false);
            createForm.reset();
            void load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    // ─── Edit ─────────────────────────────────────────────────────────────────
    const openEdit = (user: User) => {
        setEditUser(user);
        editForm.reset({ email: user.email, role: user.role, lang: user.lang });
        setError('');
    };

    const handleEdit: SubmitHandler<EditFormData> = async (data) => {
        if (!editUser) return;
        setError('');
        try {
            await api.put(`/admin/users/${editUser.id}`, data);
            setEditUser(null);
            void load();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    // ─── Password ─────────────────────────────────────────────────────────────
    const openPassword = (user: User) => {
        setPasswordUser(user);
        passwordForm.reset({ newPassword: '', confirmPassword: '' });
        setError('');
    };

    const handlePassword: SubmitHandler<PasswordFormData> = async (data) => {
        if (!passwordUser) return;
        setError('');
        try {
            await api.put(`/admin/users/${passwordUser.id}/password`, {
                newPassword: data.newPassword,
            });
            setPasswordUser(null);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xato';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteId) return;
        await api.delete(`/admin/users/${deleteId}`);
        setDeleteId(null);
        void load();
    };

    // ─── Toggle ───────────────────────────────────────────────────────────────
    const handleToggle = async () => {
        if (!toggleId) return;
        await api.put(`/admin/users/${toggleId}/toggle-status`);
        setToggleId(null);
        void load();
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Box>
            <PageHeader
                title="Foydalanuvchilar"
                subtitle={`Jami ${users.length} ta foydalanuvchi`}
                actions={[{
                    label: 'Yangi foydalanuvchi',
                    onClick: () => {
                        createForm.reset({ email: '', password: '', role: 'teacher', lang: 'uz' });
                        setError('');
                        setCreateOpen(true);
                    },
                    icon: 'ti-plus',
                }]}
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
                                <TableCell>So&apos;nggi kirish</TableCell>
                                <TableCell align="center">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <i className="ti ti-users-off" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                        <Typography sx={{ color: '#475569' }}>Foydalanuvchilar topilmadi</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : users.map((user) => {
                                const roleConfig = ROLE_CONFIG[user.role];
                                return (
                                    <TableRow key={user.id} sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ background: AVATAR_COLORS[user.role], width: 32, height: 32, fontSize: 12, fontWeight: 600, color: '#e0e7ff' }}>
                                                    {user.email[0].toUpperCase()}
                                                </Avatar>
                                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
                                                    {user.email}
                                                </Typography>
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
                                            {/* Edit */}
                                            <Tooltip title="Tahrirlash">
                                                <IconButton size="small" onClick={() => openEdit(user)}
                                                            sx={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', mr: 0.5, '&:hover': { background: 'rgba(99,102,241,0.2)' } }}>
                                                    <i className="ti ti-edit" style={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {/* Parol */}
                                            <Tooltip title="Parol o'zgartirish">
                                                <IconButton size="small" onClick={() => openPassword(user)}
                                                            sx={{ background: 'rgba(245,158,11,0.1)', color: '#fcd34d', mr: 0.5, '&:hover': { background: 'rgba(245,158,11,0.2)' } }}>
                                                    <i className="ti ti-key" style={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {/* Block/Unblock */}
                                            <Tooltip title={user.isActive ? 'Bloklash' : 'Faollashtirish'}>
                                                <IconButton size="small"
                                                            onClick={() => { setToggleId(user.id); setToggleActive(user.isActive); }}
                                                            sx={{ background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(134,239,172,0.1)', color: user.isActive ? '#fca5a5' : '#86efac', mr: 0.5, '&:hover': { background: user.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(134,239,172,0.2)' } }}>
                                                    <i className={`ti ${user.isActive ? 'ti-lock' : 'ti-lock-open'}`} style={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {/* Delete */}
                                            <Tooltip title="O'chirish">
                                                <IconButton size="small" onClick={() => setDeleteId(user.id)}
                                                            sx={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', '&:hover': { background: 'rgba(239,68,68,0.2)' } }}>
                                                    <i className="ti ti-trash" style={{ fontSize: 15 }} />
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

            {/* ─── Create Modal ─────────────────────────────────────────────────── */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ti ti-user-plus" style={{ fontSize: 18, color: '#a5b4fc' }} />
                        </Box>
                        Yangi foydalanuvchi
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '0.5px solid rgba(239,68,68,0.2)' }}>{error}</Alert>}
                    <Box component="form" id="create-user-form" onSubmit={createForm.handleSubmit(handleCreate)} noValidate>
                        <TextField
                            {...createForm.register('email')}
                            label="Email" type="email" fullWidth margin="normal"
                            error={!!createForm.formState.errors.email}
                            helperText={createForm.formState.errors.email?.message}
                        />
                        <TextField
                            {...createForm.register('password')}
                            label="Parol" type="password" fullWidth margin="normal"
                            error={!!createForm.formState.errors.password}
                            helperText={createForm.formState.errors.password?.message}
                        />
                        <TextField
                            {...createForm.register('role')}
                            select label="Rol" fullWidth margin="normal" defaultValue="teacher"
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="teacher">O&apos;qituvchi</MenuItem>
                            <MenuItem value="student">Talaba</MenuItem>
                            <MenuItem value="parent">Ota-ona</MenuItem>
                        </TextField>
                        <TextField
                            {...createForm.register('lang')}
                            select label="Til" fullWidth margin="normal" defaultValue="uz"
                        >
                            <MenuItem value="uz">O&apos;zbek</MenuItem>
                            <MenuItem value="ru">Русский</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setCreateOpen(false)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="create-user-form" variant="contained" disabled={createForm.formState.isSubmitting} sx={{ flex: 1 }}>
                        {createForm.formState.isSubmitting ? <CircularProgress size={18} sx={{ color: '#e0e7ff' }} /> : 'Yaratish'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── Edit Modal ───────────────────────────────────────────────────── */}
            <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ti ti-user-edit" style={{ fontSize: 18, color: '#a5b4fc' }} />
                        </Box>
                        Foydalanuvchini tahrirlash
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1, background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}
                    <Box component="form" id="edit-user-form" onSubmit={editForm.handleSubmit(handleEdit)} noValidate>
                        <TextField
                            {...editForm.register('email')}
                            label="Email" type="email" fullWidth margin="normal"
                            error={!!editForm.formState.errors.email}
                            helperText={editForm.formState.errors.email?.message}
                        />
                        <TextField
                            {...editForm.register('role')}
                            select label="Rol" fullWidth margin="normal"
                            defaultValue={editUser?.role ?? 'teacher'}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="teacher">O&apos;qituvchi</MenuItem>
                            <MenuItem value="student">Talaba</MenuItem>
                            <MenuItem value="parent">Ota-ona</MenuItem>
                        </TextField>
                        <TextField
                            {...editForm.register('lang')}
                            select label="Til" fullWidth margin="normal"
                            defaultValue={editUser?.lang ?? 'uz'}
                        >
                            <MenuItem value="uz">O&apos;zbek</MenuItem>
                            <MenuItem value="ru">Русский</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setEditUser(null)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="edit-user-form" variant="contained" disabled={editForm.formState.isSubmitting} sx={{ flex: 1 }}>
                        {editForm.formState.isSubmitting ? <CircularProgress size={18} sx={{ color: '#e0e7ff' }} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── Password Modal ───────────────────────────────────────────────── */}
            <Dialog open={!!passwordUser} onClose={() => setPasswordUser(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ti ti-key" style={{ fontSize: 18, color: '#fcd34d' }} />
                        </Box>
                        Parol o&apos;zgartirish
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {passwordUser && (
                        <Box sx={{ mb: 2, mt: 1, p: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>Foydalanuvchi</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{passwordUser.email}</Typography>
                        </Box>
                    )}
                    {error && <Alert severity="error" sx={{ mb: 2, background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}
                    <Box component="form" id="password-form" onSubmit={passwordForm.handleSubmit(handlePassword)} noValidate>
                        <TextField
                            {...passwordForm.register('newPassword')}
                            label="Yangi parol" type="password" fullWidth margin="normal"
                            error={!!passwordForm.formState.errors.newPassword}
                            helperText={passwordForm.formState.errors.newPassword?.message}
                        />
                        <TextField
                            {...passwordForm.register('confirmPassword')}
                            label="Parolni tasdiqlang" type="password" fullWidth margin="normal"
                            error={!!passwordForm.formState.errors.confirmPassword}
                            helperText={passwordForm.formState.errors.confirmPassword?.message}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setPasswordUser(null)} variant="outlined" sx={{ flex: 1 }}>Bekor qilish</Button>
                    <Button type="submit" form="password-form" variant="contained"
                            disabled={passwordForm.formState.isSubmitting}
                            sx={{ flex: 1, background: 'linear-gradient(135deg,#f59e0b,#d97706)', '&:hover': { background: 'linear-gradient(135deg,#d97706,#b45309)' } }}
                    >
                        {passwordForm.formState.isSubmitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Yangilash'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── Confirm Dialogs ──────────────────────────────────────────────── */}
            <ConfirmDialog
                open={!!toggleId}
                title={toggleActive ? 'Foydalanuvchini bloklash' : 'Faollashtirish'}
                message={toggleActive
                    ? 'Bu foydalanuvchini bloklashni tasdiqlaysizmi?'
                    : 'Bu foydalanuvchini faollashtirishni tasdiqlaysizmi?'}
                onConfirm={handleToggle}
                onClose={() => setToggleId(null)}
            />

            <ConfirmDialog
                open={!!deleteId}
                title="Foydalanuvchini o'chirish"
                message="Bu foydalanuvchini butunlay o'chirishni tasdiqlaysizmi? Bu amal qaytarilmaydi."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
            />
        </Box>
    );
}