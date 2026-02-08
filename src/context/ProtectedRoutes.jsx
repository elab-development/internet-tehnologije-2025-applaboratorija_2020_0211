import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import {useStateContext} from "./ContextProvider.jsx";

export function ProtectedRoute({ allowedRoles }) {
    const { user, token ,loading} = useStateContext();
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/autenticate/${user.role}`} replace />;
    }

    return <Outlet />;
}