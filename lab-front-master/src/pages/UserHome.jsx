import React, {useEffect, useState} from "react";
import {
    Card,
    CardContent,
    Box,
    Typography,
    Grid,
    Paper,
} from "@mui/material";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {useStateContext} from "../context/ContextProvider.jsx";
import {Bookmark, Description} from "@mui/icons-material";
import axiosClient from "../axiosClient.js";

export  function UserHome() {
    const { user } = useStateContext();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        axiosClient.get(`/favorites`).then(({data}) => {
            console.log(data);
            setFavorites(data.favorites);
        }).finally(()=>setLoading(false));
    })


    return (

        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Dobrodošli na Naučni Portal. Ovde možete pregledati naučne radove, projekte i opremu.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4">{favorites.length}</Typography>
                                    <Typography variant="body2">Sačuvani radovi</Typography>
                                </Box>
                                <Bookmark sx={{ fontSize: 48, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Nedavni naučni radovi
                </Typography>
                {favorites.slice(0, 3).map((favorite) => (
                    <Box key={favorite.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                        <Typography variant="subtitle1">{favorite.project.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {favorite.project.leader.name} • {favorite.project.category}
                        </Typography>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}
