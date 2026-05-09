'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    InputAdornment,
    Tooltip,
    CircularProgress,
    Avatar,
} from '@mui/material';
import {
    Add,
    Search,
    Upload,
    Delete,
    Edit,
    Person,
} from '@mui/icons-material';
import { studentsApi } from '@/lib/api/students.api';
import { Student } from '@/types';
import CreateStudentModal from '@/components/students/CreateStudentModal';
import ImportCsvModal from '@/components/students/ImportCsvModal';

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const loadStudents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await studentsApi.getAll({
                search: search || undefined,
                page: page + 1,
                limit: rowsPerPage,
            });
            setStudents(data.data);
            setTotal(data.meta.total);
        } finally {
            setLoading(false);
        }
    }, [search, page, rowsPerPage]);

    useEffect(() => {
        void loadStudents();
    }, [loadStudents]);

    // Search debounce
    useEffect(() => {
        setPage(0);
    }, [search]);

    const handleDelete = async (id: string) => {
        if (!confirm('Talabani o\'chirmoqchimisiz?')) return;
        try {
            await studentsApi.remove(id);
            void loadStudents();
        } catch {
            // silent
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
                    Talabalar
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        startIcon={<Upload />}
                        variant="outlined"
                        onClick={() => setImportOpen(true)}
                    >
                        CSV Import
                    </Button>
                    <Button
                        startIcon={<Add />}
                        variant="contained"
                        onClick={() => setCreateOpen(true)}
                    >
                        Yangi talaba
                    </Button>
                </Box>
            </Box>

            <Card>
                {/* Search */}
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        placeholder="Ism, familya, talaba raqami yoki email bo'yicha qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        sx={{ width: 400 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Talaba</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Talaba raqami</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Guruh</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Fakultet</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                    Amallar
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="text.secondary">
                                            Talabalar topilmadi
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        sx={{ '&:last-child td': { border: 0 } }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 34,
                                                        height: 34,
                                                        bgcolor: 'primary.main',
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {student.lastName} {student.firstName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.studentNumber}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {student.group?.name ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {student.group?.faculty?.nameUz ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {student.user?.email ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Tahrirlash">
                                                <IconButton size="small" color="primary">
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="O'chirish">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(student.id)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
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
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="Qatorlar:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} / ${count}`
                    }
                />
            </Card>

            {/* Modals */}
            <CreateStudentModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={loadStudents}
            />
            <ImportCsvModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={loadStudents}
            />
        </Box>
    );
}