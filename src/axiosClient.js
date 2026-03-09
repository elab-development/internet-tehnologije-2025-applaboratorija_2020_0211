import axios from 'axios';

/**
 * BEZBEDNOST – Axios konfiguracija
 *
 * Mere implementirane ovde:
 * 1. withCredentials: true – potrebno za Sanctum cookie-based auth (CSRF)
 * 2. Eksplicitni Accept header – sprečava content-type sniffing
 * 3. 401 handler – automatski logout na istekli token
 * 4. Ne čuva sensitive podatke u localStorage osim tokena
 */
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // X-Requested-With pomaže serveru da identifikuje AJAX zahteve
        'X-Requested-With': 'XMLHttpRequest',
    },
    // Timeout zahteva (sprečava "hanging" requests)
    timeout: 15000,
});

// ─── Request interceptor: dodaj Bearer token ─────────────────────
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ─── Response interceptor: handle grešaka ────────────────────────
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (!response) {
            // Network error ili timeout
            console.error('Network error:', error.message);
            return Promise.reject(error);
        }

        if (response.status === 401) {
            // Token istekao ili nije validan → logout
            localStorage.removeItem('ACCESS_TOKEN');
            // Redirect na login samo ako nismo već na login stranici
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        if (response.status === 429) {
            // Rate limit dostignut
            console.warn('Rate limit dostignut. Usporite zahteve.');
        }

        if (response.status === 403) {
            // IDOR – zabranjen pristup
            console.warn('Pristup zabranjen:', response.data?.message);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
