import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    InputLabel,
    Select,
    FormControl,
    Checkbox,
    ListItemText,
    OutlinedInput, Divider, Container
} from '@mui/material';
import axiosClient from '../axiosClient.js';

const statusOptions = [
    { value: 'planned', label: 'Planiran' },
    { value: 'active', label: 'Aktivan' },
    { value: 'completed', label: 'Završen' },
];

const categoryOptions = ['IT', 'Medicine', 'Biology', 'Physics', 'Chemistry', 'Data Science', 'Engineering'];

export function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [users, setUsers] = useState([]);

    const [errors, setErrors] = useState({});
    const getStatusColor = (status) => {
        switch (status) {
            case 'planned': return 'warning';   // Žuta/Narandžasta
            case 'active': return 'success';    // Zelena
            case 'completed': return 'primary'; // Plava
            default: return 'default';
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        code: '',
        description: '',
        budget: '',
        category: '',
        status: 'active',
        start_date: '',
        end_date: '',
        document: null,
        members: []
    });

    useEffect(() => {
        axiosClient.get('/users')
            .then(({ data }) => {
                const userData = data.data || (Array.isArray(data) ? data : []);
                console.log(userData);
                setUsers(userData);
            })
            .catch(err => {
                console.error("Fetch users failed:", err);
                setUsers([]);
            });
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/projects');
            const projectsWithMembers = data.data.map(p => ({
                ...p,
                members: p.members || []
            }));
            setProjects(projectsWithMembers);
        } catch (err) {
            console.error("Fetch projects failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenDialog = (project = null) => {
        setErrors({});
        setEditingProject(project);
        if (project) {
            setFormData({
                title: project.title || '',
                code: project.code || '',
                description: project.description || '',
                budget: project.budget || '',
                category: project.category || '',
                status: project.status || 'active',
                start_date: project.start_date || '',
                end_date: project.end_date || '',
                document: null,
                members: project.members ? project.members.map(m => m.id) : []
            });
        } else {
            setFormData({
                title: '',
                code: '',
                description: '',
                budget: '',
                category: '',
                status: 'active',
                start_date: '',
                end_date: '',
                document: null,
                members: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProject(null);
        setErrors({});
    };

    const handleSave = async () => {
        setErrors({});
        try {
            const payload = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === 'members') {
                    formData.members.forEach(id => payload.append('members[]', id));
                } else if (key === 'document') {
                    if (formData[key]) payload.append(key, formData[key]);
                } else {
                    payload.append(key, formData[key] === null ? '' : formData[key]);
                }
            });

            if (editingProject) {
                payload.append('_method', 'PUT');
                await axiosClient.post(`/projects/${editingProject.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axiosClient.post('/projects', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            fetchProjects();
            handleCloseDialog();
        } catch (err) {
            if (err.response && (err.response.status === 422 || err.response.status === 400)) {
                setErrors(err.response.data);
            } else {
                console.error("Save project failed:", err);
                alert('Greška na serveru.');
            }
        }
    };

    const calculateProgress = (start, end) => {
        if (!start) return 0;
        const today = new Date();
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();

        if (today >= endDate) return 100;
        if (today <= startDate) return 0;

        const total = endDate.getTime() - startDate.getTime();
        const elapsed = today.getTime() - startDate.getTime();
        return Math.round((elapsed / total) * 100);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* HEADER SEKCIJA - Ostavljamo konzistentno */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="800">Projekti</Typography>
                    <Typography variant="body2" color="text.secondary">Pregled i upravljanje istraživanjima</Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 'bold' }}
                >
                    + Novi Projekat
                </Button>
            </Box>

            {/* LISTA PROJEKATA - Kartice su sada identične širine */}
            {loading ? (
                <Box textAlign="center" py={10}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {projects.map(project => (
                        <Grid item xs={12} key={project.id}>
                            <Card sx={{
                                width: '1200px',
                                borderRadius: 3,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold">
                                                {project.title}
                                                <Typography component="span" sx={{ ml: 2, color: 'text.disabled' }}>
                                                    #{project.code}
                                                </Typography>
                                            </Typography>
                                            <Chip label={project.category} size="small" variant="outlined" sx={{ mt: 1 }} />
                                        </Box>
                                        <Chip
                                            label={statusOptions.find(s => s.value === project.status)?.label || project.status}
                                            color={getStatusColor(project.status)}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>

                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                        {project.description || 'Nema opisa.'}
                                    </Typography>

                                    <Grid container spacing={4}>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" color="text.disabled" fontWeight="bold">BUDŽET</Typography>
                                            <Typography variant="h6" fontWeight="bold">
                                                {project.budget ? `${Number(project.budget).toLocaleString()} €` : '—'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <Typography variant="caption" color="text.disabled" fontWeight="bold">VREMENSKI OKVIR</Typography>
                                            <Typography variant="body1">📅 {project.start_date} — {project.end_date || 'Nema roka'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="caption" color="text.disabled" fontWeight="bold">REALIZACIJA {calculateProgress(project.start_date, project.end_date)}%</Typography>
                                            <LinearProgress variant="determinate" value={calculateProgress(project.start_date, project.end_date)} sx={{ height: 8, borderRadius: 5, mt: 1 }} />
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 3 }} />

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" gap={1}>
                                            {project.members?.map(m => <Chip key={m.id} label={m.name} size="small" />)}
                                        </Box>
                                        <Button variant="outlined" onClick={() => handleOpenDialog(project)}>UREDI</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
                scroll="paper" // Omogućava da modal ima svoj scroll bar
                PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', p: 3 }}>
                    {editingProject ? 'Izmena Projekta' : 'Novi Projekat'}
                </DialogTitle>

                <DialogContent sx={{ p: 4, overflowY: 'auto' }}>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>

                        {/* NAZIV */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Naziv projekta</Typography>
                            <TextField fullWidth placeholder="Unesite naziv..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </Grid>

                        {/* ŠIFRA */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Šifra projekta</Typography>
                            <TextField fullWidth placeholder="PRJ-XXXX" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                        </Grid>

                        {/* OPIS */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Opis projekta</Typography>
                            <TextField fullWidth multiline rows={3} placeholder="Kratak opis..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </Grid>

                        {/* KATEGORIJA */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Kategorija</Typography>
                            <FormControl fullWidth>
                                <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {categoryOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* STATUS */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Status</Typography>
                            <TextField select fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </TextField>
                        </Grid>

                        {/* BUDŽET */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Budžet (€)</Typography>
                            <TextField fullWidth type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
                        </Grid>

                        {/* DATUM POČETKA */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Datum početka</Typography>
                            <TextField type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        </Grid>

                        {/* DATUM KRAJA */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Datum završetka</Typography>
                            <TextField type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                        </Grid>

                        {/* ČLANOVI TIMA */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Članovi tima</Typography>
                            <FormControl fullWidth>
                                <Select
                                    multiple
                                    value={formData.members}
                                    onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map(id => (
                                                <Chip key={id} label={users.find(u => u.id === id)?.name} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {users.map(user => (
                                        <MenuItem key={user.id} value={user.id}>
                                            <Checkbox checked={formData.members.includes(user.id)} />
                                            <ListItemText primary={user.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* DOKUMENT */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Dokumentacija</Typography>
                            <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                                <Button variant="outlined" component="label" size="small">
                                    ODABERI FAJL
                                    <input type="file" hidden onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })} />
                                </Button>
                                {formData.document && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{formData.document.name}</Typography>}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={handleCloseDialog} color="inherit">Otkaži</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ px: 4, fontWeight: 'bold' }}>
                        {editingProject ? 'Sačuvaj izmene' : 'Kreiraj projekat'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
