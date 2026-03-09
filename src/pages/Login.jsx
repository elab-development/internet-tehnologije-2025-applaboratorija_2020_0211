import { useState, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container,
    Link,
    Tooltip,
} from '@mui/material';
import { Security } from '@mui/icons-material';
import axiosClient from '../axiosClient.js';
import { useStateContext } from '../context/ContextProvider.jsx';
import { useRecaptcha } from '../hooks/useRecaptcha.js'; // ← NOVO
import { RECAPTCHA_CONFIG } from '../config/externalApis.js'; // ← NOVO

export function Login() {
    const navigate = useNavigate();
    const { setUser, setToken } = useStateContext();
    const { getToken, isReady } = useRecaptcha(); // ← NOVO

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);

            try {
                // ─── Korak 1: Dohvati reCAPTCHA token (Eksterni API #1) ───
                const recaptchaToken = await getToken(
                    RECAPTCHA_CONFIG.actions.LOGIN
                );

                // ─── Korak 2: Pošalji login zahtev sa tokenom ─────────────
                // Backend verifikuje token sa Google API-jem pre prijave.
                // Ako reCAPTCHA nije spreman (dev mode bez ključa),
                // token je null i backend može da preskoči verifikaciju.
                const { data } = await axiosClient.post('/login', {
                    email,
                    password,
                    recaptcha_token: recaptchaToken, // ← šaljemo token
                });

                setToken(data.token);
                setUser(data.user);
                navigate(`/autenticate/${data.user.role}`);
            } catch (err) {
                setError(
                    err.response?.data?.message || 'Neispravni kredencijali.'
                );
            } finally {
                setLoading(false);
            }
        },
        [email, password, getToken, navigate, setToken, setUser]
    );

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 16rem)',
                    py: 4,
                }}
            >
                <Card sx={{ width: '100%', boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            fontWeight={600}
                        >
                            Prijavite se
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Unesite svoje kredencijale da biste pristupili
                            sistemu
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}
                            >
                                {error && (
                                    <Alert severity="error">{error}</Alert>
                                )}

                                <TextField
                                    label="Email"
                                    type="email"
                                    placeholder="vase.ime@research.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    fullWidth
                                    variant="outlined"
                                    autoComplete="email"
                                />

                                <TextField
                                    label="Lozinka"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    disabled={loading}
                                    fullWidth
                                    variant="outlined"
                                    autoComplete="current-password"
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        ) : null
                                    }
                                >
                                    {loading
                                        ? 'Prijavljivanje...'
                                        : 'Prijavite se'}
                                </Button>

                                {/* ─── reCAPTCHA indikator ───────────────── */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={0.5}
                                >
                                    <Tooltip
                                        title={
                                            isReady
                                                ? 'Forma je zaštićena sa Google reCAPTCHA v3'
                                                : 'reCAPTCHA se inicijalizuje...'
                                        }
                                    >
                                        <Security
                                            fontSize="small"
                                            color={
                                                isReady ? 'success' : 'disabled'
                                            }
                                        />
                                    </Tooltip>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                    >
                                        Zaštićeno sa reCAPTCHA v3
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="body2"
                                    textAlign="center"
                                    color="text.secondary"
                                >
                                    Nemate nalog?{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/register"
                                        underline="hover"
                                        fontWeight={500}
                                    >
                                        Registrujte se
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
