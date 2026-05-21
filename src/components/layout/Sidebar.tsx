'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Avatar,
    Divider,
    Chip,
} from '@mui/material';
import { useAuthStore } from '@/store/auth.store';
import { navItems } from '@/lib/navigation';
import { UserRole } from '@/types';

const DRAWER_WIDTH = 240;

// Tabler icons mapping
const iconMap: Record<string, string> = {
    dashboard: 'ti-layout-dashboard',
    people: 'ti-users',
    grade: 'ti-certificate',
    event_available: 'ti-calendar-check',
    assessment: 'ti-report-analytics',
    account_balance: 'ti-building',
    group_work: 'ti-school',
    book: 'ti-book',
    calendar_month: 'ti-calendar',
    manage_accounts: 'ti-user-cog',
    history: 'ti-shield-lock',
};

const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    teacher: "O'qituvchi",
    student: 'Talaba',
    parent: 'Ota-ona',
};

const roleColors: Record<UserRole, string> = {
    admin: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    teacher: 'linear-gradient(135deg, #06b6d4, #6366f1)',
    student: 'linear-gradient(135deg, #10b981, #06b6d4)',
    parent: 'linear-gradient(135deg, #f59e0b, #ef4444)',
};

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();

    if (!user) return null;

    const items = navItems[user.role] ?? [];

    // Nav items ni bo'limlarga ajratish
    const mainItems = items.slice(0, 5);
    const managementItems = items.slice(5);

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,27,75,0.98) 100%)',
            }}
        >
            {/* Logo */}
            <Box sx={{ p: 2.5, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                        }}
                    >
                        <Typography sx={{ color: '#e0e7ff', fontWeight: 700, fontSize: 15 }}>A</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
                            APAP
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: 10 }}>
                            Analytics Platform
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* User info */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            background: roleColors[user.role],
                            width: 32,
                            height: 32,
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        {user.email[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography
                            sx={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}
                            noWrap
                        >
                            {user.email}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: 10 }}>
                            {roleLabels[user.role]}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Nav items */}
            <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5, px: 1 }}>
                {/* Asosiy */}
                <Typography
                    sx={{
                        fontSize: 9,
                        color: '#475569',
                        px: 1,
                        mb: 0.5,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                    }}
                >
                    Asosiy
                </Typography>
                <List disablePadding sx={{ mb: 1.5 }}>
                    {mainItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    onClick={onClose}
                                    sx={{
                                        borderRadius: '8px',
                                        py: 0.9,
                                        px: 1,
                                        background: isActive
                                            ? 'rgba(99,102,241,0.18)'
                                            : 'transparent',
                                        border: isActive
                                            ? '0.5px solid rgba(99,102,241,0.3)'
                                            : '0.5px solid transparent',
                                        '&:hover': {
                                            background: isActive
                                                ? 'rgba(99,102,241,0.22)'
                                                : 'rgba(255,255,255,0.04)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            mr: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 20,
                                        }}
                                    >
                                        <i
                                            className={`ti ${iconMap[item.icon] ?? 'ti-circle'}`}
                                            style={{
                                                fontSize: 17,
                                                color: isActive ? '#a5b4fc' : '#64748b',
                                            }}
                                        />
                                    </Box>
                                    <ListItemText
                                        primary={item.label}
                                        slotProps={{
                                            primary: {
                                                style: {
                                                    fontSize: 12,
                                                    fontWeight: isActive ? 500 : 400,
                                                    color: isActive ? '#c7d2fe' : '#94a3b8',
                                                },
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* Boshqaruv */}
                {managementItems.length > 0 && (
                    <>
                        <Typography
                            sx={{
                                fontSize: 9,
                                color: '#475569',
                                px: 1,
                                mb: 0.5,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            Boshqaruv
                        </Typography>
                        <List disablePadding>
                            {managementItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                                        <ListItemButton
                                            component={Link}
                                            href={item.href}
                                            onClick={onClose}
                                            sx={{
                                                borderRadius: '8px',
                                                py: 0.9,
                                                px: 1,
                                                background: isActive
                                                    ? 'rgba(99,102,241,0.18)'
                                                    : 'transparent',
                                                border: isActive
                                                    ? '0.5px solid rgba(99,102,241,0.3)'
                                                    : '0.5px solid transparent',
                                                '&:hover': {
                                                    background: isActive
                                                        ? 'rgba(99,102,241,0.22)'
                                                        : 'rgba(255,255,255,0.04)',
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    mr: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 20,
                                                }}
                                            >
                                                <i
                                                    className={`ti ${iconMap[item.icon] ?? 'ti-circle'}`}
                                                    style={{
                                                        fontSize: 17,
                                                        color: isActive ? '#a5b4fc' : '#64748b',
                                                    }}
                                                />
                                            </Box>
                                            <ListItemText
                                                primary={item.label}
                                                slotProps={{
                                                    primary: {
                                                        style: {
                                                            fontSize: 12,
                                                            fontWeight: isActive ? 500 : 400,
                                                            color: isActive ? '#c7d2fe' : '#94a3b8',
                                                        },
                                                    },
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </>
                )}
            </Box>

            {/* Bottom */}
            <Box sx={{ p: 1.5, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <Box
                    sx={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '0.5px solid rgba(99,102,241,0.2)',
                        borderRadius: '8px',
                        p: 1.5,
                    }}
                >
                    <Typography sx={{ fontSize: 11, color: '#a5b4fc', fontWeight: 500 }}>
                        APAP v1.0
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#475569', mt: 0.3 }}>
                        Academic Analytics
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
                        border: 'none',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
                        border: 'none',
                        boxShadow: '1px 0 20px rgba(0,0,0,0.3)',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}