import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Bookmark } from '@mui/icons-material';
import { useStateContext } from "../context/useStateContext.js";
import { StatCard, PageHeader, EmptyState } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function UserHome() {
    const { user } = useStateContext();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ FIX: dodato [] kao dependency array → poziva se samo jednom
    useEffect(() => {
        axiosClient
            .get('/favorites')
            .then(({ data }) => {
                setFavorites(data.favorites || []);
            })
            .catch((err) => console.error('Fetch favorites failed:', err))
            .finally(() => setLoading(false));
    }, []); // ← KRITIČNI FIX

    return (
        <Box>
            <PageHeader
                title={`Dobrodošli, ${user?.name || 'Korisniče'}!`}
                subtitle="Ovde možete pregledati naučne radove i upravljati kolekcijom."
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    {/* ✅ koristi reusable StatCard komponentu */}
                    <StatCard
                        title="Sačuvani radovi"
                        value={favorites.length}
                        icon={<Bookmark sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    />
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Nedavno sačuvani radovi
                </Typography>

                {loading ? (
                    <Typography color="text.secondary">
                        Učitavanje...
                    </Typography>
                ) : favorites.length === 0 ? (
                    // ✅ koristi reusable EmptyState komponentu
                    <EmptyState
                        icon={<Bookmark sx={{ fontSize: 48 }} />}
                        title="Nemate sačuvanih radova"
                        subtitle='Idite na "Naučni radovi" i sačuvajte radove koji vas zanimaju.'
                    />
                ) : (
                    favorites.slice(0, 3).map((fav) => (
                        <Box
                            key={fav.id}
                            sx={{
                                mb: 2,
                                pb: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={500}>
                                {fav.project.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {fav.project.leader?.name} •{' '}
                                {fav.project.category}
                            </Typography>
                        </Box>
                    ))
                )}
            </Paper>
        </Box>
    );
}
