'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    Divider,
} from '@mui/material';
import {
    Dashboard,
    People,
    Grade,
    EventAvailable,
    Assessment,
    AccountBalance,
    GroupWork,
    Book,
    CalendarMonth,
    ManageAccounts,
    History,
    School,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import { navItems } from '@/lib/navigation';
import { UserRole } from '@/types';

const DRAWER_WIDTH = 260;

const iconMap: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    people: <People />,
    grade: <Grade />,
    event_available: <EventAvailable />,
    assessment: <Assessment />,
    account_balance: <AccountBalance />,
    group_work: <GroupWork />,
    book: <Book />,
    calendar_month: <CalendarMonth />,
    manage_accounts: <ManageAccounts />,
    history: <History />,
};

const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    teacher: 'O\'qituvchi',
    student: 'Talaba',
    parent: 'Ota-ona',
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

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #2C3E50, #27AE60)',
                    color: 'white',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <School sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                            APAP
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Analytics Platform
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* User info */}
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            bgcolor: 'primary.main',
                            width: 36,
                            height: 36,
                            fontSize: 14,
                        }}
                    >
                        {user.email[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {roleLabels[user.role]}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Nav items */}
            <List sx={{ flex: 1, py: 1, overflow: 'auto' }}>
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <ListItem key={item.href} disablePadding sx={{ px: 1, mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                onClick={onClose}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '& .MuiListItemIcon-root': { color: 'white' },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 36,
                                        color: isActive ? 'white' : 'text.secondary',
                                    }}
                                >
                                    {iconMap[item.icon]}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    slotProps={{
                                        primary: {
                                            style: { fontSize: 14, fontWeight: isActive ? 600 : 400 },
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
            {/* Mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        border: 'none',
                        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}