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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Container,
    Grid,
    Link,
    Tooltip,
} from '@mui/material';
import { Security } from '@mui/icons-material';
import axiosClient from '../axiosClient.js';
import { useStateContext } from "../context/useStateContext.js";
import { useRecaptcha } from '../hooks/useRecaptcha.js'; // ← NOVO
import { RECAPTCHA_CONFIG } from '../config/externalApis.js'; // ← NOVO

export function Register() {
    const navigate = useNavigate();
    const { setUser, setToken } = useStateContext();
    const { getToken, isReady } = useRecaptcha(); // ← NOVO

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError('');

            // Validacija
            if (!firstName.trim() || !lastName.trim()) {
                setError('Ime i prezime su obavezni.');
                return;
            }
            if (password.length < 6) {
                setError('Lozinka mora imati najmanje 6 karaktera.');
                return;
            }

            setLoading(true);

            try {
                // ─── Korak 1: Dohvati reCAPTCHA token (Eksterni API #1) ───
                const recaptchaToken = await getToken(
                    RECAPTCHA_CONFIG.actions.REGISTER
                );

                // ─── Korak 2: Pošalji register zahtev sa tokenom ──────────
                // Backend:
                //   1. Verifikuje recaptcha_token sa Google API-jem
                //   2. Kreira korisnika
                //   3. Šalje welcome email putem Resend (Eksterni API #2)
                const name = `${firstName.trim()} ${lastName.trim()}`;

                const { data } = await axiosClient.post('/register', {
                    name,
                    email,
                    password,
                    role,
                    recaptcha_token: recaptchaToken, // ← šaljemo token
                });

                setUser(data.user);
                setToken(data.token);
                navigate(`/autenticate/${data.user.role}`);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        'Došlo je do greške prilikom registracije.'
                );
            } finally {
                setLoading(false);
            }
        },
        [
            firstName,
            lastName,
            email,
            password,
            role,
            getToken,
            navigate,
            setUser,
            setToken,
        ]
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
                            Registracija
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Kreirajte nalog za pristup ResearchHub sistemu
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

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ime"
                                            placeholder="Petar"
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(e.target.value)
                                            }
                                            required
                                            disabled={loading}
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="given-name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Prezime"
                                            placeholder="Petrović"
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(e.target.value)
                                            }
                                            required
                                            disabled={loading}
                                            fullWidth
                                            variant="outlined"
                                            autoComplete="family-name"
                                        />
                                    </Grid>
                                </Grid>

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
                                    inputProps={{ minLength: 6 }}
                                    helperText="Minimalno 6 karaktera"
                                    autoComplete="new-password"
                                />

                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="role-label">
                                        Tip naloga
                                    </InputLabel>
                                    <Select
                                        labelId="role-label"
                                        value={role}
                                        onChange={(e) =>
                                            setRole(e.target.value)
                                        }
                                        label="Tip naloga"
                                        disabled={loading}
                                    >
                                        <MenuItem value="user">
                                            User – Korisnik
                                        </MenuItem>
                                        <MenuItem value="researcher">
                                            Researcher – Istraživač
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        User može pregledati radove i projekte.
                                        Researcher može kreirati i upravljati
                                        sadržajem.
                                    </FormHelperText>
                                </FormControl>

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
                                        ? 'Registracija...'
                                        : 'Registrujte se'}
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
                                    Već imate nalog?{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/login"
                                        underline="hover"
                                        fontWeight={500}
                                    >
                                        Prijavite se
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
