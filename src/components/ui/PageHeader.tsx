import {Box, Typography, Button} from '@mui/material';
import {Add} from '@mui/icons-material';

interface Action {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined';
}

interface Props {
    title: string,
    subtitle?: string
    actions?: Action[],
}

export default function PageHeader({title, actions = [], subtitle}: Props) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
            }}
        >
            <Typography variant="h5" sx={{fontWeight: 700}}>
                {title}
            </Typography>
            <Box sx={{display: 'flex', gap: 1}}>
                {actions.map((action, idx) => (
                    <Button
                        key={idx}
                        startIcon={action.icon ?? <Add/>}
                        variant={action.variant ?? 'contained'}
                        onClick={action.onClick}
                    >
                        {action.label}
                    </Button>
                ))}
            </Box>
        </Box>
    );
}