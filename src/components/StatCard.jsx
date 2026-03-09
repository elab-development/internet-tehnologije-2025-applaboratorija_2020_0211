import { Card, CardContent, Box, Typography } from '@mui/material';

/**
 * Reusable kartica za prikaz statistike sa gradijentom.
 * @param {string} title - Naziv statistike
 * @param {number|string} value - Vrednost koja se prikazuje
 * @param {React.ReactNode} icon - MUI ikona
 * @param {string} gradient - CSS gradient string (default: plavo-ljubičasti)
 */
export function StatCard({ title, value, icon, gradient }) {
    const defaultGradient =
        'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)';

    return (
        <Card
            sx={{
                background: gradient || defaultGradient,
                color: 'white',
                borderRadius: 3,
                boxShadow: 3,
            }}
        >
            <CardContent>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            {value ?? 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {title}
                        </Typography>
                    </Box>

                    {icon && (
                        <Box sx={{ fontSize: 48, opacity: 0.8 }}>
                            {icon}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
