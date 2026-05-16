import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
        },
        background: {
            default: '#0f172a',
            paper: 'rgba(255,255,255,0.04)',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        divider: 'rgba(255,255,255,0.07)',
        success: { main: '#10b981', light: '#34d399', dark: '#059669' },
        warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
        error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
        info: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 10 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                    minHeight: '100vh',
                },
                '::-webkit-scrollbar': { width: '5px', height: '5px' },
                '::-webkit-scrollbar-track': { background: 'transparent' },
                '::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                },
                '::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255,255,255,0.2)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
                contained: {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: '#e2e8f0',
                    '&:hover': {
                        borderColor: '#6366f1',
                        background: 'rgba(99,102,241,0.1)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    boxShadow: 'none',
                    backdropFilter: 'blur(10px)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-root': {
                        background: 'rgba(255,255,255,0.04)',
                        color: '#94a3b8',
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
                    },
                },
            },
        },
        MuiTableBody: {
            styleOverrides: {
                root: {
                    '& .MuiTableRow-root': {
                        '&:hover': {
                            background: 'rgba(255,255,255,0.03)',
                        },
                    },
                    '& .MuiTableCell-root': {
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                        color: '#e2e8f0',
                    },
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: { background: 'transparent' },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                    },
                    '& .MuiInputLabel-root': { color: '#64748b' },
                    '& .MuiInputBase-input': { color: '#f1f5f9' },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                icon: { color: '#64748b' },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize: 13,
                    color: '#e2e8f0',
                    '&:hover': { background: 'rgba(99,102,241,0.1)' },
                    '&.Mui-selected': {
                        background: 'rgba(99,102,241,0.2)',
                        '&:hover': { background: 'rgba(99,102,241,0.25)' },
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: '#1e1b4b',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6, fontWeight: 500, fontSize: 11 },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    color: '#94a3b8',
                    '&:hover': { background: 'rgba(255,255,255,0.06)' },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: 'rgba(255,255,255,0.07)' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: '#1e1b4b',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 8 },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.06)',
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    '&.Mui-selected': {
                        background: 'rgba(99,102,241,0.2)',
                        color: '#c7d2fe',
                        borderColor: 'rgba(99,102,241,0.4)',
                    },
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: { color: '#94a3b8' },
                select: { color: '#e2e8f0' },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'rgba(15,23,42,0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
                    boxShadow: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '0.5px solid rgba(255,255,255,0.06)',
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    background: '#1e1b4b',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    background: '#334155',
                    color: '#f1f5f9',
                    fontSize: 11,
                    borderRadius: 6,
                },
            },
        },
    },
});