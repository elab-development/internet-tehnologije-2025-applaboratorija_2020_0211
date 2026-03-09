import { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
} from '@mui/material';
import { BookmarkBorder, Download } from '@mui/icons-material';
import { PageHeader, EmptyState } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function SavedPapers() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axiosClient
            .get('/favorites')
            .then(({ data }) => {
                setFavorites(data.favorites || []);
            })
            .catch((err) => {
                console.error('Failed to fetch favorites:', err);
                setFavorites([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box textAlign="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* ✅ PageHeader */}
            <PageHeader
                title="Sačuvani radovi"
                subtitle="Vaši sačuvani naučni radovi i dokumenti."
            />

            {favorites.length === 0 ? (
                // ✅ EmptyState
                <EmptyState
                    icon={<BookmarkBorder sx={{ fontSize: 64 }} />}
                    title="Nemate sačuvanih radova"
                    subtitle='Idite na "Naučni radovi" i sačuvajte radove koje želite da pročitate kasnije.'
                />
            ) : (
                <Grid container spacing={3}>
                    {favorites.map((fav) => {
                        const paper = fav.project;
                        return (
                            <Grid item xs={12} key={fav.id}>
                                <Card>
                                    <CardContent>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                        >
                                            <Box flex={1}>
                                                <Box
                                                    component="h6"
                                                    sx={{
                                                        typography: 'h6',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {paper.title}
                                                </Box>
                                                <Box
                                                    sx={{
                                                        typography: 'body2',
                                                        color: 'text.secondary',
                                                        mb: 1,
                                                    }}
                                                >
                                                    {paper.leader?.name}
                                                </Box>
                                                <Box
                                                    sx={{
                                                        typography: 'body2',
                                                        mb: 2,
                                                    }}
                                                >
                                                    {paper.description}
                                                </Box>
                                                <Box sx={{ mb: 1 }}>
                                                    <Chip
                                                        label={paper.category}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={`${parseFloat(
                                                            paper.budget
                                                        ).toLocaleString()} $`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={<Download />}
                                            onClick={() =>
                                                window.open(
                                                    paper.document_url,
                                                    '_blank'
                                                )
                                            }
                                        >
                                            Preuzmi PDF
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
