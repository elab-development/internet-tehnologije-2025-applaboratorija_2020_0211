import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Button,
    Chip,
    Typography,
    CircularProgress,
    Divider,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import {
    ArrowBack,
    Download,
    Bookmark,
    BookmarkBorder,
    Flag,
} from '@mui/icons-material';
import { PageHeader } from '../components/index.js';
import axiosClient from '../axiosClient.js';
import { useStateContext } from "../context/useStateContext.js";
import { sanitizeText, sanitizeUrl } from '../utils/sanitize.js';

export function PaperDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useStateContext();

    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // Report dialog state (SK16)
    const [reportOpen, setReportOpen] = useState(false);
    const [reportDesc, setReportDesc] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState('');

    useEffect(() => {
        const fetchPaper = async () => {
            try {
                const [paperRes, favRes] = await Promise.all([
                    axiosClient.get(`/projects/${id}`),
                    axiosClient.get('/favorites'),
                ]);
                setPaper(paperRes.data.data ?? paperRes.data);
                const savedIds = favRes.data.favorites.map(
                    (f) => f.project.id
                );
                setIsSaved(savedIds.includes(Number(id)));
            } catch (err) {
                console.error('Fetch paper failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPaper();
    }, [id]);

    // SK6 – toggle save/unsave
    const handleToggleSave = async () => {
        if (isSaved) {
            await axiosClient.delete('/favorites', {
                data: { project_id: Number(id) },
            });
            setIsSaved(false);
        } else {
            await axiosClient.post('/favorites', {
                project_id: Number(id),
            });
            setIsSaved(true);
        }
    };

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
                project_id: Number(id),
                description: reportDesc.trim(),
            });
            setReportSuccess(true);
            setReportDesc('');
            setTimeout(() => {
                setReportOpen(false);
                setReportSuccess(false);
            }, 1500);
        } catch (err) {
            setReportError(
                err.response?.data?.message ||
                    'Greška pri slanju prijave.'
            );
        } finally {
            setReportLoading(false);
        }
    };

    if (loading) {
        return (
            <Box textAlign="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (!paper) {
        return (
            <Box textAlign="center" py={8}>
                <Typography color="error">Rad nije pronađen.</Typography>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Nazad
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* ✅ PageHeader sa Back dugmetom */}
            <PageHeader
                title={sanitizeText(paper.title)}
                subtitle={`Kategorija: ${sanitizeText(paper.category)}`}
                action={
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        variant="outlined"
                    >
                        Nazad
                    </Button>
                }
            />

            <Grid container spacing={3}>
                {/* Leva kolona – glavni sadržaj */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Opis
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                paragraph
                            >
                                {sanitizeText(paper.description) || 'Nema opisa za ovaj rad.'}
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Detalji projekta
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        RUKOVODILAC
                                    </Typography>
                                    <Typography variant="body2">
                                        {sanitizeText(paper.leader?.name || '—')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        ŠIFRA
                                    </Typography>
                                    <Typography variant="body2">
                                        {paper.code || '—'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        DATUM POČETKA
                                    </Typography>
                                    <Typography variant="body2">
                                        {paper.start_date || '—'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        DATUM ZAVRŠETKA
                                    </Typography>
                                    <Typography variant="body2">
                                        {paper.end_date || '—'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        BUDŽET
                                    </Typography>
                                    <Typography variant="body2">
                                        {paper.budget
                                            ? `${Number(
                                                  paper.budget
                                              ).toLocaleString()} €`
                                            : '—'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        fontWeight="bold"
                                        display="block"
                                    >
                                        STATUS
                                    </Typography>
                                    <Chip
                                        label={paper.status}
                                        size="small"
                                        color={
                                            paper.status === 'active'
                                                ? 'success'
                                                : paper.status === 'planned'
                                                ? 'warning'
                                                : 'primary'
                                        }
                                    />
                                </Grid>
                            </Grid>

                            {/* Članovi tima */}
                            {paper.members?.length > 0 && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                        gutterBottom
                                    >
                                        Članovi tima
                                    </Typography>
                                    <Box
                                        display="flex"
                                        flexWrap="wrap"
                                        gap={1}
                                    >
                                        {paper.members.map((m) => (
                                            <Chip
                                                key={m.id}
                                                label={m.name}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Desna kolona – akcije */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Akcije
                            </Typography>

                            {/* SK12 – Download PDF */}
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Download />}
                                sx={{ mb: 2 }}
                                disabled={!paper.document_url}
                                onClick={() => {
                                    const safeUrl = sanitizeUrl(paper.document_url);
                                    if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
                                }}
                            >
                                Preuzmi PDF
                            </Button>

                            {/* SK6 – Save/Unsave */}
                            {user?.role !== 'admin' && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={
                                        isSaved ? (
                                            <Bookmark />
                                        ) : (
                                            <BookmarkBorder />
                                        )
                                    }
                                    sx={{ mb: 2 }}
                                    onClick={handleToggleSave}
                                >
                                    {isSaved
                                        ? 'Ukloni iz kolekcije'
                                        : 'Sačuvaj u kolekciju'}
                                </Button>
                            )}

                            {/* SK16 – Prijavi problem */}
                            {user?.role !== 'admin' && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<Flag />}
                                    onClick={() => setReportOpen(true)}
                                >
                                    Prijavi problem
                                </Button>
                            )}

                            <Divider sx={{ my: 2 }} />
                            <Chip
                                label={paper.category}
                                color="primary"
                                size="small"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* SK16 – Dialog za prijavu problema */}
            <Dialog
                open={reportOpen}
                onClose={() => {
                    setReportOpen(false);
                    setReportDesc('');
                    setReportError('');
                    setReportSuccess(false);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Prijavi problem sa radom</DialogTitle>
                <DialogContent>
                    {reportSuccess ? (
                        <Alert severity="success">
                            Prijava uspešno poslata. Hvala!
                        </Alert>
                    ) : (
                        <>
                            {reportError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {reportError}
                                </Alert>
                            )}
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Opišite problem sa ovim radom (duplikat,
                                neispravni podaci, itd.)
                            </Typography>
                            <TextField
                                label="Opis problema"
                                fullWidth
                                multiline
                                rows={4}
                                value={reportDesc}
                                onChange={(e) =>
                                    setReportDesc(e.target.value)
                                }
                                required
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setReportOpen(false);
                            setReportDesc('');
                            setReportError('');
                        }}
                    >
                        Otkaži
                    </Button>
                    {!reportSuccess && (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleSubmitReport}
                            disabled={reportLoading}
                        >
                            {reportLoading ? 'Slanje...' : 'Pošalji prijavu'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
