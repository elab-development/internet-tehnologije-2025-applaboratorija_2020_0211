import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Grid,
    Avatar,
    Divider,
    CircularProgress,
} from '@mui/material';
import { Save, Lock } from '@mui/icons-material';
import { PageHeader } from '../components/index.js';
import axiosClient from '../axiosClient.js';
import { useStateContext } from "../context/useStateContext.js";

export function Profile() {
    const { user, setUser } = useStateContext();

    // Forma za lične podatke
    const [nameForm, setNameForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    // Forma za lozinku
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [infoLoading, setInfoLoading] = useState(false);
    const [infoSuccess, setInfoSuccess] = useState('');
    const [infoError, setInfoError] = useState('');

    const [passLoading, setPassLoading] = useState(false);
    const [passSuccess, setPassSuccess] = useState('');
    const [passError, setPassError] = useState('');

    // Ažuriranje imena i emaila
    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setInfoError('');
        setInfoSuccess('');
        setInfoLoading(true);

        try {
            const { data } = await axiosClient.put('/profile', {
                name: nameForm.name.trim(),
                email: nameForm.email.trim(),
            });
            setUser(data.user ?? data);
            setInfoSuccess('Podaci uspešno ažurirani!');
        } catch (err) {
            setInfoError(
                err.response?.data?.message ||
                    'Greška pri ažuriranju podataka.'
            );
        } finally {
            setInfoLoading(false);
        }
    };

    // Promena lozinke
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');

        if (
            passwordForm.password !== passwordForm.password_confirmation
        ) {
            setPassError('Lozinke se ne podudaraju.');
            return;
        }
        if (passwordForm.password.length < 6) {
            setPassError('Lozinka mora imati najmanje 6 karaktera.');
            return;
        }

        setPassLoading(true);
        try {
            await axiosClient.put('/profile/password', {
                current_password: passwordForm.current_password,
                password: passwordForm.password,
                password_confirmation: passwordForm.password_confirmation,
            });
            setPassSuccess('Lozinka uspešno promenjena!');
            setPasswordForm({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
        } catch (err) {
            setPassError(
                err.response?.data?.message ||
                    'Greška pri promeni lozinke.'
            );
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Moj profil"
                subtitle="Upravljajte svojim ličnim podacima i lozinkom."
            />

            <Grid container spacing={3}>
                {/* ===== LIČNI PODACI ===== */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            {/* Avatar prikaz */}
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                mb={3}
                            >
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        background:
                                            'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                                        fontSize: 28,
                                        fontWeight: 700,
                                    }}
                                >
                                    {user?.name?.[0]?.toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                    >
                                        {user?.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ textTransform: 'capitalize' }}
                                    >
                                        {user?.role}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Lični podaci
                            </Typography>

                            <form onSubmit={handleUpdateInfo}>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={2}
                                >
                                    {infoSuccess && (
                                        <Alert severity="success">
                                            {infoSuccess}
                                        </Alert>
                                    )}
                                    {infoError && (
                                        <Alert severity="error">
                                            {infoError}
                                        </Alert>
                                    )}

                                    <TextField
                                        label="Ime i prezime"
                                        fullWidth
                                        value={nameForm.name}
                                        onChange={(e) =>
                                            setNameForm({
                                                ...nameForm,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                    />

                                    <TextField
                                        label="Email adresa"
                                        type="email"
                                        fullWidth
                                        value={nameForm.email}
                                        onChange={(e) =>
                                            setNameForm({
                                                ...nameForm,
                                                email: e.target.value,
                                            })
                                        }
                                        required
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={
                                            infoLoading ? (
                                                <CircularProgress
                                                    size={18}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <Save />
                                            )
                                        }
                                        disabled={infoLoading}
                                    >
                                        {infoLoading
                                            ? 'Čuvanje...'
                                            : 'Sačuvaj izmene'}
                                    </Button>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ===== PROMENA LOZINKE ===== */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={3}
                            >
                                <Lock color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    Promena lozinke
                                </Typography>
                            </Box>

                            <form onSubmit={handleUpdatePassword}>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={2}
                                >
                                    {passSuccess && (
                                        <Alert severity="success">
                                            {passSuccess}
                                        </Alert>
                                    )}
                                    {passError && (
                                        <Alert severity="error">
                                            {passError}
                                        </Alert>
                                    )}

                                    <TextField
                                        label="Trenutna lozinka"
                                        type="password"
                                        fullWidth
                                        value={
                                            passwordForm.current_password
                                        }
                                        onChange={(e) =>
                                            setPasswordForm({
                                                ...passwordForm,
                                                current_password:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />

                                    <TextField
                                        label="Nova lozinka"
                                        type="password"
                                        fullWidth
                                        value={passwordForm.password}
                                        onChange={(e) =>
                                            setPasswordForm({
                                                ...passwordForm,
                                                password: e.target.value,
                                            })
                                        }
                                        required
                                        inputProps={{ minLength: 6 }}
                                        helperText="Minimalno 6 karaktera"
                                    />

                                    <TextField
                                        label="Potvrdi novu lozinku"
                                        type="password"
                                        fullWidth
                                        value={
                                            passwordForm.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setPasswordForm({
                                                ...passwordForm,
                                                password_confirmation:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="warning"
                                        startIcon={
                                            passLoading ? (
                                                <CircularProgress
                                                    size={18}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <Lock />
                                            )
                                        }
                                        disabled={passLoading}
                                    >
                                        {passLoading
                                            ? 'Čuvanje...'
                                            : 'Promeni lozinku'}
                                    </Button>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
