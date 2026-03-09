import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import {
    Search,
    Bookmark,
    BookmarkBorder,
    Download,
    Flag,
    OpenInNew,
} from '@mui/icons-material';
import { PageHeader, SortSelect } from '../components/index.js';
import axiosClient from '../axiosClient.js';
import { useStateContext } from '../context/ContextProvider.jsx';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize.js';

const CATEGORY_OPTIONS = [
    'IT',
    'Medicine',
    'Biology',
    'Physics',
    'Chemistry',
    'Data Science',
    'Engineering',
];

// SK13 – opcije sortiranja
const SORT_OPTIONS = [
    { value: 'title_asc', label: 'Naziv (A–Z)' },
    { value: 'title_desc', label: 'Naziv (Z–A)' },
    { value: 'date_desc', label: 'Najnoviji' },
    { value: 'date_asc', label: 'Najstariji' },
    { value: 'budget_desc', label: 'Budžet (↓)' },
    { value: 'budget_asc', label: 'Budžet (↑)' },
];

export function Papers() {
    const navigate = useNavigate();
    const { user } = useStateContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc'); // SK13
    const [savedPapers, setSavedPapers] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // SK16 – Report dialog state
    const [reportDialog, setReportDialog] = useState({
        open: false,
        projectId: null,
        projectTitle: '',
    });
    const [reportDesc, setReportDesc] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState('');

    // Dohvati sačuvane radove jednom
    useEffect(() => {
        axiosClient
            .get('/favorites')
            .then(({ data }) => {
                const ids = data.favorites.map((f) => f.project.id);
                setSavedPapers(ids);
            })
            .catch(console.error);
    }, []);

    // Reset stranice kad se menja pretraga/filter/sort
    useEffect(() => {
        setPage(1);
        setPapers([]);
    }, [searchTerm, selectedField, sortBy]);

    // Dohvati radove
    useEffect(() => {
        setLoading(true);
        axiosClient
            .get('/projects/search', {
                params: {
                    q: searchTerm || undefined,
                    category:
                        selectedField !== 'all' ? selectedField : undefined,
                    sort: sortBy,
                    page,
                },
            })
            .then(({ data }) => {
                setPapers((prev) =>
                    page === 1
                        ? data.data
                        : [...prev, ...data.data]
                );
                setHasMore(data.data.length > 0);
            })
            .catch((err) => {
                console.error('Fetch papers failed:', err);
                if (page === 1) setPapers([]);
                setHasMore(false);
            })
            .finally(() => setLoading(false));
    }, [searchTerm, selectedField, sortBy, page]);

    // SK6 – toggle save
    const toggleSave = useCallback(
        (projectId) => {
            const isSaved = savedPapers.includes(projectId);
            if (isSaved) {
                axiosClient
                    .delete('/favorites', { data: { project_id: projectId } })
                    .then(() =>
                        setSavedPapers((prev) =>
                            prev.filter((id) => id !== projectId)
                        )
                    )
                    .catch(console.error);
            } else {
                axiosClient
                    .post('/favorites', { project_id: projectId })
                    .then(() =>
                        setSavedPapers((prev) => [...prev, projectId])
                    )
                    .catch(console.error);
            }
        },
        [savedPapers]
    );

    // SK16 – submit report
    const handleSubmitReport = async () => {
        if (!reportDesc.trim()) {
            setReportError('Opis problema je obavezan.');
            return;
        }
        setReportLoading(true);
        setReportError('');
        try {
            await axiosClient.post('/reports', {
                project_id: reportDialog.projectId,
                description: reportDesc.trim(),
            });
            setReportSuccess(true);
            setTimeout(() => {
                setReportDialog({ open: false, projectId: null, projectTitle: '' });
                setReportDesc('');
                setReportSuccess(false);
            }, 1500);
        } catch (err) {
            setReportError(
                err.response?.data?.message || 'Greška pri slanju prijave.'
            );
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Naučni radovi"
                subtitle="Pretražite i filtrirajte naučne radove po različitim kriterijumima."
            />

            {/* ===== FILTERI I SORTIRANJE ===== */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Pretraga */}
                    <Grid item xs={12} md={5}>
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

                    {/* Filter kategorije */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Kategorija</InputLabel>
                            <Select
                                value={selectedField}
                                label="Kategorija"
                                onChange={(e) =>
                                    setSelectedField(e.target.value)
                                }
                            >
                                <MenuItem value="all">
                                    Sve kategorije
                                </MenuItem>
                                {CATEGORY_OPTIONS.map((f) => (
                                    <MenuItem key={f} value={f}>
                                        {f}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* SK13 – Sort select */}
                    <Grid item xs={12} md={3}>
                        <SortSelect
                            label="Sortiraj po"
                            value={sortBy}
                            onChange={setSortBy}
                            options={SORT_OPTIONS}
                            size="medium"
                        />
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
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Pronađeno: {papers.length} radova
                    </Typography>

                    <Grid container spacing={3}>
                        {papers.map((paper) => (
                            <Grid item xs={12} key={paper.id}>
                                <Card sx={{ borderRadius: 3 }}>
                                    <CardContent>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                        >
                                            <Box flex={1}>
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                    fontWeight={600}
                                                >
                                                    {sanitizeText(paper.title)}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    gutterBottom
                                                >
                                                    {sanitizeText(paper.leader?.name)}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    paragraph
                                                >
                                                    {sanitizeText(paper.description)}
                                                </Typography>
                                                <Box sx={{ mb: 1 }}>
                                                    <Chip
                                                        label={paper.category}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={paper.end_date}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={`${paper.budget} $`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={paper.status}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        {/* SK5 – Detalji */}
                                        <Button
                                            size="small"
                                            startIcon={<OpenInNew />}
                                            onClick={() =>
                                                navigate(
                                                    `/autenticate/${user?.role}/papers/${paper.id}`
                                                )
                                            }
                                        >
                                            Detalji
                                        </Button>

                                        {/* SK6 – Save/Unsave */}
                                        <Button
                                            size="small"
                                            startIcon={
                                                savedPapers.includes(paper.id)
                                                    ? <Bookmark />
                                                    : <BookmarkBorder />
                                            }
                                            onClick={() =>
                                                toggleSave(paper.id)
                                            }
                                        >
                                            {savedPapers.includes(paper.id)
                                                ? 'Sačuvano'
                                                : 'Sačuvaj'}
                                        </Button>

                                        {/* SK12 – Download */}
                                        <Button
                                            size="small"
                                            startIcon={<Download />}
                                            onClick={() => {
                                                const safeUrl = sanitizeUrl(paper.document_url);
                                                if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
                                            }}
                                            disabled={!paper.document_url}
                                        >
                                            PDF
                                        </Button>

                                        {/* SK16 – Prijavi problem */}
                                        {user?.role !== 'admin' && (
                                            <Button
                                                size="small"
                                                color="warning"
                                                startIcon={<Flag />}
                                                onClick={() => {
                                                    setReportDialog({
                                                        open: true,
                                                        projectId: paper.id,
                                                        projectTitle: sanitizeText(paper.title),
                                                    });
                                                    setReportDesc('');
                                                    setReportError('');
                                                    setReportSuccess(false);
                                                }}
                                            >
                                                Prijavi
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {papers.length === 0 && (
                        <Box textAlign="center" py={4}>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                            >
                                Nema rezultata pretrage
                            </Typography>
                        </Box>
                    )}

                    {hasMore && papers.length > 0 && (
                        <Box textAlign="center" py={4}>
                            <Button
                                variant="outlined"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={loading}
                            >
                                {loading ? 'Učitavanje...' : 'Učitaj još'}
                            </Button>
                        </Box>
                    )}
                </>
            )}

            {/* SK16 – Report dialog */}
            <Dialog
                open={reportDialog.open}
                onClose={() =>
                    setReportDialog({
                        open: false,
                        projectId: null,
                        projectTitle: '',
                    })
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Prijavi problem: {reportDialog.projectTitle}
                </DialogTitle>
                <DialogContent>
                    {reportSuccess ? (
                        <Alert severity="success">
                            Prijava uspešno poslata!
                        </Alert>
                    ) : (
                        <>
                            {reportError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {reportError}
                                </Alert>
                            )}
                            <TextField
                                label="Opis problema"
                                fullWidth
                                multiline
                                rows={4}
                                sx={{ mt: 1 }}
                                value={reportDesc}
                                onChange={(e) =>
                                    setReportDesc(e.target.value)
                                }
                                placeholder="Opišite zašto prijavljivate ovaj rad..."
                                required
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setReportDialog({
                                open: false,
                                projectId: null,
                                projectTitle: '',
                            })
                        }
                    >
                        Zatvori
                    </Button>
                    {!reportSuccess && (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleSubmitReport}
                            disabled={reportLoading}
                        >
                            {reportLoading ? 'Slanje...' : 'Pošalji'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
