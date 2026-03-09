import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

/**
 * Reusable select za sortiranje ili filtriranje liste.
 * @param {string} label - Label selekta
 * @param {string} value - Trenutno izabrana vrednost
 * @param {function} onChange - Callback kada se promeni vrednost
 * @param {Array<{value: string, label: string}>} options - Lista opcija
 * @param {string} size - MUI size prop ('small' | 'medium')
 */
export function SortSelect({ label, value, onChange, options = [], size = 'small' }) {
    return (
        <FormControl size={size} sx={{ minWidth: 180 }}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
