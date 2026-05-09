'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    School,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';

const loginSchema = z.object({
    email: z.string().email('Email noto\'g\'ri'),
    password: z.string().min(6, 'Parol kamida 6 ta belgi'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Rol bo'yicha redirect
const roleRedirects: Record<string, string> = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
};

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setError('');
        try {
            const response = await authApi.login(data.email, data.password);
            setAuth(response.user, response.accessToken, response.refreshToken);

            const redirect = roleRedirects[response.user.role] ?? '/dashboard';
            router.push(redirect);
        } catch {
            setError('Email yoki parol noto\'g\'ri');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2C3E50 0%, #27AE60 100%)',
                p: 2,
            }}
        >
            <Card sx={{ width: '100%', maxWidth: 420 }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2C3E50, #27AE60)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <School sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Typography variant="h5" color="primary.main">
                            APAP
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Academic Performance Analytics
                        </Typography>
                    </Box>

                    {/* Error */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <Box
                        component="form"
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
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            {...register('password')}
                            label="Parol"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{ mt: 3, py: 1.5 }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Kirish'
                            )}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}