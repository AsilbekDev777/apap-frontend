'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Badge,
    IconButton,
    Popover,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    CircularProgress,
} from '@mui/material';
import { Notifications, NotificationsNone } from '@mui/icons-material';
import { useNotificationStore } from '@/store/notification.store';
import { notificationsApi } from '@/lib/api/notifications.api';

export default function NotificationsPanel() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [loading, setLoading] = useState(false);
    const { notifications, unreadCount, setNotifications, markAllRead } =
        useNotificationStore();

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await notificationsApi.getAll();
            setNotifications(data.notifications, data.unreadCount);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [setNotifications]);

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllRead();
            markAllRead();
        } catch {
            // silent
        }
    };

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    return (
        <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
                </Badge>
            </IconButton>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 360, maxHeight: 480, borderRadius: 3 } } }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: 16 }}>
                            Bildirishnomalar
                        </Typography>
                        {unreadCount > 0 && (
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.25,
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    borderRadius: 10,
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                }}
                            >
                                {unreadCount}
                            </Box>
                        )}
                    </Box>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Hammasini o&apos;qi
                        </Button>
                    )}
                </Box>

                {/* List */}
                {loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <NotificationsNone sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" variant="body2">
                            Bildirishnomalar yo&apos;q
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((n, idx) => (
                            <Box key={n.id}>
                                <ListItem
                                    sx={{
                                        bgcolor: n.isRead ? 'transparent' : 'action.hover',
                                        px: 2,
                                        py: 1.5,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    {!n.isRead && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                mt: 0.75,
                                                mr: 1.5,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    <ListItemText
                                        primary={n.titleUz}
                                        secondary={new Date(n.createdAt).toLocaleDateString('uz')}
                                        slotProps={{
                                            primary: {
                                                style: { fontSize: 13, fontWeight: n.isRead ? 400 : 600 },
                                            },
                                            secondary: {
                                                style: { fontSize: 11 },
                                            },
                                        }}
                                        sx={{ m: 0 }}
                                    />
                                </ListItem>
                                {idx < notifications.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}
            </Popover>
        </>
    );
}