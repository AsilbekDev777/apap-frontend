'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, CircularProgress,
    TextField, MenuItem, TablePagination, Collapse, IconButton,Grid
} from '@mui/material';
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
    meta: { total: number; page: number; limit: number };
}

const ACTION_CONFIG: { [key: string]: { label: string; bg: string; color: string } } = {
    CREATE: { label: 'Yaratish', bg: 'rgba(134,239,172,0.12)', color: '#86efac' },
    UPDATE: { label: 'Yangilash', bg: 'rgba(252,211,77,0.12)', color: '#fcd34d' },
    DELETE: { label: "O'chirish", bg: 'rgba(252,165,165,0.12)', color: '#fca5a5' },
};

function AuditRow({ log }: { log: AuditLog }) {
    const [open, setOpen] = useState(false);
    const actionCfg = ACTION_CONFIG[log.action] ?? { label: log.action, bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' };

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}
                                sx={{ color: '#64748b', '&:hover': { color: '#a5b4fc' } }}>
                        <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14 }} />
                    </IconButton>
                </TableCell>
                <TableCell><Typography sx={{ fontSize: 12, color: '#64748b' }}>{new Date(log.createdAt).toLocaleString('uz')}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{log.user?.email ?? '—'}</Typography></TableCell>
                <TableCell>
                    <Box sx={{ display: 'inline-flex', background: actionCfg.bg, color: actionCfg.color, fontSize: 11, fontWeight: 500, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                        {actionCfg.label}
                    </Box>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'inline-flex', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: 11, px: 1.5, py: 0.5, borderRadius: '6px' }}>
                        {log.entityType}
                    </Box>
                </TableCell>
                <TableCell><Typography sx={{ fontSize: 12, color: '#475569' }}>{log.ipAddress ?? '—'}</Typography></TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 3 }}>
                            {log.newValue && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography sx={{ fontSize: 11, color: '#64748b', mb: 0.5, fontWeight: 500 }}>Yangi qiymat:</Typography>
                                    <Box component="pre" sx={{ p: 1.5, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: 12, color: '#a5b4fc', overflow: 'auto' }}>
                                        {JSON.stringify(log.newValue, null, 2)}
                                    </Box>
                                </Box>
                            )}
                            {log.oldValue && (
                                <Box>
                                    <Typography sx={{ fontSize: 11, color: '#64748b', mb: 0.5, fontWeight: 500 }}>Eski qiymat:</Typography>
                                    <Box component="pre" sx={{ p: 1.5, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: 12, color: '#94a3b8', overflow: 'auto' }}>
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
                params: { page: page + 1, limit: rowsPerPage, action: action || undefined, entityType: entityType || undefined },
            });
            setLogs(data.data); setTotal(data.meta.total);
        } finally { setLoading(false); }
    }, [page, rowsPerPage, action, entityType]);

    useEffect(() => { void load(); }, [load]);

    return (
        <Box>
            <PageHeader title="Audit log" subtitle="Tizim harakatlari tarixi" />

            <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField select label="Amal" fullWidth size="small" value={action} onChange={(e) => { setAction(e.target.value); setPage(0); }}>
                            <MenuItem value="">Hammasi</MenuItem>
                            <MenuItem value="CREATE">Yaratish</MenuItem>
                            <MenuItem value="UPDATE">Yangilash</MenuItem>
                            <MenuItem value="DELETE">O&apos;chirish</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Entity turi" fullWidth size="small" value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(0); }} placeholder="students, grades..." />
                    </Grid>
                </Grid>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width={48} />
                                <TableCell>Vaqt</TableCell>
                                <TableCell>Foydalanuvchi</TableCell>
                                <TableCell>Amal</TableCell>
                                <TableCell>Entity</TableCell>
                                <TableCell>IP</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                </TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <i className="ti ti-history-off" style={{ fontSize: 40, color: '#334155', display: 'block', marginBottom: 8 }} />
                                    <Typography sx={{ color: '#475569' }}>Loglar topilmadi</Typography>
                                </TableCell></TableRow>
                            ) : (
                                logs.map((log) => <AuditRow key={log.id} log={log} />)
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div" count={total} page={page} rowsPerPage={rowsPerPage}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                    rowsPerPageOptions={[25, 50, 100]}
                    labelRowsPerPage="Qatorlar:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
                    sx={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', color: '#64748b' }}
                />
            </Card>
        </Box>
    );
}