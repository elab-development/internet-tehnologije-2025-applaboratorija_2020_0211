import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from '@mui/material';
import { Science, Add } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axiosClient from "../axiosClient.js";

export function Experiments() {
    const [experiments, setExperiments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [open, setOpen] = useState(false);

    // Inicijalni state forme
    const [form, setForm] = useState({
        name: '',
        protocol: '',
        date_performed: '',
        status: 'completed',
        project_id: '',
    });


    const fetchAllExperiments = async () => {
        try {
            const res = await axiosClient.get('/experiments');

            setExperiments(res.data.data);
        } catch (err) {
            console.error(err);
            setExperiments([]);
        }
    };



    // 2. Slanje novog eksperimenta
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Provera da li je projekat izabran
            if (!form.project_id) {
                alert("Molimo izaberite projekat");
                return;
            }

            await axiosClient.post('/projects/experiments', form); // Koristimo 'form', ne 'formData'

            setOpen(false);
            setForm({ name: '', protocol: '', date_performed: '', status: 'completed', project_id: '' });

            const res = await axiosClient.get(`/projects/${form.project_id}/experiments`);
            setExperiments(res.data?.data || res.data || []);

        } catch (err) {
            console.error("Greška pri slanju:", err);
            const status = err.response?.status;
            alert(status === 500 ? "Greška na serveru (Mass Assignment ili Baza)" : "Došlo je do greške");
        }
    };

    useEffect(() => {
        fetchAllExperiments();
    }, []);


    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h4">Eksperimenti</Typography>
                    <Typography color="text.secondary">
                        Pregled svih eksperimenata i njihovih rezultata
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                >
                    Dodaj eksperiment
                </Button>
            </Box>

            <Grid container spacing={3}>
                {experiments.map((experiment) => (
                    <Grid item xs={12} md={6} key={experiment.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Science sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">
                                        {experiment.name}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" paragraph>
                                    {experiment.protocol}
                                </Typography>

                                <Box mb={1}>
                                    <Chip
                                        label={experiment.project.title}
                                        size="small"
                                        color="primary"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        label={experiment.date_performed.split(' ')[0]}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Chip
                                    label={experiment.status === 'completed' ? 'Završen' : 'U toku'}
                                    color={experiment.status === 'completed' ? 'success' : 'warning'}
                                    size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Dodaj eksperiment</DialogTitle>

                <DialogContent>
                    <TextField
                        label="Naziv"
                        fullWidth
                        margin="normal"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <TextField
                        label="Protokol"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={form.protocol}
                        onChange={(e) => setForm({ ...form, protocol: e.target.value })}
                    />

                    <TextField
                        type="date"
                        label="Datum izvođenja"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={form.date_performed}
                        onChange={(e) =>
                            setForm({ ...form, date_performed: e.target.value })
                        }
                    />

                    <TextField
                        select
                        label="Projekat"
                        fullWidth
                        margin="normal"
                        value={form.project_id}
                        onChange={(e) =>
                            setForm({ ...form, project_id: e.target.value })
                        }
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                {project.title}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Status"
                        fullWidth
                        margin="normal"
                        value={form.status}
                        onChange={(e) =>
                            setForm({ ...form, status: e.target.value })
                        }
                    >
                        <MenuItem value="completed">Završen</MenuItem>
                        <MenuItem value="in_progress">U toku</MenuItem>
                    </TextField>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Otkaži</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        Sačuvaj
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
