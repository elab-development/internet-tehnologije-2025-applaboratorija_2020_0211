import {
    Box,
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
    Typography,
    IconButton,
} from '@mui/material';
import { Science, Add, Edit } from '@mui/icons-material';
import { useEffect, useState, useCallback } from 'react';
import { PageHeader, EmptyState } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function Experiments() {
    const [experiments, setExperiments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [open, setOpen] = useState(false);

    // SK23 – editingExperiment drži objekat koji se menja
    const [editingExperiment, setEditingExperiment] = useState(null);

    const [form, setForm] = useState({
        name: '',
        protocol: '',
        date_performed: '',
        status: 'completed',
        project_id: '',
    });

    const resetForm = () =>
        setForm({
            name: '',
            protocol: '',
            date_performed: '',
            status: 'completed',
            project_id: '',
        });

    const fetchExperiments = useCallback(async () => {
        const res = await axiosClient.get('/experiments');
        setExperiments(res.data.data);
    }, []);

    const fetchProjects = useCallback(async () => {
        const res = await axiosClient.get('/projects');
        setProjects(res.data.data);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchExperiments();
         
        fetchProjects();
    }, [fetchExperiments, fetchProjects]);

    // Otvori modal za kreiranje
    const handleOpenCreate = () => {
        setEditingExperiment(null);
        resetForm();
        setOpen(true);
    };

    // SK23 – Otvori modal za izmenu
    const handleOpenEdit = (exp) => {
        setEditingExperiment(exp);
        setForm({
            name: exp.name,
            protocol: exp.protocol,
            date_performed: exp.date_performed?.split(' ')[0] || '',
            status: exp.status,
            project_id: exp.project?.id || '',
        });
        setOpen(true);
    };

    const handleSubmit = async () => {
        if (editingExperiment) {
            // SK23 – update
            await axiosClient.put(
                `/experiments/${editingExperiment.id}`,
                {
                    name: form.name,
                    protocol: form.protocol,
                    date_performed: form.date_performed,
                    status: form.status,
                    project_id: form.project_id,
                }
            );
        } else {
            // Create
            await axiosClient.post('/projects/experiments', {
                project_id: form.project_id,
                name: form.name,
                protocol: form.protocol,
                date_performed: form.date_performed,
                status: form.status,
            });
        }

        setOpen(false);
        setEditingExperiment(null);
        resetForm();
        fetchExperiments();
    };

    return (
        <Box>
            <PageHeader
                title="Eksperimenti"
                subtitle="Pregled svih eksperimenata i njihovih rezultata."
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenCreate}
                    >
                        Dodaj eksperiment
                    </Button>
                }
            />

            {experiments.length === 0 ? (
                <EmptyState
                    icon={<Science sx={{ fontSize: 64 }} />}
                    title="Nema eksperimenata"
                    subtitle='Dodajte eksperiment klikom na "Dodaj eksperiment".'
                />
            ) : (
                <Grid container spacing={3}>
                    {experiments.map((experiment) => (
                        <Grid item xs={12} md={6} key={experiment.id}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                    >
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            mb={2}
                                            flex={1}
                                        >
                                            <Science
                                                sx={{
                                                    mr: 1,
                                                    color: 'primary.main',
                                                }}
                                            />
                                            <Typography variant="h6">
                                                {experiment.name}
                                            </Typography>
                                        </Box>
                                        {/* SK23 – Edit dugme */}
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() =>
                                                handleOpenEdit(experiment)
                                            }
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <Typography variant="body2" paragraph>
                                        {experiment.protocol}
                                    </Typography>

                                    <Box mb={1}>
                                        <Chip
                                            label={experiment.project?.title}
                                            size="small"
                                            color="primary"
                                            sx={{ mr: 1 }}
                                        />
                                        <Chip
                                            label={
                                                experiment.date_performed?.split(
                                                    ' '
                                                )[0]
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Chip
                                        label={
                                            experiment.status === 'completed'
                                                ? 'Završen'
                                                : 'U toku'
                                        }
                                        color={
                                            experiment.status === 'completed'
                                                ? 'success'
                                                : 'warning'
                                        }
                                        size="small"
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Modal – create ili edit */}
            <Dialog
                open={open}
                onClose={() => {
                    setOpen(false);
                    setEditingExperiment(null);
                    resetForm();
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingExperiment
                        ? 'Izmeni eksperiment'
                        : 'Dodaj eksperiment'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Naziv"
                        fullWidth
                        margin="normal"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                    <TextField
                        label="Protokol"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={form.protocol}
                        onChange={(e) =>
                            setForm({ ...form, protocol: e.target.value })
                        }
                    />
                    <TextField
                        type="date"
                        label="Datum izvođenja"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={form.date_performed}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                date_performed: e.target.value,
                            })
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
                    <Button
                        onClick={() => {
                            setOpen(false);
                            setEditingExperiment(null);
                            resetForm();
                        }}
                    >
                        Otkaži
                    </Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingExperiment ? 'Sačuvaj izmene' : 'Sačuvaj'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
