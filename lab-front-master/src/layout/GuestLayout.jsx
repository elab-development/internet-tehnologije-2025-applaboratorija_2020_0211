import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';

export function GuestLayout() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)'
            }}
        >
            <AppBar
                position="sticky"
                sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 0 } }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ScienceIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" component="h1" fontWeight={700}>
                                ResearchHub
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Sistem za upravljanje istraživanjima
                            </Typography>
                        </Box>
                    </Container>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flex: 1, py: 6 }}>
                <Container maxWidth="lg">
                    <Outlet />
                </Container>
            </Box>

            <Box
                component="footer"
                sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    py: 3
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        © 2024 ResearchHub. Sva prava zadržana.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}