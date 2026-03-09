import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { PageHeader, ConfirmDialog, EmptyState } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function AdminHome() {
    const [equipment, setEquipment] = useState([]);
    const [users, setUsers] = useState([]);

    // Equipment modal state
    const [openEquipmentModal, setOpenEquipmentModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [equipmentForm, setEquipmentForm] = useState({
        name: '',
        model_number: '',
        status: 'available',
        manufacturer: '',
        location: '',
    });

    // ✅ ConfirmDialog state za brisanje opreme
    const [confirmEquipment, setConfirmEquipment] = useState({
        open: false,
        id: null,
    });

    // ✅ ConfirmDialog state za brisanje korisnika
    const [confirmUser, setConfirmUser] = useState({
        open: false,
        id: null,
    });

    // SK11 – Dialog state za izmenu uloge korisnika
    const [editUserDialog, setEditUserDialog] = useState({
        open: false,
        user: null,
    });
    const [newRole, setNewRole] = useState('user');

    // Paginacija
    const [equipmentPage, setEquipmentPage] = useState(1);
    const [equipmentTotalPages, setEquipmentTotalPages] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);

    const fetchEquipment = useCallback(async (page = 1) => {
        const res = await axiosClient.get(`/equipment?page=${page}`);
        setEquipment(res.data.data);
        setEquipmentPage(res.data.current_page);
        setEquipmentTotalPages(res.data.last_page);
    }, []);

    const fetchUsers = useCallback(async (page = 1) => {
        const res = await axiosClient.get(`/users?page=${page}`);
        setUsers(res.data.data);
        setUsersPage(res.data.current_page);
        setUsersTotalPages(res.data.last_page);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEquipment();
         
        fetchUsers();
    }, [fetchEquipment, fetchUsers]);

    const handleSaveEquipment = async () => {
        if (editingEquipment) {
            await axiosClient.put(
                `/equipment/${editingEquipment.id}`,
                equipmentForm
            );
        } else {
            await axiosClient.post('/equipment', equipmentForm);
        }
        setOpenEquipmentModal(false);
        setEditingEquipment(null);
        setEquipmentForm({
            name: '',
            model_number: '',
            status: 'available',
            manufacturer: '',
            location: '',
        });
        fetchEquipment();
    };

    // ✅ Brisanje opreme kroz ConfirmDialog
    const handleConfirmDeleteEquipment = async () => {
        await axiosClient.delete(`/equipment/${confirmEquipment.id}`);
        setConfirmEquipment({ open: false, id: null });
        fetchEquipment();
    };

    // ✅ Brisanje korisnika kroz ConfirmDialog
    const handleConfirmDeleteUser = async () => {
        await axiosClient.delete(`/users/${confirmUser.id}`);
        setConfirmUser({ open: false, id: null });
        fetchUsers();
    };

    // SK11 – Čuvanje nove uloge korisnika
    const handleSaveUserRole = async () => {
        try {
            await axiosClient.put(`/users/${editUserDialog.user.id}`, {
                role: newRole,
            });
            setEditUserDialog({ open: false, user: null });
            fetchUsers();
        } catch (err) {
            console.error('Update role failed:', err);
        }
    };

    const handleEditEquipment = (eq) => {
        setEditingEquipment(eq);
        setEquipmentForm({
            name: eq.name,
            model_number: eq.model_number,
            status: eq.status,
            manufacturer: eq.manufacturer,
            location: eq.location,
        });
        setOpenEquipmentModal(true);
    };

    return (
        <Box p={3}>
            {/* ✅ PageHeader */}
            <PageHeader
                title="Admin Dashboard"
                subtitle="Upravljajte opremom, korisnicima i sistemskim resursima."
            />

            {/* ========== EQUIPMENT ========== */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Typography variant="h5" fontWeight={600}>
                    Laboratorijska oprema
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenEquipmentModal(true)}
                >
                    Dodaj opremu
                </Button>
            </Box>

            {equipment.length === 0 ? (
                <EmptyState
                    title="Nema opreme"
                    subtitle="Dodajte laboratorijsku opremu klikom na dugme iznad."
                />
            ) : (
                <Grid container spacing={2}>
                    {equipment.map((eq) => (
                        <Grid item xs={12} sm={6} md={4} key={eq.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{eq.name}</Typography>
                                    <Typography variant="body2">
                                        Model: {eq.model_number}
                                    </Typography>
                                    <Typography variant="body2">
                                        Status: {eq.status}
                                    </Typography>
                                    <Typography variant="body2">
                                        Proizvođač: {eq.manufacturer}
                                    </Typography>
                                    <Typography variant="body2">
                                        Lokacija: {eq.location}
                                    </Typography>
                                    <Box mt={1}>
                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                handleEditEquipment(eq)
                                            }
                                        >
                                            <Edit />
                                        </IconButton>
                                        {/* ✅ Otvara ConfirmDialog umesto window.confirm */}
                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                setConfirmEquipment({
                                                    open: true,
                                                    id: eq.id,
                                                })
                                            }
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Box mt={2} display="flex" justifyContent="center" gap={1}>
                <Button
                    disabled={equipmentPage <= 1}
                    onClick={() => fetchEquipment(equipmentPage - 1)}
                >
                    Prethodna
                </Button>
                <Typography mt={1}>
                    {equipmentPage} / {equipmentTotalPages}
                </Typography>
                <Button
                    disabled={equipmentPage >= equipmentTotalPages}
                    onClick={() => fetchEquipment(equipmentPage + 1)}
                >
                    Sledeća
                </Button>
            </Box>

            {/* ========== USERS ========== */}
            <Box mt={5}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Korisnici
                </Typography>

                {users.length === 0 ? (
                    <EmptyState title="Nema korisnika" />
                ) : (
                    users.map((user) => (
                        <Card key={user.id} sx={{ mb: 2 }}>
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle1">
                                        {user.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email} • {user.role}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    {/* SK11 – Edit role dugme */}
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            setEditUserDialog({ open: true, user });
                                            setNewRole(user.role);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    {/* ✅ ConfirmDialog za brisanje korisnika */}
                                    <IconButton
                                        color="error"
                                        onClick={() =>
                                            setConfirmUser({
                                                open: true,
                                                id: user.id,
                                            })
                                        }
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            <Box mt={2} display="flex" justifyContent="center" gap={1}>
                <Button
                    disabled={usersPage <= 1}
                    onClick={() => fetchUsers(usersPage - 1)}
                >
                    Prethodna
                </Button>
                <Typography mt={1}>
                    {usersPage} / {usersTotalPages}
                </Typography>
                <Button
                    disabled={usersPage >= usersTotalPages}
                    onClick={() => fetchUsers(usersPage + 1)}
                >
                    Sledeća
                </Button>
            </Box>

            {/* ========== EQUIPMENT MODAL ========== */}
            <Dialog
                open={openEquipmentModal}
                onClose={() => {
                    setOpenEquipmentModal(false);
                    setEditingEquipment(null);
                }}
                fullWidth
            >
                <DialogTitle>
                    {editingEquipment ? 'Izmeni opremu' : 'Dodaj opremu'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Naziv"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.name}
                        onChange={(e) =>
                            setEquipmentForm({
                                ...equipmentForm,
                                name: e.target.value,
                            })
                        }
                    />
                    <TextField
                        label="Model"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.model_number}
                        onChange={(e) =>
                            setEquipmentForm({
                                ...equipmentForm,
                                model_number: e.target.value,
                            })
                        }
                    />
                    <TextField
                        select
                        label="Status"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.status}
                        onChange={(e) =>
                            setEquipmentForm({
                                ...equipmentForm,
                                status: e.target.value,
                            })
                        }
                    >
                        <MenuItem value="available">Dostupno</MenuItem>
                        <MenuItem value="in-use">U upotrebi</MenuItem>
                        <MenuItem value="maintenance">Održavanje</MenuItem>
                    </TextField>
                    <TextField
                        label="Proizvođač"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.manufacturer}
                        onChange={(e) =>
                            setEquipmentForm({
                                ...equipmentForm,
                                manufacturer: e.target.value,
                            })
                        }
                    />
                    <TextField
                        label="Lokacija"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.location}
                        onChange={(e) =>
                            setEquipmentForm({
                                ...equipmentForm,
                                location: e.target.value,
                            })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenEquipmentModal(false);
                            setEditingEquipment(null);
                        }}
                    >
                        Otkaži
                    </Button>
                    <Button variant="contained" onClick={handleSaveEquipment}>
                        Sačuvaj
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ✅ ConfirmDialog za opremu */}
            <ConfirmDialog
                open={confirmEquipment.open}
                title="Brisanje opreme"
                message="Da li ste sigurni da želite da obrišete ovu opremu? Ova akcija je nepovratna."
                onConfirm={handleConfirmDeleteEquipment}
                onCancel={() => setConfirmEquipment({ open: false, id: null })}
            />

            {/* ✅ ConfirmDialog za korisnika */}
            <ConfirmDialog
                open={confirmUser.open}
                title="Brisanje korisnika"
                message="Da li ste sigurni da želite da obrišete ovog korisnika? Ova akcija je nepovratna."
                onConfirm={handleConfirmDeleteUser}
                onCancel={() => setConfirmUser({ open: false, id: null })}
            />

            {/* SK11 – Dialog za izmenu uloge korisnika */}
            <Dialog
                open={editUserDialog.open}
                onClose={() => setEditUserDialog({ open: false, user: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Izmeni ulogu – {editUserDialog.user?.name}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Uloga"
                        fullWidth
                        margin="normal"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                    >
                        <MenuItem value="user">User – Korisnik</MenuItem>
                        <MenuItem value="researcher">Researcher – Istraživač</MenuItem>
                        <MenuItem value="admin">Admin – Administrator</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setEditUserDialog({ open: false, user: null })
                        }
                    >
                        Otkaži
                    </Button>
                    <Button variant="contained" onClick={handleSaveUserRole}>
                        Sačuvaj
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
