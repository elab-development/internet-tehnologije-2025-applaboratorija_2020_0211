import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { Typography } from '@mui/material';
import {GuestLayout} from "./layout/GuestLayout.jsx";
import {ProtectedRoute} from "./context/ProtectedRoutes.jsx";
import {DefaultLayout} from "./layout/DefaultLayout.jsx";
import {UserHome} from "./pages/UserHome.jsx";
import {ResearcherHome} from "./pages/ResearcherHome.jsx";
import {AdminHome} from "./pages/AdminHome.jsx";
import {Papers} from "./pages/Papers.jsx";
import {SavedPapers} from "./pages/SavedPapers.jsx";
import {Projects} from "./pages/Projects.jsx";
import {Equipment} from "./pages/Equipment.jsx";
import {Experiments} from "./pages/Experiments.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { index: true, element: <Navigate to="/login" replace /> },
        ],
    },
    {
        path: '/autenticate',
        element: <ProtectedRoute allowedRoles={['admin', 'researcher', 'user']} />,
        children: [
            {
                path: '',
                element: <DefaultLayout />,
                children: [
                    {
                        path: 'user',
                        children: [
                            { index: true, element: <UserHome /> },
                            { path: 'papers', element: <Papers /> },
                            { path: 'saved-papers', element: <SavedPapers /> }
                        ],
                    },
                    {
                        path: 'researcher',
                        children: [
                            { index: true, element: <ResearcherHome /> },
                            { path: 'papers', element: <Papers /> },
                            { path: 'saved-papers', element: <SavedPapers /> },
                            { path: 'projects', element: <Projects /> },
                            { path: 'experiments', element: <Experiments /> },
                            { path: 'equipment', element: <Equipment /> },
                        ],
                    },
                    {
                        path: 'admin',
                        children: [
                            { index: true, element: <AdminHome /> },

                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;