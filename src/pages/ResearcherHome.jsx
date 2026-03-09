import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { FolderOpen, Science, Build } from '@mui/icons-material';
import { LinearProgress } from '@mui/material';
import { StatCard, PageHeader, EmptyState } from '../components/index.js';
import axiosClient from '../axiosClient.js';

export function ResearcherHome() {
    const [projects, setProjects] = useState([]);
    const [projectExperiments, setProjectExperiments] = useState({});
    const [equipment, setEquipment] = useState([]);

    const calculateProgress = (startDate, endDate) => {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (today >= end) return 100;
        if (today <= start) return 0;
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = today.getTime() - start.getTime();
        return Math.round((elapsed / totalDuration) * 100);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, equipmentRes] = await Promise.all([
                    axiosClient.get('/projects'),
                    axiosClient.get('/equipment'),
                ]);

                setProjects(projectsRes.data.data);
                setEquipment(equipmentRes.data.data);

                const experimentsData = {};
                await Promise.all(
                    projectsRes.data.data.map(async (project) => {
                        const res = await axiosClient.get(
                            `/projects/${project.id}/experiments`
                        );
                        experimentsData[project.id] = res.data.data;
                    })
                );
                setProjectExperiments(experimentsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []); // ← dependency array

    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalExperiments = Object.values(projectExperiments).flat().length;
    const availableEquipment = equipment.filter(
        (e) => e.status === 'available'
    ).length;

    const activeProjectsList = projects.filter((p) => p.status === 'active');

    return (
        <Box>
            {/* ✅ PageHeader */}
            <PageHeader
                title="Dashboard – Istraživač"
                subtitle="Pratite svoje projekte, eksperimente i rezervacije opreme."
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    {/* ✅ StatCard */}
                    <StatCard
                        title="Aktivni projekti"
                        value={activeProjects}
                        icon={<FolderOpen sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Eksperimenti"
                        value={totalExperiments}
                        icon={<Science sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Dostupna oprema"
                        value={availableEquipment}
                        icon={<Build sx={{ fontSize: 48 }} />}
                        gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Aktivni projekti
                        </Typography>

                        {activeProjectsList.length === 0 ? (
                            // ✅ EmptyState
                            <EmptyState
                                icon={<FolderOpen sx={{ fontSize: 48 }} />}
                                title="Nema aktivnih projekata"
                                subtitle='Kreirajte novi projekat u sekciji "Projekti".'
                            />
                        ) : (
                            activeProjectsList.map((project) => (
                                <Box key={project.id} sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={500}
                                    >
                                        {project.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Rukovodilac: {project.leader?.name}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={calculateProgress(
                                            project.start_date,
                                            project.end_date
                                        )}
                                        sx={{ mt: 1, borderRadius: 2 }}
                                    />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Eksperimenti:
                                    </Typography>
                                    {projectExperiments[project.id]?.length ===
                                    0 ? (
                                        <Typography
                                            variant="body2"
                                            color="text.disabled"
                                            sx={{ pl: 1 }}
                                        >
                                            Nema eksperimenata
                                        </Typography>
                                    ) : (
                                        projectExperiments[project.id]?.map(
                                            (exp) => (
                                                <Box
                                                    key={exp.id}
                                                    sx={{ pl: 2, mt: 0.5 }}
                                                >
                                                    <Typography variant="body2">
                                                        • {exp.name}
                                                    </Typography>
                                                </Box>
                                            )
                                        )
                                    )}
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
