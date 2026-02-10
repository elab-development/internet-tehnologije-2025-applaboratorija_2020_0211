import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Paper
} from '@mui/material';
import { BookmarkBorder, Download } from '@mui/icons-material';
import axiosClient from "../axiosClient.js";

export function SavedPapers() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        axiosClient.get('/favorites') // GET ruta za favorites
            .then(({ data }) => {
                setFavorites(data.favorites || []);
            })
            .catch(err => {
                console.error("Failed to fetch favorites:", err);
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
            <Typography variant="h4" gutterBottom>
                Sačuvani radovi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Vaši sačuvani naučni radovi
            </Typography>

            {favorites.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <BookmarkBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Nemate sačuvanih radova
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sačuvajte radove koje želite da pročitate kasnije
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {favorites.map((fav) => {
                        const paper = fav.project;
                        return (
                            <Grid item xs={12} key={fav.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {paper.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {paper.leader.name}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            {paper.description}
                                        </Typography>
                                        <Box sx={{ mb: 1 }}>
                                            <Chip label={paper.category} size="small" color="primary" sx={{ mr: 1 }} />
                                            <Chip label={`${parseFloat(paper.budget).toLocaleString()} $`} size="small" variant="outlined" />
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={<Download />}
                                            onClick={() => window.open(paper.document_url, '_blank')}
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
