'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Download,
    Refresh,
    PictureAsPdf,
    TableChart,
} from '@mui/icons-material';
import { reportsApi, ReportJob } from '@/lib/api/reports.api';
import CreateReportModal from '@/components/reports/CreateReportModal';

const STATUS_CONFIG: {
    [key in 'pending' | 'processing' | 'ready' | 'failed']: {
        label: string;
        color: 'default' | 'info' | 'success' | 'error';
    };
} = {
    pending: { label: 'Kutmoqda', color: 'default' },
    processing: { label: 'Tayyorlanmoqda', color: 'info' },
    ready: { label: 'Tayyor', color: 'success' },
    failed: { label: 'Xato', color: 'error' },
};

const TYPE_LABELS = {
    student_card: 'Talaba kartochkasi',
    group_report: 'Guruh hisoboti',
};

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const loadReports = useCallback(async () => {
        try {
            const data = await reportsApi.getAll();
            setReports(data);

            // Pending/processing bo'lsa — polling
            const hasPending = data.some(
                (r) => r.status === 'pending' || r.status === 'processing',
            );

            if (hasPending && !pollingRef.current) {
                pollingRef.current = setInterval(() => {
                    void loadReports();
                }, 3000);
            } else if (!hasPending && pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadReports();
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [loadReports]);

    const handleDownload = async (report: ReportJob) => {
        if (report.status !== 'ready') return;
        setDownloading(report.id);
        try {
            const blob = await reportsApi.download(report.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${report.type}-${report.id.slice(0, 8)}.${
                report.format === 'pdf' ? 'pdf' : 'xlsx'
            }`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Reportlar
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Yangilash">
                        <IconButton onClick={loadReports}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        startIcon={<Add />}
                        variant="contained"
                        onClick={() => setCreateOpen(true)}
                    >
                        Yangi report
                    </Button>
                </Box>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Tur</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Holat</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Yaratilgan</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    Amallar
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            Reportlar yo&apos;q
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => {
                                    const statusConfig = STATUS_CONFIG[report.status];
                                    return (
                                        <TableRow
                                            key={report.id}
                                            hover
                                            sx={{ '&:last-child td': { border: 0 } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {TYPE_LABELS[report.type]}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={
                                                        report.format === 'pdf' ? (
                                                            <PictureAsPdf fontSize="small" />
                                                        ) : (
                                                            <TableChart fontSize="small" />
                                                        )
                                                    }
                                                    label={report.format.toUpperCase()}
                                                    size="small"
                                                    variant="outlined"
                                                    color={report.format === 'pdf' ? 'error' : 'success'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={statusConfig.label}
                                                        color={statusConfig.color}
                                                        size="small"
                                                    />
                                                    {(report.status === 'pending' ||
                                                        report.status === 'processing') && (
                                                        <CircularProgress size={14} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(report.createdAt).toLocaleString('uz')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip
                                                    title={
                                                        report.status === 'ready'
                                                            ? 'Yuklab olish'
                                                            : 'Hali tayyor emas'
                                                    }
                                                >
                          <span>
                            <IconButton
                                size="small"
                                color="primary"
                                disabled={
                                    report.status !== 'ready' ||
                                    downloading === report.id
                                }
                                onClick={() => handleDownload(report)}
                            >
                              {downloading === report.id ? (
                                  <CircularProgress size={16} />
                              ) : (
                                  <Download fontSize="small" />
                              )}
                            </IconButton>
                          </span>
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

            <CreateReportModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={loadReports}
            />
        </Box>
    );
}