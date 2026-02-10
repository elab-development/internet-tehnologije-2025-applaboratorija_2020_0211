import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import {useStateContext} from "./ContextProvider.jsx";

export function ProtectedRoute({ allowedRoles }) {
    const { user, token } = useStateContext();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/autenticate/${user.role}`} replace />;
    }

    return <Outlet />;
}
