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
    ListItemIcon,
    Divider,
} from '@mui/material';
import { Menu as MenuIcon, Logout, Person } from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import NotificationsPanel from './NotificationsPanel';

const DRAWER_WIDTH = 260;

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export default function Header({ onMenuClick, title = 'APAP' }: HeaderProps) {
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
            elevation={0}
            sx={{
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
                bgcolor: 'white',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar>
                {/* Mobile menu */}
                <IconButton
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    {title}
                </Typography>

                {/* Notifications */}
                <NotificationsPanel />

                {/* User menu */}
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
                    <Avatar
                        sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}
                    >
                        {user?.email[0].toUpperCase()}
                    </Avatar>
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 180 } } }}
                >
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {user?.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => setAnchorEl(null)}>
                        <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                        Profil
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <Logout fontSize="small" color="error" />
                        </ListItemIcon>
                        Chiqish
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}