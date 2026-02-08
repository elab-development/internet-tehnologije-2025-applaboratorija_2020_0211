import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Container,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FolderIcon from '@mui/icons-material/Folder';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';

import { useStateContext } from "../context/ContextProvider.jsx";

const DRAWER_WIDTH = 256;

const iconMap = {
    dashboard: DashboardIcon,
    papers: DescriptionIcon,
    'saved-papers': BookmarkIcon,
    projects: FolderIcon,
    experiments: ScienceIcon,
    equipment: BiotechIcon,
    users: PeopleIcon
};

export function DefaultLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { user, token, setToken, setUser } = useStateContext();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', roles: ['admin', 'researcher', 'user'], path: `/autenticate/${user?.role}` },
        { id: 'papers', label: 'Naučni radovi', roles: [ 'researcher', 'user'], path: `/autenticate/${user?.role}/papers` },
        { id: 'saved-papers', label: 'Sačuvani radovi', roles: ['researcher', 'user'], path: `/autenticate/${user?.role}/saved-papers` },
        { id: 'projects', label: 'Projekti', roles: [ 'researcher', ], path: `/autenticate/${user?.role}/projects` },
        { id: 'experiments', label: 'Eksperimenti', roles: [ 'researcher'], path: `/autenticate/${user?.role}/experiments` },
        { id: 'equipment', label: 'Oprema', roles: [ 'researcher',], path: `/autenticate/${user?.role}/equipment` },
    ];

    const visibleMenuItems = menuItems.filter((item) =>
        item.roles.includes(user?.role || '')
    );

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        navigate('/login');
        setAnchorEl(null);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const drawerContent = (
        <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List sx={{ p: 2 }}>
                {visibleMenuItems.map((item) => {
                    const IconComponent = iconMap[item.id];
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setSidebarOpen(false);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    ...(isActive && {
                                        background: 'linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)',
                                        color: 'white',
                                        '& .MuiListItemIcon-root': {
                                            color: 'white'
                                        },
                                        '&:hover': {
                                            background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                                        }
                                    })
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <IconComponent />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            sx={{ mr: 2, display: { lg: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ScienceIcon sx={{ color: 'white' }} />
                            </Box>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="h6" fontWeight={700} lineHeight={1}>
                                    ResearchHub
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Sistem za upravljanje istraživanjima
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                        onClick={handleMenuOpen}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                                fontSize: 14,
                                fontWeight: 600
                            }}
                        >
                            {user?.name?.[0] || user?.firstName?.[0]}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Typography variant="body2" fontWeight={500}>
                                {user?.name || `${user?.firstName} ${user?.lastName}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {user?.role}
                            </Typography>
                        </Box>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon sx={{ color: 'error.main' }}>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Odjavi se
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? sidebarOpen : true}
                onClose={() => setSidebarOpen(false)}
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                    },
                }}
                ModalProps={{ keepMounted: true }}
            >
                <Toolbar />
                {drawerContent}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'grey.50',
                    p: { xs: 2, sm: 3, md: 4 },
                    width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` }
                }}
            >
                <Toolbar />
                <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
}