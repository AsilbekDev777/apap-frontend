'use client';

import { useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Chip,
} from '@mui/material';
import { CloudUpload, FileDownload } from '@mui/icons-material';
import { studentsApi } from '@/lib/api/students.api';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportCsvModal({ open, onClose, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<{
        success: number;
        failed: number;
        errors: string[];
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const res = await studentsApi.importCsv(file);
            setResult(res);
            if (res.success > 0) onSuccess();
        } catch {
            setResult({ success: 0, failed: 1, errors: ['Import amalga oshmadi'] });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    const downloadTemplate = () => {
        const csv = 'email,password,firstName,lastName,studentNumber,groupId\nstudent@apap.uz,Password123!,Ism,Familya,21-001,GROUP_UUID';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>CSV Import</DialogTitle>

            <DialogContent>
                {/* Template */}
                <Button
                    startIcon={<FileDownload />}
                    size="small"
                    onClick={downloadTemplate}
                    sx={{ mb: 2 }}
                >
                    Template yuklab olish
                </Button>

                {/* Upload area */}
                <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        border: '2px dashed',
                        borderColor: file ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: file ? 'primary.50' : 'grey.50',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        hidden
                        onChange={handleFileChange}
                    />
                    <CloudUpload sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    {file ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {file.name}
                        </Typography>
                    ) : (
                        <Typography color="text.secondary">
                            CSV faylni tanlang yoki shu yerga tashlang
                        </Typography>
                    )}
                </Box>

                {/* Result */}
                {result && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                                label={`${result.success} muvaffaqiyatli`}
                                color="success"
                                size="small"
                            />
                            {result.failed > 0 && (
                                <Chip
                                    label={`${result.failed} xato`}
                                    color="error"
                                    size="small"
                                />
                            )}
                        </Box>

                        {result.errors.length > 0 && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                <List dense disablePadding>
                                    {result.errors.slice(0, 5).map((err, i) => (
                                        <ListItem key={i} disablePadding>
                                            <ListItemText
                                                primary={err}
                                                slotProps={{ primary: { style: { fontSize: 12 } } }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Yopish
                </Button>
                {!result && (
                    <Button
                        variant="contained"
                        disabled={!file || loading}
                        onClick={handleImport}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Import'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}