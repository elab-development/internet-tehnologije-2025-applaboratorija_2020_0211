import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Typography,
    Chip,
} from '@mui/material';
import { Add, Science } from '@mui/icons-material';
import { PageHeader, EmptyState } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function Samples() {
    const [samples, setSamples] = useState([]);
    const [experiments, setExperiments] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        code: '',
        type: '',
        source: '',
        location: '',
        metadata: '',
        experiment_id: '',
    });

    const fetchSamples = async () => {
        try {
            const res = await axiosClient.get('/samples');
            setSamples(res.data.data);
        } catch (err) {
            console.error('Fetch samples failed:', err);
        }
    };

    const fetchExperiments = async () => {
        try {
            const res = await axiosClient.get('/experiments');
            setExperiments(res.data.data);
        } catch (err) {
            console.error('Fetch experiments failed:', err);
        }
    };

    useEffect(() => {
        fetchSamples();
        fetchExperiments();
    }, []);

    const handleSubmit = async () => {
        setError('');
        if (!form.code.trim() || !form.experiment_id) {
            setError('Šifra uzorka i eksperiment su obavezni.');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/samples', {
                code: form.code.trim(),
                type: form.type.trim(),
                source: form.source.trim(),
                location: form.location.trim(),
                metadata: form.metadata.trim(),
                experiment_id: form.experiment_id,
            });
            setOpen(false);
            setForm({
                code: '',
                type: '',
                source: '',
                location: '',
                metadata: '',
                experiment_id: '',
            });
            fetchSamples();
        } catch (err) {
            setError(
                err.response?.data?.message || 'Greška pri dodavanju uzorka.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Uzorci"
                subtitle="Upravljanje uzorcima po eksperimentima."
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpen(true)}
                    >
                        Dodaj uzorak
                    </Button>
                }
            />

            {samples.length === 0 ? (
                <EmptyState
                    icon={<Science sx={{ fontSize: 64 }} />}
                    title="Nema uzoraka"
                    subtitle='Dodajte novi uzorak klikom na "Dodaj uzorak".'
                />
            ) : (
                <Grid container spacing={2}>
                    {samples.map((sample) => (
                        <Grid item xs={12} sm={6} md={4} key={sample.id}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                        >
                                            {sample.code}
                                        </Typography>
                                        {sample.type && (
                                            <Chip
                                                label={sample.type}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        EKSPERIMENT
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        {sample.experiment?.name || '—'}
                                    </Typography>

                                    {sample.source && (
                                        <>
                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                fontWeight="bold"
                                                display="block"
                                            >
                                                IZVOR
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                {sample.source}
                                            </Typography>
                                        </>
                                    )}

                                    {sample.location && (
                                        <>
                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                fontWeight="bold"
                                                display="block"
                                            >
                                                LOKACIJA
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {sample.location}
                                            </Typography>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Modal za dodavanje uzorka */}
            <Dialog
                open={open}
                onClose={() => {
                    setOpen(false);
                    setError('');
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Dodaj uzorak</DialogTitle>
                <DialogContent>
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <TextField
                        label="Šifra uzorka"
                        fullWidth
                        margin="normal"
                        value={form.code}
                        onChange={(e) =>
                            setForm({ ...form, code: e.target.value })
                        }
                        required
                    />

                    <TextField
                        label="Tip uzorka"
                        fullWidth
                        margin="normal"
                        placeholder="npr. krv, tkivo, tečnost"
                        value={form.type}
                        onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                        }
                    />

                    <TextField
                        label="Izvor uzorka"
                        fullWidth
                        margin="normal"
                        placeholder="npr. pacijent, laboratorija"
                        value={form.source}
                        onChange={(e) =>
                            setForm({ ...form, source: e.target.value })
                        }
                    />

                    <TextField
                        label="Lokacija čuvanja"
                        fullWidth
                        margin="normal"
                        placeholder="npr. frižider A3, polica 2"
                        value={form.location}
                        onChange={(e) =>
                            setForm({ ...form, location: e.target.value })
                        }
                    />

                    <TextField
                        label="Napomene (metadata)"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                        value={form.metadata}
                        onChange={(e) =>
                            setForm({ ...form, metadata: e.target.value })
                        }
                    />

                    <TextField
                        select
                        label="Eksperiment"
                        fullWidth
                        margin="normal"
                        value={form.experiment_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                experiment_id: e.target.value,
                            })
                        }
                        required
                    >
                        {experiments.map((exp) => (
                            <MenuItem key={exp.id} value={exp.id}>
                                {exp.name} — {exp.project?.title}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            setError('');
                        }}
                    >
                        Otkaži
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Čuvanje...' : 'Sačuvaj'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
