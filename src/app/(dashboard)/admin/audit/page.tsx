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
    Chip,
    TextField,
    MenuItem,
    TablePagination,
    Collapse,
    IconButton,
} from '@mui/material';
import {Grid} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import api from '@/lib/api/api';
import PageHeader from '@/components/ui/PageHeader';

interface AuditLog {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
    user?: { email: string };
}

interface AuditResponse {
    data: AuditLog[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const ACTION_CONFIG: {
    [key: string]: {
        label: string;
        color: 'success' | 'warning' | 'error' | 'default';
    };
} = {
    CREATE: { label: 'Yaratish', color: 'success' },
    UPDATE: { label: 'Yangilash', color: 'warning' },
    DELETE: { label: "O'chirish", color: 'error' },
};

function AuditRow({ log }: { log: AuditLog }) {
    const [open, setOpen] = useState(false);
    const actionConfig = ACTION_CONFIG[log.action] ?? {
        label: log.action,
        color: 'default' as const,
    };

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? (
                            <KeyboardArrowUp fontSize="small" />
                        ) : (
                            <KeyboardArrowDown fontSize="small" />
                        )}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {new Date(log.createdAt).toLocaleString('uz')}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {log.user?.email ?? '—'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Chip
                        label={actionConfig.label}
                        color={actionConfig.color}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                    <Chip label={log.entityType} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {log.ipAddress ?? '—'}
                    </Typography>
                </TableCell>
            </TableRow>

            {/* Collapsible detail */}
            <TableRow>
                <TableCell colSpan={6} sx={{ py: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 3 }}>
                            {log.newValue && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Yangi qiymat:
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            mt: 0.5,
                                            p: 1.5,
                                            bgcolor: 'grey.50',
                                            borderRadius: 1,
                                            fontSize: 12,
                                            overflow: 'auto',
                                        }}
                                    >
                                        {JSON.stringify(log.newValue, null, 2)}
                                    </Box>
                                </Box>
                            )}
                            {log.oldValue && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Eski qiymat:
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            mt: 0.5,
                                            p: 1.5,
                                            bgcolor: 'grey.50',
                                            borderRadius: 1,
                                            fontSize: 12,
                                            overflow: 'auto',
                                        }}
                                    >
                                        {JSON.stringify(log.oldValue, null, 2)}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [action, setAction] = useState('');
    const [entityType, setEntityType] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<AuditResponse>('/admin/audit', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    action: action || undefined,
                    entityType: entityType || undefined,
                },
            });
            setLogs(data.data);
            setTotal(data.meta.total);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, action, entityType]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <Box>
            <PageHeader title="Audit log" />

            {/* Filters */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            label="Amal"
                            fullWidth
                            size="small"
                            value={action}
                            onChange={(e) => {
                                setAction(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="">Hammasi</MenuItem>
                            <MenuItem value="CREATE">Yaratish</MenuItem>
                            <MenuItem value="UPDATE">Yangilash</MenuItem>
                            <MenuItem value="DELETE">O&apos;chirish</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Entity turi"
                            fullWidth
                            size="small"
                            value={entityType}
                            onChange={(e) => {
                                setEntityType(e.target.value);
                                setPage(0);
                            }}
                            placeholder="students, grades..."
                        />
                    </Grid>
                </Grid>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell width={48} />
                                <TableCell sx={{ fontWeight: 600 }}>Vaqt</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Foydalanuvchi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amal</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Loglar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => <AuditRow key={log.id} log={log} />)
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[25, 50, 100]}
                    labelRowsPerPage="Qatorlar:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
                />
            </Card>
        </Box>
    );
}