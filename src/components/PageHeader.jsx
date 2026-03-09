import { Box, Typography } from '@mui/material';

/**
 * Reusable komponenta za naslov stranice.
 * @param {string} title - Glavni naslov
 * @param {string} subtitle - Podnaslov (opcionalan)
 * @param {React.ReactNode} action - Dugme ili akcija desno (opcionalna)
 */
export function PageHeader({ title, subtitle, action }) {
    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={3}
        >
            <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body1" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {action && (
                <Box sx={{ flexShrink: 0, ml: 2 }}>
                    {action}
                </Box>
            )}
        </Box>
    );
}
