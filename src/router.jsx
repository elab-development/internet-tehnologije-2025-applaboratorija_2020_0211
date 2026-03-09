import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestLayout } from './layout/GuestLayout.jsx';
import { ProtectedRoute } from './context/ProtectedRoutes.jsx';
import { DefaultLayout } from './layout/DefaultLayout.jsx';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserHome } from './pages/UserHome.jsx';
import { ResearcherHome } from './pages/ResearcherHome.jsx';
import { AdminHome } from './pages/AdminHome.jsx';
import { Papers } from './pages/Papers.jsx';
import { PaperDetail } from './pages/PaperDetail.jsx';   // NOVO
import { SavedPapers } from './pages/SavedPapers.jsx';
import { Projects } from './pages/Projects.jsx';
import { Equipment } from './pages/Equipment.jsx';
import { Experiments } from './pages/Experiments.jsx';
import { Samples } from './pages/Samples.jsx';           // NOVO
import { Profile } from './pages/Profile.jsx';           // NOVO
import { Reports } from './pages/Reports.jsx';           // NOVO
import { Statistics } from './pages/Statistics.jsx';     // NOVO (Commit 3)

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
        element: (
            <ProtectedRoute allowedRoles={['admin', 'researcher', 'user']} />
        ),
        children: [
            {
                path: '',
                element: <DefaultLayout />,
                children: [
                    /* ========== USER ========== */
                    {
                        path: 'user',
                        children: [
                            { index: true, element: <UserHome /> },
                            { path: 'papers', element: <Papers /> },
                            { path: 'papers/:id', element: <PaperDetail /> }, // SK5
                            { path: 'saved-papers', element: <SavedPapers /> },
                            { path: 'profile', element: <Profile /> },        // SK10
                        ],
                    },

                    /* ========== RESEARCHER ========== */
                    {
                        path: 'researcher',
                        children: [
                            { index: true, element: <ResearcherHome /> },
                            { path: 'papers', element: <Papers /> },
                            { path: 'papers/:id', element: <PaperDetail /> }, // SK5
                            { path: 'saved-papers', element: <SavedPapers /> },
                            { path: 'projects', element: <Projects /> },
                            { path: 'experiments', element: <Experiments /> },
                            { path: 'equipment', element: <Equipment /> },
                            { path: 'samples', element: <Samples /> },        // SK24, SK25
                            { path: 'profile', element: <Profile /> },        // SK10
                            { path: 'statistics', element: <Statistics /> },  // Commit 3
                        ],
                    },

                    /* ========== ADMIN ========== */
                    {
                        path: 'admin',
                        children: [
                            { index: true, element: <AdminHome /> },
                            { path: 'papers', element: <Papers /> },           // Admin može videti radove
                            { path: 'papers/:id', element: <PaperDetail /> }, // SK5
                            { path: 'reports', element: <Reports /> },         // SK17
                            { path: 'profile', element: <Profile /> },         // SK10
                            { path: 'statistics', element: <Statistics /> },   // Commit 3
                        ],
                    },
                ],
            },
        ],
    },
]);

export default router;
