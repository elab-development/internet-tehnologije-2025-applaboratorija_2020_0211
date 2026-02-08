import { useState } from 'react';
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
    Link
} from '@mui/material';
import axiosClient from "../axiosClient.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export function Register() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {setUser,setToken}=useStateContext();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = { name, email, password, role };

        axiosClient.post('/register', payload)
            .then(({ data }) => {
                setUser(data.user);
                setToken(data.token);
                navigate(`/autenticate/${data.user.role}`);
            })
            .catch(err => {
                setError(
                    err.response?.data?.message || 'Došlo je do greške prilikom registracije.'
                );
            })
            .finally(() => setLoading(false));
    };


    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 16rem)',
                    py: 4
                }}
            >
                <Card sx={{ width: '100%', boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                            Registracija
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Kreirajte nalog za pristup ResearchHub sistemu
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {error && (
                                    <Alert severity="error">
                                        {error}
                                    </Alert>
                                )}

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ime"
                                            placeholder="Petar"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            disabled={loading}
                                            fullWidth
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Prezime"
                                            placeholder="Petrović"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            disabled={loading}
                                            fullWidth
                                            variant="outlined"
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
                                />

                                <TextField
                                    label="Lozinka"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    fullWidth
                                    variant="outlined"
                                    inputProps={{ minLength: 6 }}
                                />

                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="role-label">Tip naloga</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        label="Tip naloga"
                                        disabled={loading}
                                    >
                                        <MenuItem value="user">User - Korisnik</MenuItem>
                                        <MenuItem value="researcher">Researcher - Istraživač</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        User može pregledati radove i projekte. Researcher može kreirati i upravljati sadržajem.
                                    </FormHelperText>
                                </FormControl>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                                >
                                    {loading ? 'Učitavanje...' : 'Registrujte se'}
                                </Button>

                                <Typography variant="body2" textAlign="center" color="text.secondary">
                                    Već imate nalog?{' '}
                                    <Link component={RouterLink} to="/login" underline="hover" fontWeight={500}>
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