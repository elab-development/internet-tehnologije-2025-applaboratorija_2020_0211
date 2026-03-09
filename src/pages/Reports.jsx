import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Typography,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { CheckCircle, Delete, Flag } from '@mui/icons-material';
import { PageHeader, EmptyState, ConfirmDialog } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');

    // ConfirmDialog za brisanje rada
    const [confirmDelete, setConfirmDelete] = useState({
        open: false,
        reportId: null,
        projectId: null,
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/reports');
            setReports(res.data.data);
        } catch (err) {
            console.error('Fetch reports failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // "Zadrži rad" – označava prijavu kao pregledanu
    const handleKeep = async (reportId) => {
        try {
            await axiosClient.put(`/reports/${reportId}`, {
                status: 'reviewed',
            });
            setActionMsg('Rad zadržan. Prijava je označena kao pregledana.');
            fetchReports();
        } catch (err) {
            console.error('Keep report failed:', err);
        }
    };

    // "Obriši rad" – briše projekat i označava prijavu kao rešenu
    const handleConfirmDelete = async () => {
        const { reportId, projectId } = confirmDelete;
        try {
            await axiosClient.delete(`/projects/${projectId}`);
            await axiosClient.put(`/reports/${reportId}`, {
                status: 'resolved',
            });
            setActionMsg('Rad uspešno obrisan iz sistema.');
            setConfirmDelete({ open: false, reportId: null, projectId: null });
            fetchReports();
        } catch (err) {
            console.error('Delete project failed:', err);
        }
    };

    const getStatusChip = (status) => {
        const map = {
            pending: { label: 'Na čekanju', color: 'warning' },
            reviewed: { label: 'Pregledano', color: 'info' },
            resolved: { label: 'Rešeno', color: 'success' },
        };
        const cfg = map[status] || { label: status, color: 'default' };
        return <Chip label={cfg.label} color={cfg.color} size="small" />;
    };

    return (
        <Box>
            <PageHeader
                title="Prijavljeni radovi"
                subtitle="Pregled i upravljanje prijavama korisnika."
            />

            {actionMsg && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setActionMsg('')}
                >
                    {actionMsg}
                </Alert>
            )}

            {loading ? (
                <Box textAlign="center" py={6}>
                    <CircularProgress />
                </Box>
            ) : reports.length === 0 ? (
                <EmptyState
                    icon={<Flag sx={{ fontSize: 64 }} />}
                    title="Nema prijava"
                    subtitle="Sve prijave su obrađene ili nema novih."
                />
            ) : (
                reports.map((report) => (
                    <Card key={report.id} sx={{ mb: 2, borderRadius: 3 }}>
                        <CardContent>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                flexWrap="wrap"
                                gap={2}
                            >
                                <Box flex={1}>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mb={1}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                        >
                                            {report.project?.title ||
                                                'Obrisani rad'}
                                        </Typography>
                                        {getStatusChip(report.status)}
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        Prijavio:{' '}
                                        <strong>
                                            {report.user?.name || '—'}
                                        </strong>{' '}
                                        ({report.user?.email})
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            bgcolor: 'grey.100',
                                            p: 1.5,
                                            borderRadius: 2,
                                            mt: 1,
                                        }}
                                    >
                                        {report.description}
                                    </Typography>
                                </Box>

                                {/* Akcije samo za pending prijave */}
                                {report.status === 'pending' && (
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap={1}
                                        minWidth={160}
                                    >
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            startIcon={<CheckCircle />}
                                            onClick={() =>
                                                handleKeep(report.id)
                                            }
                                        >
                                            Zadrži rad
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            startIcon={<Delete />}
                                            onClick={() =>
                                                setConfirmDelete({
                                                    open: true,
                                                    reportId: report.id,
                                                    projectId:
                                                        report.project?.id,
                                                })
                                            }
                                        >
                                            Obriši rad
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Brisanje rada"
                message="Da li ste sigurni? Rad će biti trajno obrisan iz sistema. Ova akcija se ne može poništiti."
                onConfirm={handleConfirmDelete}
                onCancel={() =>
                    setConfirmDelete({
                        open: false,
                        reportId: null,
                        projectId: null,
                    })
                }
            />
        </Box>
    );
}
