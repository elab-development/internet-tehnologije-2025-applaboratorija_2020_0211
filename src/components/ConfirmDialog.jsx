import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box } from '@mui/material';

/**
 * Reusable modal za potvrdu brisanja ili opasne akcije.
 * @param {boolean} open - Da li je modal otvoren
 * @param {string} title - Naslov modala
 * @param {string} message - Poruka unutar modala
 * @param {string} confirmLabel - Tekst na dugmetu za potvrdu (default: "Obriši")
 * @param {function} onConfirm - Callback na potvrdu
 * @param {function} onCancel - Callback na otkazivanje
 * @param {boolean} loading - Disable stanje dok se akcija izvršava
 */
export function ConfirmDialog({
    open,
    title = 'Potvrda akcije',
    message = 'Da li ste sigurni?',
    confirmLabel = 'Obriši',
    onConfirm,
    onCancel,
    loading = false,
}) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningAmberIcon color="warning" />
                    {title}
                </Box>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading} color="inherit">
                    Otkaži
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading}
                >
                    {loading ? 'Brisanje...' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
