'use client';

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Divider,
} from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import NotificationsPanel from './NotificationsPanel';

const DRAWER_WIDTH = 240;

const roleColors: Record<string, string> = {
    admin: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    teacher: 'linear-gradient(135deg, #06b6d4, #6366f1)',
    student: 'linear-gradient(135deg, #10b981, #06b6d4)',
    parent: 'linear-gradient(135deg, #f59e0b, #ef4444)',
};

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export default function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } finally {
            logout();
            router.push('/login');
        }
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '0.5px solid rgba(255,255,255,0.07)',
                boxShadow: 'none',
            }}
        >
            <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
                {/* Mobile menu */}
                <IconButton
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <i className="ti ti-menu-2" style={{ fontSize: 20, color: '#94a3b8' }} />
                </IconButton>

                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
                        {title}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Search */}
                    <IconButton
                        sx={{
                            width: 34,
                            height: 34,
                            background: 'rgba(255,255,255,0.05)',
                            border: '0.5px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <i className="ti ti-search" style={{ fontSize: 16, color: '#64748b' }} />
                    </IconButton>

                    {/* Notifications */}
                    <NotificationsPanel />

                    <Box
                        sx={{
                            width: '1px',
                            height: 20,
                            background: 'rgba(255,255,255,0.08)',
                            mx: 0.5,
                        }}
                    />

                    {/* User */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            px: 1,
                            py: 0.5,
                            borderRadius: '8px',
                            '&:hover': { background: 'rgba(255,255,255,0.05)' },
                        }}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <Avatar
                            sx={{
                                background: roleColors[user?.role ?? 'admin'],
                                width: 30,
                                height: 30,
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {user?.email[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography sx={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500, lineHeight: 1.2 }}>
                                {user?.email}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                                {user?.role}
                            </Typography>
                        </Box>
                        <i className="ti ti-chevron-down" style={{ fontSize: 14, color: '#64748b' }} />
                    </Box>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                minWidth: 180,
                                background: '#1e1b4b',
                                border: '0.5px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                            },
                        },
                    }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }} noWrap>
                            {user?.email}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#64748b' }}>
                            {user?.role}
                        </Typography>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                    <MenuItem
                        onClick={() => setAnchorEl(null)}
                        sx={{ fontSize: 13, color: '#e2e8f0', gap: 1.5 }}
                    >
                        <i className="ti ti-user" style={{ fontSize: 16, color: '#64748b' }} />
                        Profil
                    </MenuItem>
                    <MenuItem
                        onClick={handleLogout}
                        sx={{ fontSize: 13, color: '#f87171', gap: 1.5 }}
                    >
                        <i className="ti ti-logout" style={{ fontSize: 16 }} />
                        Chiqish
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}