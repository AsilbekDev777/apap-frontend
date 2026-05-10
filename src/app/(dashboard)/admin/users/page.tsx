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
    MenuItem,
    Avatar,
} from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserRole } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import api from '@/lib/api/api';

const schema = z.object({
    email: z.string().email('Email noto\'g\'ri'),
    password: z.string().min(6, 'Kamida 6 ta belgi'),
    role: z.enum(['admin', 'teacher', 'student', 'parent']),
    lang: z.enum(['uz', 'ru']),
});

type FormData = {
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    lang: 'uz' | 'ru';
};

const ROLE_CONFIG: {
    [key in UserRole]: {
        label: string;
        color: 'default' | 'primary' | 'success' | 'warning';
    };
} = {
    admin: { label: 'Admin', color: 'primary' },
    teacher: { label: "O'qituvchi", color: 'success' },
    student: { label: 'Talaba', color: 'default' },
    parent: { label: 'Ota-ona', color: 'warning' },
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [toggleActive, setToggleActive] = useState(false);
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
            const { data } = await api.get<User[]>('/admin/users');
            setUsers(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handleOpen = () => {
        reset({ email: '', password: '', role: 'teacher', lang: 'uz' });
        setError('');
        setModalOpen(true);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setError('');
        try {
            await api.post('/admin/users', data);
            setModalOpen(false);
            void load();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? 'Xato yuz berdi';
            setError(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleToggle = async () => {
        if (!toggleId) return;
        try {
            await api.put(`/admin/users/${toggleId}/toggle-status`);
            setToggleId(null);
            void load();
        } catch {
            // silent
        }
    };

    return (
        <Box>
            <PageHeader
                title="Foydalanuvchilar"
                actions={[{ label: 'Yangi foydalanuvchi', onClick: handleOpen }]}
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Foydalanuvchi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Til</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Holat</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>So`nggi kirish</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    Amallar
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Foydalanuvchilar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => {
                                    const roleConfig = ROLE_CONFIG[user.role];
                                    return (
                                        <TableRow
                                            key={user.id}
                                            hover
                                            sx={{ '&:last-child td': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            bgcolor: 'primary.main',
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {user.email[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={roleConfig.label}
                                                    color={roleConfig.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.lang.toUpperCase()}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {user.isActive ? (
                                                    <Chip label="Faol" color="success" size="small" />
                                                ) : (
                                                    <Chip label="Bloklangan" color="error" size="small" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.lastLogin
                                                        ? new Date(user.lastLogin).toLocaleString('uz')
                                                        : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip
                                                    title={user.isActive ? 'Bloklash' : 'Faollashtirish'}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        color={user.isActive ? 'error' : 'success'}
                                                        onClick={() => {
                                                            setToggleId(user.id);
                                                            setToggleActive(user.isActive);
                                                        }}
                                                    >
                                                        {user.isActive ? (
                                                            <Block fontSize="small" />
                                                        ) : (
                                                            <CheckCircle fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Create Modal */}
            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Yangi foydalanuvchi</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                    <Box
                        component="form"
                        id="user-form"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
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
                            {...register('role')}
                            select
                            label="Rol"
                            fullWidth
                            margin="normal"
                            error={!!errors.role}
                            helperText={errors.role?.message}
                            defaultValue="teacher"
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="teacher">O&apos;qituvchi</MenuItem>
                            <MenuItem value="student">Talaba</MenuItem>
                            <MenuItem value="parent">Ota-ona</MenuItem>
                        </TextField>
                        <TextField
                            {...register('lang')}
                            select
                            label="Til"
                            fullWidth
                            margin="normal"
                            defaultValue="uz"
                        >
                            <MenuItem value="uz">O&apos;zbek</MenuItem>
                            <MenuItem value="ru">Русский</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setModalOpen(false)} color="inherit">
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        form="user-form"
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

            <ConfirmDialog
                open={!!toggleId}
                title={toggleActive ? 'Foydalanuvchini bloklash' : 'Faollashtirish'}
                message={
                    toggleActive
                        ? 'Bu foydalanuvchini bloklashni tasdiqlaysizmi?'
                        : 'Bu foydalanuvchini faollashtirishni tasdiqlaysizmi?'
                }
                onConfirm={handleToggle}
                onClose={() => setToggleId(null)}
            />
        </Box>
    );
}