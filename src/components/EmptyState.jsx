import { Box, Typography, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * Reusable prikaz kada nema podataka.
 * @param {React.ReactNode} icon - Ikona (opcionalna, default: InboxIcon)
 * @param {string} title - Naslov
 * @param {string} subtitle - Podnaslov (opcionalan)
 * @param {React.ReactNode} action - Dugme ili akcija ispod (opcionalna)
 */
export function EmptyState({ icon, title, subtitle, action }) {
    return (
        <Paper
            sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'grey.50',
            }}
        >
            <Box sx={{ mb: 2, color: 'text.disabled' }}>
                {icon ?? <InboxIcon sx={{ fontSize: 64 }} />}
            </Box>

            <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
            </Typography>

            {subtitle && (
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                    {subtitle}
                </Typography>
            )}

            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Paper>
    );
}
