import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import { Search, Bookmark, BookmarkBorder, Download } from '@mui/icons-material';
import axiosClient from "../axiosClient.js";

const fields = ['IT', 'Medicine', 'Biology', 'Physics', 'Chemistry', 'Data Science', 'Engineering'];

export function Papers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('all');
    const [savedPapers, setSavedPapers] = useState([]);

    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        // Fetch favorites once
        axiosClient.get('/favorites')
            .then(({ data }) => {
                const favoriteProjectIds = data.favorites.map(fav => fav.project.id);
                setSavedPapers(favoriteProjectIds);
            })
            .catch(err => console.error("Fetch favorites failed:", err));
    }, []);

    // Fetch papers when searchTerm, selectedField or page changes
    useEffect(() => {
        setLoading(true);

        axiosClient.get('/projects/search', {
            params: {
                title: searchTerm || undefined,
                category: selectedField !== 'all' ? selectedField : undefined,
                page: page
            }
        })
            .then(({ data }) => {
                if (page === 1) {
                    setPapers(data.data);
                } else {
                    setPapers(prev => [...prev, ...data.data]);
                }
                setHasMore(data.data.length > 0);
            })
            .catch(err => {
                console.error("Fetch projects failed:", err);
                if (page === 1) setPapers([]);
                setHasMore(false);
            })
            .finally(() => setLoading(false));

    }, [searchTerm, selectedField, page]);

    const toggleSave = (projectId) => {
        const isSaved = savedPapers.includes(projectId);

        if (isSaved) {
            axiosClient.delete('/favorites', { data: { project_id: projectId } })
                .then(() => {
                    setSavedPapers(prev => prev.filter(id => id !== projectId));
                })
                .catch(err => console.error("Remove favorite failed:", err));
        } else {
            axiosClient.post('/favorites', { project_id: projectId })
                .then(() => {
                    setSavedPapers(prev => [...prev, projectId]);
                })
                .catch(err => console.error("Add favorite failed:", err));
        }
    };

    const handleLoadMore = () => {
        if (hasMore) setPage(prev => prev + 1);
    };

    // Reset page to 1 kad se menja search ili kategorija
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedField]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Naučni radovi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Pretražite i filtrirajte naučne radove po različitim kriterijumima
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            placeholder="Pretraži po naslovu ili kategoriji..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Kategorija</InputLabel>
                            <Select
                                value={selectedField}
                                label="Kategorija"
                                onChange={(e) => setSelectedField(e.target.value)}
                            >
                                <MenuItem value="all">Sve kategorije</MenuItem>
                                {fields.map((field) => (
                                    <MenuItem key={field} value={field}>
                                        {field}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {loading && page === 1 && (
                <Box textAlign="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && (
                <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Pronađeno: {papers.length} radova
                    </Typography>

                    <Grid container spacing={3}>
                        {papers.map((paper) => (
                            <Grid item xs={12} key={paper.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="start">
                                            <Box flex={1}>
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
                                                    <Chip label={paper.end_date} size="small" variant="outlined" sx={{ mr: 1 }} />
                                                    <Chip label={paper.budget + " $"} size="small" variant="outlined"  sx={{ mr: 1 }} />
                                                    <Chip label={paper.status} size="small" variant="outlined"  sx={{ mr: 1 }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={savedPapers.includes(paper.id) ? <Bookmark /> : <BookmarkBorder />}
                                            onClick={() => toggleSave(paper.id)}
                                        >
                                            {savedPapers.includes(paper.id) ? 'Sačuvano' : 'Sačuvaj'}
                                        </Button>
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
                        ))}
                    </Grid>

                    {papers.length === 0 && (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h6" color="text.secondary">
                                Nema rezultata pretrage
                            </Typography>
                        </Box>
                    )}

                    {hasMore && papers.length > 0 && (
                        <Box textAlign="center" py={4}>
                            <Button variant="outlined" onClick={handleLoadMore} disabled={loading}>
                                {loading ? "Učitavanje..." : "Učitaj još"}
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
