import { useState } from "react";
import {
    useNavigate,
    Link as RouterLink,
} from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Container,
    Link,
} from "@mui/material";
import axiosClient from "../axiosClient.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser, setToken } = useStateContext();


    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        axiosClient.post("/login", { email, password })
            .then(({ data }) => {
                setToken(data.token);
                setUser(data.user);
                navigate(`/autenticate/${data.user.role}`);

            })
            .catch(err => {
                setError(
                    err.response?.data?.message || 'Neispravni kredencijali.'
                );
            })
            .finally(() => setLoading(false));
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 16rem)",
                    py: 4,
                }}
            >
                <Card sx={{ width: "100%", boxShadow: 3 }}>
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
                                    display: "flex",
                                    flexDirection: "column",
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
                                />



                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                    startIcon={
                                        loading && (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        )
                                    }
                                >
                                    {loading ? "Učitavanje..." : "Prijavite se"}
                                </Button>

                                <Typography
                                    variant="body2"
                                    textAlign="center"
                                    color="text.secondary"
                                >
                                    Nemate nalog?{" "}
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