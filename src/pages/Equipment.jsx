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
    IconButton,
} from '@mui/material';
import { Build, Add, Delete } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axiosClient from "../axiosClient.js";

export function Equipment() {
    const [equipment, setEquipment] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        equipment_id: '',
        start_date: '',
        end_date: '',
        purpose:"",
        project_id:""
    });
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        const res = await axiosClient.get('/projects');
        setProjects(res.data.data);
    };

    const fetchEquipment = async () => {
        const res = await axiosClient.get('/equipment');
        setEquipment(res.data.data);
    };

    const fetchReservations = async () => {
        const res = await axiosClient.get('/reservations');
        console.log(res.data.data);
        setReservations(res.data.data);
    };

    useEffect(() => {
        fetchEquipment();
        fetchReservations();
        fetchProjects();
    }, []);


    const isReserved = (equipmentId) =>
        reservations.some((r) => r.equipment.id === equipmentId);

    const getStatusColor = (equipmentId) =>
        isReserved(equipmentId) ? 'warning' : 'success';

    const getStatusLabel = (equipmentId) =>
        isReserved(equipmentId) ? 'Rezervisano' : 'Dostupno';

    const handleAddReservation = async () => {
        if (!form.project_id) {
            alert("Morate izabrati projekat!");
            return;
        }

        await axiosClient.post('/reservations', {
            equipment_id: form.equipment_id,
            project_id: form.project_id,
            start_time: form.start_time,
            end_time: form.end_time,
            purpose: form.purpose,
        });

        setOpen(false);
        setForm({
            equipment_id: '',
            project_id: '',
            start_time: '',
            end_time: '',
            purpose: '',
        });

        fetchReservations();
    };


    const handleDeleteReservation = async (id) => {
        await axiosClient.delete(`/reservations/${id}`);
        fetchReservations();
    };



    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h4">
                        Rezervacije laboratorijske opreme
                    </Typography>
                    <Typography color="text.secondary">
                        Pregled i upravljanje rezervacijama
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                >
                    Nova rezervacija
                </Button>
            </Box>



            <Box mt={5}>
                <Typography variant="h5" gutterBottom>
                    Aktivne rezervacije
                </Typography>

                {reservations.map((res) => (
                    <Card key={res.id} sx={{ mb: 2 }}>
                        <CardContent
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1">
                                    {res.equipment.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {res.start_time} → {res.end_time}
                                </Typography>
                            </Box>

                            <IconButton
                                color="error"
                                onClick={() => handleDeleteReservation(res.id)}
                            >
                                <Delete />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))}
            </Box>


            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Nova rezervacija</DialogTitle>

                <DialogContent>
                    <TextField
                        select
                        label="Oprema"
                        fullWidth
                        margin="normal"
                        value={form.equipment_id}
                        onChange={(e) => setForm({...form,equipment_id: e.target.value})}

                    >
                        {equipment.map((eq) => (
                            <MenuItem key={eq.id} value={eq.id}>
                                {eq.name}
                            </MenuItem>
                        ))}
                    </TextField>

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
                        type="datetime-local"
                        label="Početak"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={form.start_time}
                        onChange={(e) =>
                            setForm({ ...form, start_time: e.target.value })
                        }
                    />

                    <TextField
                        type="datetime-local"
                        label="Kraj"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={form.end_time}
                        onChange={(e) =>
                            setForm({ ...form, end_time: e.target.value })
                        }
                    />

                    <TextField
                        label="Svrha rezervacije"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        value={form.purpose}
                        onChange={(e) =>
                            setForm({ ...form, purpose: e.target.value })
                        }
                    />

                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Otkaži</Button>
                    <Button variant="contained" onClick={handleAddReservation}>
                        Sačuvaj
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
