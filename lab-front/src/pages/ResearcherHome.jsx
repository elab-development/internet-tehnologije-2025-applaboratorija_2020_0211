import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Paper,
    Typography,
} from "@mui/material";
import { FolderOpen, Science, Build } from "@mui/icons-material";
import axiosClient from "../axiosClient.js";

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
                    axiosClient.get("/projects"),
                    axiosClient.get("/equipment"),
                ]);

                setProjects(projectsRes.data.data);
                setEquipment(equipmentRes.data.data);

                const experimentsData = {};
                await Promise.all(
                    projectsRes.data.data.map(async (project) => {
                        const res = await axiosClient.get(`/projects/${project.id}/experiments`);
                        experimentsData[project.id] = res.data.data;
                    })
                );
                setProjectExperiments(experimentsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const activeProjects = projects.filter((p) => p.status === "active").length;
    const availableEquipment = equipment.filter((e) => e.status === "available").length;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard - Istraživač
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Dobrodošli! Pratite svoje projekte, eksperimente i rezervacije opreme.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4">{activeProjects}</Typography>
                                    <Typography variant="body2">Aktivni projekti</Typography>
                                </Box>
                                <FolderOpen sx={{ fontSize: 48, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4">{Object.values(projectExperiments).flat().length}</Typography>
                                    <Typography variant="body2">Eksperimenti</Typography>
                                </Box>
                                <Science sx={{ fontSize: 48, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4">{availableEquipment}</Typography>
                                    <Typography variant="body2">Dostupna oprema</Typography>
                                </Box>
                                <Build sx={{ fontSize: 48, opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Aktivni projekti
                        </Typography>
                        {projects.filter((p) => p.status === "active").length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Trenutno nema aktivnih projekata.
                            </Typography>
                        ) : (
                            projects
                                .filter((p) => p.status === "active")
                                .map((project) => (
                                    <Box key={project.id} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1">{project.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Rukovodilac: {project.leader.name}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculateProgress(project.start_date, project.end_date)}
                                            sx={{ mt: 1 }}
                                        />
                                        {/* Eksperimenti za ovaj projekat */}
                                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                            Eksperimenti:
                                        </Typography>
                                        {projectExperiments[project.id]?.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Trenutno nema eksperimenata za ovaj projekat.
                                            </Typography>
                                        ) : (
                                            projectExperiments[project.id]?.map((exp) => (
                                                <Box key={exp.id} sx={{ mb: 1, pl: 2 }}>
                                                    <Typography variant="body2">
                                                        {exp.name} • {exp.results || "U toku"}
                                                    </Typography>
                                                </Box>
                                            ))
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
