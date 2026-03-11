import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    FolderOpen,
    Science,
    People,
    Build,
} from '@mui/icons-material';
import { PageHeader, StatCard } from '../components/index.js';
import axiosClient from '../axiosClient.js';

// ─── Mock podaci koji se koriste ako API nije spreman ─────────────────────────
const MOCK_DATA = {
    totals: {
        projects: 12,
        experiments: 28,
        users: 9,
        equipment: 6,
    },
    projects_by_category: [
        { category: 'IT', count: 4 },
        { category: 'Medicine', count: 3 },
        { category: 'Biology', count: 2 },
        { category: 'Physics', count: 1 },
        { category: 'Chemistry', count: 1 },
        { category: 'Data Science', count: 1 },
    ],
    experiments_by_status: [
        { status: 'completed', count: 18 },
        { status: 'in_progress', count: 10 },
    ],
    projects_by_month: [
        { month: 'Feb 2025', count: 1 },
        { month: 'Mar 2025', count: 2 },
        { month: 'Apr 2025', count: 3 },
        { month: 'Maj 2025', count: 2 },
        { month: 'Jun 2025', count: 3 },
        { month: 'Jul 2025', count: 1 },
    ],
    top_saved_papers: [
        { title: 'Istraživanje veštačke inteligencije', saves_count: 14 },
        { title: 'Analiza CRISPR metode', saves_count: 11 },
        { title: 'Kvantno računarstvo', saves_count: 9 },
        { title: 'Mašinsko učenje u medicini', saves_count: 7 },
        { title: 'Nanotehnologije u biologiji', saves_count: 5 },
    ],
};

// ─── Helper: transformacija API podataka u Google Charts format ───────────────

/**
 * Pie chart – projekti po kategorijama
 * Format: [['Kategorija', 'Broj'], ['IT', 4], ...]
 */
function buildPieData(projectsByCategory) {
    return [
        ['Kategorija', 'Broj projekata'],
        ...projectsByCategory.map((item) => [item.category, item.count]),
    ];
}

/**
 * Bar chart – eksperimenti po statusu
 * Format: [['Status', 'Broj'], ['Završen', 18], ['U toku', 10]]
 */
function buildBarData(experimentsByStatus) {
    const labelMap = {
        completed: 'Završeni',
        in_progress: 'U toku',
    };
    return [
        ['Status', 'Broj eksperimenata', { role: 'style' }],
        ...experimentsByStatus.map((item) => [
            labelMap[item.status] || item.status,
            item.count,
            item.status === 'completed' ? '#4caf50' : '#ff9800',
        ]),
    ];
}

/**
 * Column chart – projekti po mesecima (poslednjih 6 meseci)
 * Format: [['Mesec', 'Projekti'], ['Feb 2025', 1], ...]
 */
function buildColumnData(projectsByMonth) {
    return [
        ['Mesec', 'Broj projekata'],
        ...projectsByMonth.map((item) => [item.month, item.count]),
    ];
}

/**
 * Table – top sačuvani radovi
 * Format: [['Naslov', 'Broj sačuvavanja'], ['...', 14], ...]
 */
function buildTableData(topPapers) {
    return [
        ['Naslov rada', 'Broj sačuvavanja'],
        ...topPapers.map((item) => [item.title, item.saves_count]),
    ];
}

// ─── Opcije grafikona ─────────────────────────────────────────────────────────

const PIE_OPTIONS = {
    title: 'Projekti po naučnim oblastima',
    titleTextStyle: { fontSize: 16, bold: true, color: '#333' },
    pieHole: 0.4,         // donut stil
    legend: { position: 'right' },
    chartArea: { width: '85%', height: '80%' },
    colors: [
        '#3b82f6', '#9333ea', '#f59e0b',
        '#10b981', '#ef4444', '#8b5cf6', '#06b6d4',
    ],
};

const BAR_OPTIONS = {
    title: 'Eksperimenti po statusu',
    titleTextStyle: { fontSize: 16, bold: true, color: '#333' },
    legend: { position: 'none' },
    chartArea: { width: '70%', height: '75%' },
    hAxis: { title: 'Broj eksperimenata', minValue: 0 },
    vAxis: { title: 'Status' },
};

const COLUMN_OPTIONS = {
    title: 'Kreiranje projekata po mesecima',
    titleTextStyle: { fontSize: 16, bold: true, color: '#333' },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '70%' },
    vAxis: { title: 'Broj projekata', minValue: 0, format: '0' },
    hAxis: { title: 'Mesec' },
    colors: ['#3b82f6'],
    bar: { groupWidth: '60%' },
};

const TABLE_OPTIONS = {
    showRowNumber: true,
    width: '100%',
    height: '100%',
    cssClassNames: {
        headerRow: 'tableHeader',
        tableRow: 'tableRow',
        oddTableRow: 'oddTableRow',
    },
    sortColumn: 1,
    sortAscending: false,
};

// ─── Komponenta ───────────────────────────────────────────────────────────────

export function Statistics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usingMock, setUsingMock] = useState(false);

    useEffect(() => {
        axiosClient
            .get('/statistics')
            .then(({ data }) => {
                setStats(data);
                setUsingMock(false);
            })
            .catch((err) => {
                console.warn(
                    'Statistics API nije dostupan, koristim mock podatke:',
                    err.message
                );
                // Fallback na mock podatke dok backend nije implementiran
                setStats(MOCK_DATA);
                setUsingMock(true);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <CircularProgress size={60} />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    Učitavanje statistike...
                </Typography>
            </Box>
        );
    }

    if (!stats) return null;

    // Transformisati podatke za grafove
    const pieData    = buildPieData(stats.projects_by_category);
    const barData    = buildBarData(stats.experiments_by_status);
    const columnData = buildColumnData(stats.projects_by_month);
    const tableData  = buildTableData(stats.top_saved_papers);

    return (
        <Box>
            <PageHeader
                title="Statistike i vizualizacija"
                subtitle="Pregled istraživačke aktivnosti kroz grafičke prikaze."
            />

            {/* ─── Upozorenje ako se koriste mock podaci ─────────────────── */}
            {usingMock && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Prikazuju se demonstracioni podaci. Backend API nije dostupan.
                </Alert>
            )}

            {/* ─── Summary stat kartice ──────────────────────────────────── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Ukupno projekata"
                        value={stats.totals?.projects ?? 0}
                        icon={<FolderOpen sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Ukupno eksperimenata"
                        value={stats.totals?.experiments ?? 0}
                        icon={<Science sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Registrovanih korisnika"
                        value={stats.totals?.users ?? 0}
                        icon={<People sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Komada opreme"
                        value={stats.totals?.equipment ?? 0}
                        icon={<Build sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    />
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* ─── Red 1: Pie chart + Bar chart ──────────────────────────── */}
            <Grid container spacing={3} sx={{ mb: 3 }}>

                {/* PIE CHART – projekti po kategorijama */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Distribucija po naučnim oblastima
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Broj projekata po kategoriji
                            </Typography>
                            {pieData.length > 1 ? (
                                <Chart
                                    chartType="PieChart"
                                    data={pieData}
                                    options={PIE_OPTIONS}
                                    width="100%"
                                    height="320px"
                                    loader={
                                        <Box textAlign="center" py={4}>
                                            <CircularProgress size={32} />
                                        </Box>
                                    }
                                />
                            ) : (
                                <Box textAlign="center" py={6}>
                                    <Typography color="text.secondary">
                                        Nema podataka za prikaz
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* BAR CHART – eksperimenti po statusu */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Status eksperimenata
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Završeni vs. u toku
                            </Typography>
                            {barData.length > 1 ? (
                                <Chart
                                    chartType="BarChart"
                                    data={barData}
                                    options={BAR_OPTIONS}
                                    width="100%"
                                    height="320px"
                                    loader={
                                        <Box textAlign="center" py={4}>
                                            <CircularProgress size={32} />
                                        </Box>
                                    }
                                />
                            ) : (
                                <Box textAlign="center" py={6}>
                                    <Typography color="text.secondary">
                                        Nema podataka za prikaz
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ─── Red 2: Column chart + Table ───────────────────────────── */}
            <Grid container spacing={3}>

                {/* COLUMN CHART – projekti po mesecima */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Aktivnost kreiranja projekata
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Broj novih projekata po mesecima
                            </Typography>
                            {columnData.length > 1 ? (
                                <Chart
                                    chartType="ColumnChart"
                                    data={columnData}
                                    options={COLUMN_OPTIONS}
                                    width="100%"
                                    height="320px"
                                    loader={
                                        <Box textAlign="center" py={4}>
                                            <CircularProgress size={32} />
                                        </Box>
                                    }
                                />
                            ) : (
                                <Box textAlign="center" py={6}>
                                    <Typography color="text.secondary">
                                        Nema podataka za prikaz
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* TABLE CHART – top 5 sačuvanih radova */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                gutterBottom
                            >
                                Najpopularniji radovi
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Top 5 najsačuvanijih radova
                            </Typography>
                            {tableData.length > 1 ? (
                                <Chart
                                    chartType="Table"
                                    data={tableData}
                                    options={TABLE_OPTIONS}
                                    width="100%"
                                    height="320px"
                                    loader={
                                        <Box textAlign="center" py={4}>
                                            <CircularProgress size={32} />
                                        </Box>
                                    }
                                />
                            ) : (
                                <Box textAlign="center" py={6}>
                                    <Typography color="text.secondary">
                                        Nema podataka za prikaz
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ─── Napomena o API-ju ──────────────────────────────────────── */}
            <Box mt={3}>
                <Alert severity="success" variant="outlined">
                    <Typography variant="body2">
                        <strong>Google Charts API</strong> — Grafici koriste
                        Google Charts biblioteku ({' '}
                        <code>react-google-charts</code>). Podaci se vuku sa{' '}
                        <code>GET /api/statistics</code> endpoint-a.
                    </Typography>
                </Alert>
            </Box>
        </Box>
    );
}
