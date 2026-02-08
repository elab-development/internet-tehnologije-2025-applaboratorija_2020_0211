
import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
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
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import axiosClient from "../axiosClient.js";

export function AdminHome() {
    const [equipment, setEquipment] = useState([]);
    const [users, setUsers] = useState([]);
    const [openEquipmentModal, setOpenEquipmentModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [equipmentForm, setEquipmentForm] = useState({
        name: "",
        model_number: "",
        status: "available",
        manufacturer: "",
        location: "",
    });
    const [equipmentPage, setEquipmentPage] = useState(1);
    const [equipmentTotalPages, setEquipmentTotalPages] = useState(1);

    const [usersPage, setUsersPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);

    const fetchEquipment = async (page = 1) => {
        const res = await axiosClient.get(`/equipment?page=${page}`);
        setEquipment(res.data.data); // lista opreme
        setEquipmentPage(res.data.current_page);
        setEquipmentTotalPages(res.data.last_page);
    };

    const fetchUsers = async (page = 1) => {
        const res = await axiosClient.get(`/users?page=${page}`);
        setUsers(res.data.data); // lista korisnika
        setUsersPage(res.data.current_page);
        setUsersTotalPages(res.data.last_page);
    };


    useEffect(() => {
        fetchEquipment();
        fetchUsers();
    }, []);

    // Add / Update Equipment
    const handleSaveEquipment = async () => {
        if (editingEquipment) {
            // Update
            await axiosClient.put(`/equipment/${editingEquipment.id}`, equipmentForm);
        } else {
            // Create
            await axiosClient.post("/equipment", equipmentForm);
        }
        setOpenEquipmentModal(false);
        setEditingEquipment(null);
        setEquipmentForm({
            name: "",
            model_number: "",
            status: "available",
            manufacturer: "",
            location: "",
        });
        fetchEquipment();
    };

    // Delete Equipment
    const handleDeleteEquipment = async (id) => {
        if (!window.confirm("Da li ste sigurni da želite obrisati opremu?")) return;
        await axiosClient.delete(`/equipment/${id}`);
        fetchEquipment();
    };

    // Delete User
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Da li ste sigurni da želite obrisati korisnika?")) return;
        await axiosClient.delete(`/users/${id}`);
        fetchUsers();
    };

    // Open modal for edit
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
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {/* ================== Equipment ================== */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Laboratorijska oprema</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenEquipmentModal(true)}
                >
                    Dodaj opremu
                </Button>
            </Box>

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
                                        onClick={() => handleEditEquipment(eq)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteEquipment(eq.id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    ))}
            </Grid>
            <Box mt={2} display="flex" justifyContent="center" gap={1}>
                <Button
                    disabled={equipmentPage <= 1}
                    onClick={() => fetchEquipment(equipmentPage - 1)}
                >
                    Prethodna
                </Button>
                <Typography mt={1}>{equipmentPage} / {equipmentTotalPages}</Typography>
                <Button
                    disabled={equipmentPage >= equipmentTotalPages}
                    onClick={() => fetchEquipment(equipmentPage + 1)}
                >
                    Sledeća
                </Button>
            </Box>

            {/* ================== Users ================== */}
            <Box mt={5}>
                <Typography variant="h5" gutterBottom>
                    Korisnici
                </Typography>

                {users.map((user) => (
                    <Card key={user.id} sx={{ mb: 2 }}>
                        <CardContent
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            <Box>
                                <Typography variant="subtitle1">{user.name}</Typography>
                                <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteUser(user.id)}
                            >
                                <Delete />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))}
            </Box>
            <Box mt={2} display="flex" justifyContent="center" gap={1}>
                <Button
                    disabled={usersPage <= 1}
                    onClick={() => fetchUsers(usersPage - 1)}
                >
                    Prethodna
                </Button>
                <Typography mt={1}>{usersPage} / {usersTotalPages}</Typography>
                <Button
                    disabled={usersPage >= usersTotalPages}
                    onClick={() => fetchUsers(usersPage + 1)}
                >
                    Sledeća
                </Button>
            </Box>

            {/* ================== Equipment Modal ================== */}
            <Dialog
                open={openEquipmentModal}
                onClose={() => {
                    setOpenEquipmentModal(false);
                    setEditingEquipment(null);
                }}
                fullWidth
            >
                <DialogTitle>
                    {editingEquipment ? "Izmeni opremu" : "Dodaj opremu"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Naziv"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.name}
                        onChange={(e) =>
                            setEquipmentForm({ ...equipmentForm, name: e.target.value })
                        }
                    />
                    <TextField
                        label="Model"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.model_number}
                        onChange={(e) =>
                            setEquipmentForm({ ...equipmentForm, model_number: e.target.value })
                        }
                    />
                    <TextField
                        select
                        label="Status"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.status}
                        onChange={(e) =>
                            setEquipmentForm({ ...equipmentForm, status: e.target.value })
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
                            setEquipmentForm({ ...equipmentForm, manufacturer: e.target.value })
                        }
                    />
                    <TextField
                        label="Lokacija"
                        fullWidth
                        margin="normal"
                        value={equipmentForm.location}
                        onChange={(e) =>
                            setEquipmentForm({ ...equipmentForm, location: e.target.value })
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
        </Box>
    );
}
